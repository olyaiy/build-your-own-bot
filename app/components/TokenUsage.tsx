import { getUserTokenUsage } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coins, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define the interface for the token usage data returned by the API
interface ModelUsage {
  modelName: string;
  provider?: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  costPerMillionInputTokens?: number | null;
  costPerMillionOutputTokens?: number | null;
}

interface TokenUsageProps {
  userId: string;
}

export async function TokenUsage({ userId }: TokenUsageProps) {
  // Safely fetch token usage data and handle potential errors
  let tokenUsageData: ModelUsage[] = [];
  try {
    tokenUsageData = await getUserTokenUsage(userId) || [];
  } catch (error) {
    console.error('Error fetching token usage data:', error);
    // Continue with empty array if there's an error
  }

  // Calculate totals only if we have data
  const totalInputTokens = tokenUsageData.length > 0 
    ? tokenUsageData.reduce((sum, model) => sum + model.inputTokens, 0)
    : 0;
    
  const totalOutputTokens = tokenUsageData.length > 0
    ? tokenUsageData.reduce((sum, model) => sum + model.outputTokens, 0)
    : 0;
    
  const totalCost = tokenUsageData.length > 0
    ? tokenUsageData.reduce((sum, model) => sum + (model.cost || 0), 0)
    : 0;
    
  const grandTotal = totalInputTokens + totalOutputTokens;
  
  // Format numbers with commas
  const formatNumber = (num: number) => num.toLocaleString();
  
  // Format cost as USD currency
  const formatCost = (cost: number) => {
    if (cost === 0) return '$0.00';
    
    // If cost is very small, use a more precise format
    if (cost < 0.01) {
      return `$${cost.toFixed(4)}`;
    }
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cost);
  };
  
  // Helper to determine badge color by provider
  const getProviderColor = (provider: string) => {
    const lowerProvider = provider.toLowerCase();
    
    if (lowerProvider.includes('claude') || lowerProvider.includes('anthropic')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    
    if (lowerProvider.includes('gpt') || lowerProvider.includes('openai')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    
    if (lowerProvider.includes('gemini') || lowerProvider.includes('google')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Coins className="size-5 text-muted-foreground" />
            <CardTitle>Token Usage</CardTitle>
          </div>
          <Link href="/profile/usage" passHref>
            <Button variant="outline" size="sm" className="gap-1">
              <span>View Details</span>
              <ExternalLink className="size-4" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Your API usage and estimated costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Input Tokens</div>
            <div className="text-2xl font-semibold">{formatNumber(totalInputTokens)}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Output Tokens</div>
            <div className="text-2xl font-semibold">{formatNumber(totalOutputTokens)}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground mb-1">Estimated Cost</div>
            <div className="text-2xl font-semibold">{formatCost(totalCost)}</div>
          </div>
        </div>

        {tokenUsageData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Input Tokens</TableHead>
                <TableHead className="text-right">Output Tokens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokenUsageData.map((model, index) => {
                const modelTotal = model.inputTokens + model.outputTokens;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{model.modelName}</span>
                        {model.provider && (
                          <Badge className={`w-fit mt-1 ${getProviderColor(model.provider)}`} variant="outline">
                            {model.provider}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(model.inputTokens)}</TableCell>
                    <TableCell className="text-right">{formatNumber(model.outputTokens)}</TableCell>
                    <TableCell className="text-right">{formatNumber(modelTotal)}</TableCell>
                    <TableCell className="text-right">{formatCost(model.cost)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No token usage data available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 