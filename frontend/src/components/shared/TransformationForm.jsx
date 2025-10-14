// TransformationForm.jsx - FIXED VERSION WITHOUT getCldImageUrl
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@clerk/clerk-react'
import MediaUploader from './MediaUploader'
import TransformedImage from './TransformedImage'
import { transformationTypes } from '@/constants'

const TransformationForm = ({ 
  action, 
  userId, 
  type, 
  creditBalance, 
  config = null, 
  data = null 
}) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { getToken } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformationConfig, setTransformationConfig] = useState(config)
  const [publicId, setPublicId] = useState(data?.publicId || '')
  
  const [form, setForm] = useState({
    title: data?.title || '',
    aspectRatio: data?.aspectRatio || '',
    color: data?.color || '',
    prompt: data?.prompt || '',
  })

  const [image, setImage] = useState(
    data ? {
      publicId: data.publicId,
      width: data.width,
      height: data.height,
      secureURL: data.secureURL
    } : null
  )

  const [newTransformation, setNewTransformation] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  // Generate transformation URL manually
  const generateTransformationURL = (publicId, transformConfig) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
    
    let transformPart = ''
    
    switch (type) {
      case 'restore':
        transformPart = 'e_enhance'
        break
      case 'removeBackground':
        transformPart = 'e_background_removal'
        break
      case 'fill':
        const { aspectRatio } = form
        if (aspectRatio) {
          const [width, height] = aspectRatio.split(':')
          transformPart = `ar_${width}:${height},c_pad,b_gen_fill`
        }
        break
      case 'remove':
        if (form.prompt) {
          transformPart = `e_gen_remove:${encodeURIComponent(form.prompt)}`
        }
        break
      case 'recolor':
        if (form.prompt && form.color) {
          transformPart = `e_gen_recolor:prompt_${encodeURIComponent(form.prompt)};to_${encodeURIComponent(form.color)}`
        }
        break
      default:
        transformPart = ''
    }
    
    return transformPart ? `${baseUrl}/${transformPart}/${publicId}` : `${baseUrl}/${publicId}`
  }

  // Generate transformation config based on type and form data
  const generateTransformConfig = () => {
    const baseConfig = transformationTypes[type].config

    if (type === 'remove') {
      return {
        ...baseConfig,
        prompt: form.prompt
      }
    }

    if (type === 'recolor') {
      return {
        ...baseConfig,
        prompt: form.prompt,
        to: form.color
      }
    }

    if (type === 'fill') {
      return {
        ...baseConfig,
        aspectRatio: form.aspectRatio
      }
    }

    return baseConfig
  }

  const onSelectFieldHandler = (value, onChangeField) => {
    setForm(prev => ({
      ...prev,
      [onChangeField]: value
    }))

    setImage((prevState) => ({
      ...prevState,
      [onChangeField]: value,
    }))

    setNewTransformation(transformationTypes[type].config)
  }

  const onInputChangeHandler = (fieldName, value, type, onChangeField) => {
    setForm(prev => ({
      ...prev,
      [fieldName]: value
    }))

    // Debounce transformation for better performance
    setTimeout(() => {
      setNewTransformation(generateTransformConfig())
    }, 1000)
  }

  const onTransformHandler = async () => {
    if (!image || !form.title) {
      toast({
        title: "Error",
        description: "Please upload an image and provide a title",
        variant: "destructive",
      })
      return
    }

    // Validate required fields for each transformation type
    if (type === 'remove' && !form.prompt) {
      toast({
        title: "Error",
        description: "Please specify object to remove",
        variant: "destructive",
      })
      return
    }

    if (type === 'recolor' && (!form.prompt || !form.color)) {
      toast({
        title: "Error",
        description: "Please specify object to recolor and replacement color",
        variant: "destructive",
      })
      return
    }

    if (type === 'fill' && !form.aspectRatio) {
      toast({
        title: "Error",
        description: "Please select an aspect ratio",
        variant: "destructive",
      })
      return
    }

    setIsTransforming(true)

    try {
      const transformConfig = generateTransformConfig()
      
      // Generate transformation URL manually
      const transformedImageUrl = generateTransformationURL(image.publicId, transformConfig)

      const transformationData = {
        title: form.title,
        publicId: image.publicId,
        transformationType: type,
        width: image.width,
        height: image.height,
        config: transformConfig,
        secureURL: image.secureURL,
        transformationURL: transformedImageUrl,
        aspectRatio: form.aspectRatio,
        prompt: form.prompt,
        color: form.color,
      }

      setTransformationConfig(transformConfig)
      setNewTransformation(transformationData)

      toast({
        title: "Success",
        description: "Image transformed successfully",
      })

    } catch (error) {
      console.error('Transformation error:', error)
      toast({
        title: "Error",
        description: "Failed to transform image",
        variant: "destructive",
      })
    } finally {
      setIsTransforming(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!newTransformation) {
      toast({
        title: "Error",
        description: "Please transform the image first",
        variant: "destructive",
      })
      return
    }

    if (creditBalance < Math.abs(transformationTypes[type].creditFee)) {
      toast({
        title: "Insufficient Credits",
        description: "You don't have enough credits to perform this transformation",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = await getToken()
      
      const imageData = {
        title: form.title,
        publicId: image.publicId,
        transformationType: type,
        width: image.width,
        height: image.height,
        config: newTransformation.config,
        secureURL: image.secureURL,
        transformationURL: newTransformation.transformationURL,
        aspectRatio: form.aspectRatio,
        prompt: form.prompt,
        color: form.color,
        author: userId,
        creditFee: transformationTypes[type].creditFee
      }

      const response = await fetch(`${API_BASE_URL}/api/images`, {
        method: action === 'Add' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: imageData,
          userId,
          path: `/transformations/${type}`
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save image: ${response.status} - ${errorText}`)
      }

      const savedImage = await response.json()

      toast({
        title: "Success",
        description: `Image ${action.toLowerCase()}ed successfully`,
        duration: 5000,
      })
      
      navigate('/')
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            placeholder="Enter image title"
            value={form.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Type-specific fields */}
        {(type === 'remove' || type === 'recolor') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'remove' ? 'Object to remove' : 'Object to recolor'}
            </label>
            <Input
              placeholder={`Enter ${type === 'remove' ? 'object to remove' : 'object to recolor'}`}
              value={form.prompt}
              onChange={(e) => onInputChangeHandler('prompt', e.target.value, type, 'prompt')}
              className="input-field"
              required
            />
          </div>
        )}

        {type === 'recolor' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Replacement Color</label>
            <Input
              placeholder="Enter replacement color"
              value={form.color}
              onChange={(e) => onInputChangeHandler('color', e.target.value, type, 'color')}
              className="input-field"
              required
            />
          </div>
        )}

        {type === 'fill' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <select
              value={form.aspectRatio}
              onChange={(e) => onSelectFieldHandler(e.target.value, 'aspectRatio')}
              className="select-field"
              required
            >
              <option value="">Select aspect ratio</option>
              <option value="1:1">Square (1:1)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="9:16">Phone (9:16)</option>
            </select>
          </div>
        )}

        {/* Media Uploader */}
        <div className="media-uploader-field">
          <MediaUploader 
            onValueChange={setPublicId}
            setImage={setImage}
            image={image}
            publicId={publicId}
            type={type}
            transformationConfig={transformationConfig}
          />
        </div>

        {/* Transform Button */}
        {image && (
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={onTransformHandler}
              disabled={isTransforming}
              className="w-full gradient-button"
            >
              {isTransforming ? 'Transforming...' : `Apply ${transformationTypes[type]?.title}`}
            </Button>
          </div>
        )}

        {/* Transformed Image */}
        {newTransformation && (
          <div className="transformed-image-container">
            <TransformedImage
              image={newTransformation}
              type={type}
              title={form.title}
              isTransforming={isTransforming}
              transformationConfig={transformationConfig}
              hasDownload={true}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !newTransformation}
          className="submit-button"
        >
          {isSubmitting ? 'Saving...' : `${action} Image`}
        </Button>
      </div>
    </form>
  )
}

export default TransformationForm