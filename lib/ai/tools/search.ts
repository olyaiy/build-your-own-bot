
import { searchSchema } from '@/lib/schema/search'
import {
  SearchResultImage,
} from '@/lib/ai/tools/retrieve'
import { sanitizeUrl } from '@/lib/utils'
import { tool } from 'ai'
import { SearchResults } from '@/lib/types'

export const searchTool = tool({
  description: 'Search the web for information',
  parameters: searchSchema,
  execute: async ({
    query,
    max_results,
    search_depth,
    include_domains,
    exclude_domains
  }) => {

    console.log('🔍 SEARCH TOOL CALLED --------------------------------')

    console.log('QUERY:', query)
    console.log('MAX RESULTS:', max_results)
    console.log('SEARCH DEPTH:', search_depth)
    console.log('INCLUDE DOMAINS:', include_domains)
    console.log('EXCLUDE DOMAINS:', exclude_domains)

    // Tavily API requires a minimum of 5 characters in the query
    const filledQuery =
      query.length < 5 ? query + ' '.repeat(5 - query.length) : query
    let searchResult: SearchResults


    try {
      searchResult = await tavilySearch(
        filledQuery,
        max_results,
        search_depth === 'advanced' ? 'advanced' : 'basic',
        include_domains,
        exclude_domains
      )
    } catch (error) {
      console.error('Tavily API error:', error)
      searchResult = {
        results: [],
        query: filledQuery,
        images: [],
        number_of_results: 0
      }
    }

    console.log('🔍 SEARCH TOOL COMPLETED --------------------------------')
    console.log('SEARCH RESULT:', searchResult)
    console.log('--------------------------------------------------------')
    return searchResult
  }
})

export async function search(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  return searchTool.execute(
    {
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    },
    {
      toolCallId: 'search',
      messages: []
    }
  )
}

async function tavilySearch(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not set in the environment variables')
  }
  const includeImageDescriptions = true
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: includeImageDescriptions,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    })
  })

  if (!response.ok) {
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const processedImages = includeImageDescriptions
    ? data.images
        .map(({ url, description }: { url: string; description: string }) => ({
          url: sanitizeUrl(url),
          description
        }))
        .filter(
          (
            image: SearchResultImage
          ): image is { url: string; description: string } =>
            typeof image === 'object' &&
            image.description !== undefined &&
            image.description !== ''
        )
    : data.images.map((url: string) => sanitizeUrl(url))

  return {
    ...data,
    images: processedImages
  }
}
