import { CloudinaryContext, Image as CloudinaryImage } from 'cloudinary-react'
import { download } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TransformedImage = ({
  image,
  type,
  title,
  isTransforming,
  transformationConfig,
  hasDownload = false,
}) => {
  const downloadHandler = (e) => {
    e.preventDefault()
    download(image.transformationUrl || image.secureURL, title)
  }

  return (
    <CloudinaryContext cloudName={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}>
      <div className="flex flex-col gap-4">
        <div className="flex-between">
          <h3 className="h3-bold text-dark-600">Transformed</h3>
          {hasDownload && (
            <Button
              className="download-btn"
              onClick={downloadHandler}
            >
              Download
            </Button>
          )}
        </div>

        {image?.publicId && transformationConfig ? (
          <div className="relative">
            {isTransforming && (
              <div className="transforming-loader">
                <div className="loader"></div>
                <p className="text-white/80">Please wait...</p>
              </div>
            )}
            <CloudinaryImage
              width={image.width}
              height={image.height}
              publicId={image.publicId}
              alt={image.title}
              className="transformed-image"
              {...transformationConfig}
            />
          </div>
        ) : (
          <div className="transformed-placeholder">
            <div className="flex-center flex-col gap-4">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
              <p>Transformed Image</p>
            </div>
          </div>
        )}
      </div>
    </CloudinaryContext>
  )
}

export default TransformedImage
