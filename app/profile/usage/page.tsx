import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getUserTransactions } from '@/lib/db/queries';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionTable from './transaction-table';

export default async function UsagePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
            <CardDescription>
              Please sign in to view your usage history.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  
  // Fetch user transactions with pagination
  const { transactions, totalCount, pageCount } = await getUserTransactions(userId, page, 10);
  
  // Transform the data for the table
  const formattedTransactions = transactions.map((transaction) => {
    // Handle message content that might be an array of objects or a single object
    let messageContent = transaction.messageContent;
    
    try {
      // If the content is a string that represents an array or object, parse it
      if (typeof messageContent === 'string' && (messageContent.startsWith('[') || messageContent.startsWith('{'))) {
        const parsed = JSON.parse(messageContent);
        
        if (Array.isArray(parsed)) {
          // Process each item in the array
          const processedParts = parsed.map(part => {
            if (part.type === 'text' && part.text) {
              return part.text;
            } else if (part.type === 'tool-call' && part.toolName) {
              // Format tool call in a human-readable way
              let toolCall = `Tool: ${part.toolName}`;
              if (part.args && typeof part.args === 'object') {
                // Format the args as a condensed string
                const args = Object.entries(part.args)
                  .map(([key, value]) => `${key}: ${JSON.stringify(value).substring(0, 30)}${JSON.stringify(value).length > 30 ? '...' : ''}`)
                  .join(', ');
                
                if (args) {
                  toolCall += ` (${args})`;
                }
              }
              return toolCall;
            }
            return '';
          });
          
          messageContent = processedParts.filter(Boolean).join(' | ');
        } else if (parsed && typeof parsed === 'object') {
          // If it's a single object with text property
          if (parsed.type === 'text' && parsed.text) {
            messageContent = parsed.text;
          } else if (parsed.type === 'tool-call' && parsed.toolName) {
            messageContent = `Tool: ${parsed.toolName}`;
            if (parsed.args) {
              messageContent += ` (${JSON.stringify(parsed.args).substring(0, 50)}${JSON.stringify(parsed.args).length > 50 ? '...' : ''})`;
            }
          } else {
            messageContent = JSON.stringify(parsed);
          }
        }
      } else if (Array.isArray(messageContent)) {
        // If it's already an array (not a string)
        const processedParts = messageContent.map(part => {
          if (part && part.type === 'text' && part.text) {
            return part.text;
          } else if (part && part.type === 'tool-call' && part.toolName) {
            let toolCall = `Tool: ${part.toolName}`;
            if (part.args && typeof part.args === 'object') {
              const args = Object.entries(part.args)
                .map(([key, value]) => `${key}: ${JSON.stringify(value).substring(0, 30)}${JSON.stringify(value).length > 30 ? '...' : ''}`)
                .join(', ');
              
              if (args) {
                toolCall += ` (${args})`;
              }
            }
            return toolCall;
          }
          return '';
        });
        
        messageContent = processedParts.filter(Boolean).join(' | ');
      } else if (messageContent && typeof messageContent === 'object') {
        // If it's already an object (not an array or string)
        if ('text' in messageContent) {
          const textObj = messageContent as { text: string; type?: string };
          if (!textObj.type || textObj.type === 'text') {
            messageContent = textObj.text;
          }
        } else if ('toolName' in messageContent) {
          const toolCall = messageContent as { toolName: string; args?: Record<string, any>; type?: string };
          if (!toolCall.type || toolCall.type === 'tool-call') {
            messageContent = `Tool: ${toolCall.toolName}`;
            if (toolCall.args) {
              messageContent += ` (${JSON.stringify(toolCall.args).substring(0, 50)}${JSON.stringify(toolCall.args).length > 50 ? '...' : ''})`;
            }
          }
        } else {
          messageContent = JSON.stringify(messageContent);
        }
      }
    } catch (error) {
      // If JSON parsing fails, use the raw content or a fallback
      console.error('Error processing message content:', error);
    }
    
    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || 'No description',
      message: typeof messageContent === 'string' ? messageContent : 
               messageContent ? JSON.stringify(messageContent) : 'N/A',
      date: transaction.created_at,
      formattedDate: formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true }),
    };
  });

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            View your token usage and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading transactions...</div>}>
            <TransactionTable 
              transactions={formattedTransactions} 
              totalCount={totalCount} 
              currentPage={page} 
              pageCount={pageCount} 
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
