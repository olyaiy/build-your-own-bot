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
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TokenUsageProps {
  userId: string;
}

export async function TokenUsage({ userId }: TokenUsageProps) {



  // Safely fetch token usage data and handle potential errors
  let tokenUsageData = [];
  try {
    tokenUsageData = await getUserTokenUsage(userId) || [];
    console.log('THE TOKEN USAGE DATA IS .....', tokenUsageData);
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
  
  // Format currency
  const formatCost = (cost: number) => {
    // For very small amounts (less than 1 cent), show in a more readable format
    if (cost < 0.01) {
      // For extremely small amounts, show in scientific notation
      if (cost < 0.0001) {
        return `$${cost.toExponential(4)}`;
      }
      // For small but not tiny amounts, show more decimal places
      return `$${cost.toFixed(6)}`;
    }
    // For larger amounts (more than 1 cent), standard formatting is fine
    else if (cost < 1) {
      return `$${cost.toFixed(4)}`;
    }
    // For dollar amounts or more
    return `$${cost.toFixed(2)}`;
  };
  
  // Get provider badge color
  const getProviderColor = (provider: string) => {
    switch (provider?.toLowerCase() || '') {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800';
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'mistral':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold">Token Usage</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your AI model token consumption
          </CardDescription>
        </div>
        <Coins className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {tokenUsageData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Model</TableHead>
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
                    <TableCell className="text-right">{model.cost !== undefined ? formatCost(model.cost) : '-'}</TableCell>
                  </TableRow>
                );
              })}
              
              {/* Totals row */}
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(totalInputTokens)}</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(totalOutputTokens)}</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(grandTotal)}</TableCell>
                <TableCell className="text-right font-bold">{formatCost(totalCost)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-24 text-muted-foreground">
            No token usage data available
          </div>
        )}
      </CardContent>
    </Card>
  );
} 