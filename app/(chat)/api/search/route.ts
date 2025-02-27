import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';

// This API is used to extract content from URLs, which will be appended to
// messages sent to the AI but will remain invisible to the user in the UI
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Clean the URL by removing trailing punctuation that might have been included
    // when parsing from text (e.g., "https://example.com." -> "https://example.com")
    const cleanedUrl = url.replace(/[.,;:!?)]$/, '');

    // Call jina.ai API to extract content from the URL
    const response = await fetch(`https://r.jina.ai/${cleanedUrl}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY || ''}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch content: ${response.statusText}` }, 
        { status: response.status }
      );
    }

    // Parse the jina.ai response
    const rawContent = await response.text();
    
    // Format the content for better readability
    let formattedContent = '';
    
    try {
      // Try to extract structured data if available
      // Jina.ai typically returns text with title, URL source, and markdown content
      const titleMatch = rawContent.match(/Title: (.*?)(\n|$)/);
      const urlMatch = rawContent.match(/URL Source: (.*?)(\n|$)/);
      const contentMatch = rawContent.match(/Markdown Content:\n([\s\S]*)/);
      
      const title = titleMatch ? titleMatch[1].trim() : '';
      const sourceUrl = urlMatch ? urlMatch[1].trim() : cleanedUrl;
      const markdownContent = contentMatch ? contentMatch[1].trim() : rawContent;
      
      // Format the content to make it clear to the AI but invisible to the user
      formattedContent = `
# ${title || 'Extracted Content from URL'}
Source: ${sourceUrl}

${markdownContent}
`.trim();
    } catch (error) {
      console.error('Error parsing Jina.ai response:', error);
      formattedContent = rawContent; // Fallback to raw content
    }
    
    return NextResponse.json({ content: formattedContent });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' }, 
      { status: 500 }
    );
  }
}
