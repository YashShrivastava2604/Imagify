import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Collection from '@/components/shared/Collection'
import { navLinks } from '@/constants'
import { getAllImages } from '@/lib/services/imageService'
import Image from '@/components/ui/Image'
import { Link } from 'react-router-dom'

const Home = () => {
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const searchQuery = searchParams.get('query') || ''
  
  const [images, setImages] = useState({ data: [], totalPage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const result = await getAllImages(page, searchQuery)
        setImages(result)
      } catch (error) {
        console.error('Error fetching images:', error)
        // Set empty data on error
        setImages({ data: [], totalPage: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [page, searchQuery])

  return (
    <>
      {/* Hero Section */}
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex justify-center items-center w-full gap-20 flex-wrap">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              to={link.route}
              className="flex flex-col items-center gap-2 group hover:scale-105 transition-transform"
            >
              <li className="flex justify-center items-center w-fit rounded-full bg-white p-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <Image
                  src={link.icon}
                  alt="image"
                  width={24}
                  height={24}
                />
              </li>
              <p className="p-14-medium text-center text-white font-semibold">
                {link.label}
              </p>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent Edits Section */}
      <section className="sm:mt-12">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <Collection
            hasSearch={true}
            images={images?.data || []}
            totalPages={images?.totalPage || 1}
            page={page}
          />
        )}
      </section>
    </>
  )
}

export default Home
