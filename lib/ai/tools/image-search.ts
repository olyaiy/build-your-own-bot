import { z } from 'zod'
import { tool } from 'ai'
import { SearchResults } from '@/lib/types'

const imageSearchSchema = z.object({
  query: z.string().min(1).describe("Search query for images"),
  country: z.enum(['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'KR', 'IN']).default('US').optional().describe("2-letter country code"),
  search_lang: z.enum(['en', 'fr', 'de', 'ja', 'ko', 'zh', 'es']).default('en').optional().describe("Search language"),
  count: z.number().min(1).max(100).default(20).optional().describe("Number of results to return"),
  safesearch: z.enum(['off', 'strict']).default('strict').optional().describe("Filter for adult content")
})

export const imageSearchTool = tool({
  description: 'Search images using Brave Image API',
  parameters: imageSearchSchema,
  execute: async ({ query, country, search_lang, count, safesearch }) => {
    const apiKey = process.env.BRAVE_API_KEY
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY is not set in environment variables')
    }

    const baseUrl = 'https://api.search.brave.com/res/v1/images/search'
    const params = new URLSearchParams({
      q: query,
      ...(country && { country }),
      ...(search_lang && { search_lang }),
      ...(count && { count: count.toString() }),
      ...(safesearch && { safesearch }),
      spellcheck: '1'
    })

    try {
      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Brave API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      const results = data.results.map((imageItem: any) => ({
        title: imageItem.title,
        url: imageItem.url,
        content: '',
        metadata: {
          source: imageItem.source || '',
          date: imageItem.page_fetched,
          thumbnail: imageItem.thumbnail?.src || '',
        },
        type: 'image' // Type to distinguish from other search results
      })) as SearchResults['results']

      // Separate array for images to match the SearchResults type
      const images = data.results.map((imageItem: any) => ({
        src: imageItem.thumbnail?.src || '',
        alt: imageItem.title,
        url: imageItem.url,
        properties: imageItem.properties
      }))

      return {
        results,
        query: data.query.original,
        number_of_results: results.length,
        images
      } as SearchResults

    } catch (error) {
      console.error('Brave Image API error:', error)
      return {
        results: [],
        query,
        number_of_results: 0,
        images: []
      }
    }
  }
})

// Utility function for direct API access
export async function braveImageSearch(
  query: string,
  country?: z.infer<typeof imageSearchSchema>['country'],
  searchLang?: z.infer<typeof imageSearchSchema>['search_lang'],
  count: number = 20,
  safesearch?: z.infer<typeof imageSearchSchema>['safesearch']
): Promise<SearchResults> {
  return imageSearchTool.execute(
    { query, country, search_lang: searchLang, count, safesearch },
    { toolCallId: 'imageSearch', messages: [] }
  )
} 