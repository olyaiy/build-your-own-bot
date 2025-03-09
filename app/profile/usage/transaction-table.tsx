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
  const getTypeBadgeVariant = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case 'usage':
        return 'secondary';
      case 'purchase':
        return 'default';
      case 'refund':
        return 'destructive';
      case 'promotional':
        return 'outline';
      case 'adjustment':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Format amount to display in a user-friendly way with dollar sign
  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    const isNegative = numAmount < 0;
    return `${isNegative ? '-' : ''}$${Math.abs(numAmount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Function to determine text color based on amount (positive/negative)
  const getAmountColorClass = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return numAmount < 0 ? 'text-destructive' : 'text-emerald-600';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Message Content</TableHead>
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
                <TableRow key={transaction.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{transaction.formattedDate}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(transaction.type)} className="capitalize">
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${getAmountColorClass(transaction.amount)}`}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                    {transaction.description}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    {transaction.message === 'N/A' ? (
                      <span className="text-muted-foreground italic text-xs">N/A</span>
                    ) : (
                      <div className="max-h-[60px] overflow-hidden text-ellipsis line-clamp-2 text-xs bg-muted/30 p-1.5 rounded-sm">
                        {transaction.message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => navigator.clipboard.writeText(transaction.id)}
                          className="cursor-pointer"
                        >
                          Copy transaction ID
                        </DropdownMenuItem>
                        {transaction.message !== 'N/A' && (
                          <DropdownMenuItem 
                            onClick={() => navigator.clipboard.writeText(transaction.message)}
                            className="cursor-pointer"
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
        <Pagination className="mt-6">
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

      <div className="text-xs text-muted-foreground text-center">
        Showing {transactions.length} of {totalCount} transactions
      </div>
    </div>
  );
} 