export type SearchResults = {
  images: SearchResultImage[]
  results: SearchResultItem[]
  number_of_results?: number
  query: string
}


export type SearchResultImage =
  | string
  | {
      url: string
      description: string
      number_of_results?: number
    }


  export type SearchResultItem = {
    title: string
    url: string
    content: string
}