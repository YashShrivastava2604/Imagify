import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/services/userService'
import { getImageById } from '@/lib/services/imageService'

const UpdateTransformation = () => {
  const { id } = useParams()
  const { user } = useUser()
  const [userData, setUserData] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && id) {
        try {
          const [userData, imageData] = await Promise.all([
            getUserById(user.id),
            getImageById(id)
          ])
          
          setUserData(userData)
          setImage(imageData)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user?.id, id])

  if (loading) {
    return <div className="flex-center h-60">Loading...</div>
  }

  if (!image) {
    return <div className="flex-center h-60">Image not found</div>
  }

  const transformation = transformationTypes[image.transformationType]

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={userData?.id}
          type={image.transformationType}
          creditBalance={userData?.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  )
}

export default UpdateTransformation
