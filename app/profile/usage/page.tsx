import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { getUserTransactions } from '@/lib/db/queries';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionTable from './transaction-table';

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }>;
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

  // Await the searchParams
  const resolvedParams = await searchParams;
  
  const page = resolvedParams?.page ? parseInt(resolvedParams.page) : 1;
  const validTypes = ["usage", "purchase", "refund", "promotional", "adjustment"] as const;
  const type = resolvedParams?.type && validTypes.includes(resolvedParams.type as any) 
    ? resolvedParams.type as typeof validTypes[number]
    : null;
  const startDate = resolvedParams?.startDate || null;
  const endDate = resolvedParams?.endDate || null;
  
  // Fetch user transactions with pagination and filters
  const { transactions, totalCount, pageCount } = await getUserTransactions(
    userId, 
    page, 
    10, 
    type, 
    startDate, 
    endDate
  );
  
  // Transform the data for the table
  const formattedTransactions = transactions.map((transaction) => {
    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || 'No description',
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
