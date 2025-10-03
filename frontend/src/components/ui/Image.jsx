import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Image = forwardRef(({ className, alt, ...props }, ref) => {
  return (
    <img
      className={cn("", className)}
      alt={alt}
      ref={ref}
      {...props}
    />
  )
})

Image.displayName = "Image"

export default Image
