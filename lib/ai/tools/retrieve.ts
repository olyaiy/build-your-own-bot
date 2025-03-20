import { tool } from 'ai'
import { z } from 'zod'


export const retrieveSchema = z.object({
    url: z.string().describe('The url to retrieve')
  })

  export type SearchResultItem = {
    title: string
    url: string
    content: string
  }
  

  export type SearchResultsType = {
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

const CONTENT_CHARACTER_LIMIT = 10000

async function fetchJinaReaderData(
  url: string
): Promise<SearchResultsType | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-With-Generated-Alt': 'true'
      }
    })
    const json = await response.json()
    if (!json.data || json.data.length === 0) {
      return null
    }

    const content = json.data.content.slice(0, CONTENT_CHARACTER_LIMIT)

    return {
      results: [
        {
          title: json.data.title,
          content,
          url: json.data.url
        }
      ],
      query: '',
      images: []
    }
  } catch (error) {
    console.error('Jina Reader API error:', error)
    return null
  }
}


export const retrieveTool = tool({
  description: 'Retrieve content from the web',
  parameters: retrieveSchema,
  execute: async ({ url }) => {
    let results: SearchResultsType | null = null;

    // Use Jina if the API key is set, otherwise use Tavily
    const useJina = process.env.JINA_API_KEY
    if (useJina) {
      results = await fetchJinaReaderData(url)
    } 

    if (!results) {
      return {
        results: [],
        images: [],
        query: ''
      }
    }

    return results
  }
})
