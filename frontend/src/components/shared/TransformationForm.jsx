import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  
  const [form, setForm] = useState({
    title: data?.title || '',
    aspectRatio: data?.aspectRatio || '',
    color: data?.color || '',
    prompt: data?.prompt || '',
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement image transformation logic
      toast({
        title: "Success",
        description: `Image ${action.toLowerCase()}ed successfully`,
        duration: 5000,
      })
      
      navigate('/')
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {type === 'recolor' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Replacement Color</label>
            <Input
              placeholder="Enter replacement color"
              value={form.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="input-field"
            />
          </div>
        )}

        {type === 'fill' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Aspect Ratio</label>
            <select
              value={form.aspectRatio}
              onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
              className="select-field"
            >
              <option value="">Select aspect ratio</option>
              <option value="1:1">Square (1:1)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="9:16">Phone (9:16)</option>
            </select>
          </div>
        )}

        {/* Media Uploader Placeholder */}
        <div className="media-uploader-field">
          <div className="media-uploader_cta">
            <div className="media-uploader_cta-image">
              <img
                src="/assets/icons/add.svg"
                alt="Add Image"
                width={24}
                height={24}
              />
            </div>
            <p className="p-14-medium">Click here to upload image</p>
          </div>
        </div>

        {/* Transformed Image Placeholder */}
        <div className="transformed-placeholder">
          <div className="flex-center flex-col gap-4">
            <div className="w-10 h-10 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
            <p>Transformed Image</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Processing...' : `${action} Image`}
        </Button>
      </div>
    </form>
  )
}

export default TransformationForm
