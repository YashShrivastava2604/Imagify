import Image from '@/components/ui/Image'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CloudinaryContext, Image as CloudinaryImage } from 'cloudinary-react'
import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { transformationTypes } from '@/constants'
import { formUrlQuery } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Search from './Search'

const Collection = ({
  hasSearch = false,
  images,
  totalPages = 1,
  page,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const onPageChange = (action) => {
    const pageValue = action === 'next' ? Number(page) + 1 : Number(page) - 1

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: 'page',
      value: pageValue,
    })

    navigate(newUrl, { replace: true })
  }

  return (
    <CloudinaryContext cloudName={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            <Card image={image} key={image._id} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">Empty List</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1}
              className="collection-btn"
              onClick={() => onPageChange('prev')}
            >
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange('next')}
              disabled={Number(page) >= totalPages}
            >
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </CloudinaryContext>
  )
}

const Card = ({ image }) => {
  return (
    <li>
      <Link to={`/transformations/${image._id}`} className="collection-card">
        <CloudinaryImage
          publicId={image.publicId}
          alt={image.title}
          width={image.width}
          height={image.height}
          crop="fill"
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          {...image.config}
        />

        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">
            {image.title}
          </p>
          <Image
            src={transformationTypes[image.transformationType].icon}
            alt={image.title}
            width={24}
            height={24}
          />
        </div>
      </Link>
    </li>
  )
}

export default Collection
