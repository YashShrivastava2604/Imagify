import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import Image from '@/components/ui/Image'
import Collection from '@/components/shared/Collection'
import Header from '@/components/shared/Header'
import { getUserImages } from '@/lib/services/imageService'
import { getUserById } from '@/lib/services/userService'

const Profile = () => {
  const { user } = useUser()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  
  const [userData, setUserData] = useState(null)
  const [images, setImages] = useState({ data: [], totalPages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const [userData, imagesData] = await Promise.all([
            getUserById(user.id),
            getUserImages(page, user.id)
          ])
          
          setUserData(userData)
          setImages(imagesData)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchData()
  }, [user?.id, page])

  if (loading) {
    return <div className="flex-center h-60">Loading...</div>
  }

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{userData?.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  )
}

export default Profile
