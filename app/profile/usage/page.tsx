import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getUserTransactions } from '@/lib/db/queries';
import { formatDistanceToNow } from 'date-fns';
import TransactionTable from './transaction-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const formattedTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description || 'No description',
    message: transaction.messageContent || 'N/A',
    date: transaction.created_at,
    formattedDate: formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true }),
  }));

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
