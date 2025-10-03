import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Image from '@/components/ui/Image'
import { Link } from 'react-router-dom'
import Header from '@/components/shared/Header'
import TransformedImage from '@/components/shared/TransformedImage'
import { Button } from '@/components/ui/button'
import { getImageById } from '@/lib/services/imageService'
import { getImageSize } from '@/lib/utils'
import DeleteConfirmation from '@/components/shared/DeleteConfirmation'

const ImageDetails = () => {
  const { id } = useParams()
  const { user } = useUser()
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImage = async () => {
      if (id) {
        try {
          const imageData = await getImageById(id)
          setImage(imageData)
        } catch (error) {
          console.error('Error fetching image:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchImage()
  }, [id])

  if (loading) {
    return <div className="flex-center h-60">Loading...</div>
  }

  if (!image) {
    return <div className="flex-center h-60">Image not found</div>
  }

  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className="capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <div className="p-14-medium md:p-16-medium flex gap-2">
            <p className="text-dark-600">Prompt:</p>
            <p className="capitalize text-purple-400">{image.prompt}</p>
          </div>
        )}

        {image.color && (
          <div className="p-14-medium md:p-16-medium flex gap-2">
            <p className="text-dark-600">Color:</p>
            <p className="capitalize text-purple-400">{image.color}</p>
          </div>
        )}

        {image.aspectRatio && (
          <div className="p-14-medium md:p-16-medium flex gap-2">
            <p className="text-dark-600">Aspect Ratio:</p>
            <p className="capitalize text-purple-400">{image.aspectRatio}</p>
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, 'width')}
              height={getImageSize(image.transformationType, image, 'height')}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config}
            hasDownload={true}
          />
        </div>

        {user?.id === image.author.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link to={`/transformations/${image.id}/update`}>
                Update Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image.id} />
          </div>
        )}
      </section>
    </>
  )
}

export default ImageDetails
