'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, ChevronDown, FilterIcon, XCircleIcon } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

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
  const searchParams = useSearchParams();

  // Filter state
  const [type, setType] = useState<string | null>(searchParams.get('type') || null);
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate') && isValid(parseISO(searchParams.get('startDate') || '')) 
      ? parseISO(searchParams.get('startDate') || '') 
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate') && isValid(parseISO(searchParams.get('endDate') || '')) 
      ? parseISO(searchParams.get('endDate') || '') 
      : undefined
  );
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove type filter
    if (type && type !== 'all') {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    
    // Update or remove date filters
    if (startDate) {
      params.set('startDate', format(startDate, 'yyyy-MM-dd'));
    } else {
      params.delete('startDate');
    }
    
    if (endDate) {
      params.set('endDate', format(endDate, 'yyyy-MM-dd'));
    } else {
      params.delete('endDate');
    }
    
    // Reset to first page when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setType(null);
    setStartDate(undefined);
    setEndDate(undefined);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('startDate');
    params.delete('endDate');
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Function to format dates for display
  const formatDateString = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  // Count active filters
  const activeFilterCount = [
    type,
    startDate,
    endDate
  ].filter(Boolean).length;

  // Function to handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
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
      {/* Filters Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="flex items-center gap-1 text-sm"
          >
            <FilterIcon className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full text-xs h-5 min-w-5 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs text-muted-foreground flex items-center gap-1"
            >
              <XCircleIcon className="size-3.5" />
              Reset
            </Button>
          )}
          
          {/* Active filters display */}
          <div className="hidden md:flex gap-2 items-center">
            {type && (
              <Badge variant="outline" className="flex gap-1 items-center pl-2">
                Type: <span className="capitalize">{type}</span>
                <XCircleIcon 
                  className="size-3.5 ml-1 cursor-pointer" 
                  onClick={() => {
                    setType(null);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('type');
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              </Badge>
            )}
            
            {(startDate || endDate) && (
              <Badge variant="outline" className="flex gap-1 items-center pl-2">
                Date: {startDate ? formatDateString(startDate) : '...'} 
                {endDate ? ` - ${formatDateString(endDate)}` : ''}
                <XCircleIcon 
                  className="size-3.5 ml-1 cursor-pointer" 
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('startDate');
                    params.delete('endDate');
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter UI */}
      {isFiltersVisible && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Transaction Type</Label>
                <Select 
                  value={type || 'all'} 
                  onValueChange={(value) => setType(value === 'all' ? null : value)}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range Filter - Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {startDate ? format(startDate, 'MMM dd, yyyy') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Range Filter - End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {endDate ? format(endDate, 'MMM dd, yyyy') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={date => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                        <Button variant="ghost" size="icon" className="size-8">
                          <ChevronDown className="size-4" />
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