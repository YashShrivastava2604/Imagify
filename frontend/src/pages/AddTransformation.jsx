import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/services/userService'

const AddTransformation = () => {
  const { type } = useParams()
  const { user } = useUser()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const transformation = transformationTypes[type]

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        try {
          const userData = await getUserById(user.id)
          setUserData(userData)
        } catch (error) {
          console.error('Error fetching user:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUser()
  }, [user?.id])

  if (loading) {
    return <div className="flex-center h-60">Loading...</div>
  }

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={userData?.id}
          type={transformation.type}
          creditBalance={userData?.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformation