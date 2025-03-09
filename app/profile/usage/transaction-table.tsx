'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

type Transaction = {
  id: string;
  amount: string;
  type: string;
  description: string;
  message: string;
  date: Date;
  formattedDate: string;
};

interface TransactionTableProps {
  transactions: Transaction[];
  totalCount: number;
  currentPage: number;
  pageCount: number;
}

export default function TransactionTable({
  transactions,
  totalCount,
  currentPage,
  pageCount,
}: TransactionTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Function to handle page change
  const handlePageChange = (page: number) => {
    router.push(`${pathname}?page=${page}`);
  };

  // Function to get type badge color
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'usage':
        return 'secondary';
      case 'purchase':
        return 'default';
      case 'refund':
        return 'destructive';
      case 'promotional':
        return 'success';
      case 'adjustment':
        return 'warning';
      default:
        return 'outline';
    }
  };

  // Format amount to display in a user-friendly way
  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 9
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Message Content</TableHead>
              <TableHead className="sr-only">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{transaction.formattedDate}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(transaction.type)}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                    {transaction.description}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    {transaction.message === 'N/A' ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : (
                      <div className="max-h-[60px] overflow-hidden text-ellipsis line-clamp-2 text-xs">
                        {transaction.message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => navigator.clipboard.writeText(transaction.id)}
                        >
                          Copy transaction ID
                        </DropdownMenuItem>
                        {transaction.message !== 'N/A' && (
                          <DropdownMenuItem 
                            onClick={() => navigator.clipboard.writeText(transaction.message)}
                          >
                            Copy message content
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }} 
                />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              // Show current page and a few pages around it
              let pageNum = i + 1;
              if (currentPage > 3) {
                if (pageCount > 5 && i === 0) {
                  return (
                    <PaginationItem key={1}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (pageCount > 5 && i === 1) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                if (i >= 2) {
                  pageNum = currentPage + i - 2;
                  if (pageNum > pageCount) return null;
                }
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    isActive={pageNum === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {currentPage < pageCount - 2 && pageCount > 5 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage < pageCount - 1 && pageCount > 5 && (
              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageCount);
                  }}
                >
                  {pageCount}
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage < pageCount && (
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }} 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-xs text-muted-foreground">
        Showing {transactions.length} of {totalCount} transactions
      </div>
    </div>
  );
} 