/* eslint-disable @next/next/no-img-element */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { useEffect, useState } from 'react'
import { PlusCircle } from 'lucide-react'


export type SearchResultImage =
  | string
  | {
      url: string
      description: string
      number_of_results?: number
    }

interface SearchResultsImageSectionProps {
  images: SearchResultImage[]
  query?: string
}

export const SearchResultsImageSection: React.FC<
  SearchResultsImageSectionProps
> = ({ images, query }) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Update the current and count state when the carousel api is available
  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Scroll to the selected index
  useEffect(() => {
    if (api) {
      api.scrollTo(selectedIndex, true)
    }
  }, [api, selectedIndex])

  if (!images || images.length === 0) {
    return <div className="text-muted-foreground">No images found</div>
  }

  // If enabled the include_images_description is true, the images will be an array of { url: string, description: string }
  // Otherwise, the images will be an array of strings
  let convertedImages: { url: string; description: string }[] = []
  if (typeof images[0] === 'string') {
    convertedImages = (images as string[]).map(image => ({
      url: image,
      description: ''
    }))
  } else {
    convertedImages = images as { url: string; description: string }[]
  }

  return (
    <div className="flex flex-wrap gap-2">
      {convertedImages.slice(0, 4).map((image, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div
              className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.5rem)] aspect-video cursor-pointer relative"
              onClick={() => setSelectedIndex(index)}
            >
              <Card className="flex-1 h-full overflow-hidden transition-all duration-150 hover:shadow-md hover:scale-[1.02] hover:border-primary/50">
                <CardContent className="p-2 size-full relative group">
                  {image ? (
                    <>
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="size-full object-cover transition-transform duration-150 group-hover:scale-[1.05]"
                        onError={e =>
                          (e.currentTarget.src = '/images/placeholder-image.jpg')
                        }
                      />
                      {image.description && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end p-2">
                          <p className="text-xs text-white line-clamp-2">{image.description}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="size-full bg-muted animate-pulse" />
                  )}
                </CardContent>
              </Card>
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/30 rounded-md flex items-center justify-center text-white/80 text-sm transition-all duration-150 hover:bg-black/50 hover:text-white group">
                  <PlusCircle size={24} className="transition-transform duration-150 group-hover:scale-110" />
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Search Images</DialogTitle>
              <DialogDescription className="text-sm">{query}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Carousel
                setApi={setApi}
                className="w-full bg-muted max-h-[60vh]"
              >
                <CarouselContent>
                  {convertedImages.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div className="p-1 flex items-center justify-center h-full">
                        <img
                          src={img.url}
                          alt={`Image ${idx + 1}`}
                          className="size-full object-contain max-h-[60vh]"
                          onError={e =>
                            (e.currentTarget.src =
                              '/images/placeholder-image.jpg')
                          }
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="absolute inset-8 flex items-center justify-between p-4">
                  <CarouselPrevious className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Previous</span>
                  </CarouselPrevious>
                  <CarouselNext className="size-10 rounded-full shadow focus:outline-none">
                    <span className="sr-only">Next</span>
                  </CarouselNext>
                </div>
              </Carousel>
              <div className="py-2 text-center text-sm text-muted-foreground">
                {current} of {count}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
