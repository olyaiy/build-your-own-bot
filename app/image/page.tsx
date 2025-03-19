'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generateImageWithFal } from '@/app/actions';

// Define types to match the server action
type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "16:10" | "10:16" | "3:2" | "2:3" | "1:3" | "3:1";
type Style = "auto" | "general" | "realistic" | "design" | "render_3D" | "anime";

export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [style, setStyle] = useState<Style>('auto');
    const [expandPrompt, setExpandPrompt] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const aspectRatios: AspectRatio[] = [
        '1:1', '16:9', '9:16', '4:3', '3:4', '16:10', 
        '10:16', '3:2', '2:3', '1:3', '3:1'
    ];
    
    const styles: Style[] = ['auto', 'general', 'realistic', 'design', 'render_3D', 'anime'];

    async function handleGenerateImage() {
        try {
            setIsGenerating(true);
            const result = await generateImageWithFal(
                prompt,
                aspectRatio,
                style,
                expandPrompt
            );
            setResponse(result);
        } catch (error) {
            console.error('Error:', error);
            setResponse({ success: false, error: 'Failed to generate image' });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Fal AI Image Generation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="prompt">Prompt</Label>
                                <Input
                                    id="prompt"
                                    placeholder="Enter your prompt..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                                    <Select 
                                        value={aspectRatio} 
                                        onValueChange={(value: AspectRatio) => setAspectRatio(value)}
                                    >
                                        <SelectTrigger id="aspect-ratio">
                                            <SelectValue placeholder="Select aspect ratio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {aspectRatios.map(ratio => (
                                                <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div>
                                    <Label htmlFor="style">Style</Label>
                                    <Select 
                                        value={style} 
                                        onValueChange={(value: Style) => setStyle(value)}
                                    >
                                        <SelectTrigger id="style">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {styles.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="expand-prompt"
                                    checked={expandPrompt}
                                    onCheckedChange={setExpandPrompt}
                                />
                                <Label htmlFor="expand-prompt">Expand Prompt</Label>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleGenerateImage} 
                            disabled={isGenerating || !prompt}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : 'Generate Image'}
                        </Button>

                        {isGenerating && (
                            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center">
                                <p>Generating your image with Fal.ai/ideogram/v2/turbo...</p>
                            </div>
                        )}

                        {response && response.success && (
                            <Tabs defaultValue="image" className="mt-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="image">Image</TabsTrigger>
                                    <TabsTrigger value="response">API Response</TabsTrigger>
                                </TabsList>
                                <TabsContent value="image" className="mt-4">
                                    {response.response?.images?.[0]?.url && (
                                        <div className="flex flex-col items-center">
                                            <img 
                                                src={response.response.images[0].url} 
                                                alt={prompt}
                                                className="max-w-full rounded-md shadow-md"
                                            />
                                            <p className="mt-2 text-sm text-gray-500">
                                                Seed: {response.response.seed}
                                            </p>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="response" className="mt-4">
                                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[400px] text-sm">
                                        {JSON.stringify(response, null, 2)}
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        )}

                        {response && !response.success && (
                            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
                                <h3 className="text-lg font-medium mb-2">Error:</h3>
                                <pre className="overflow-auto max-h-[200px] text-sm">
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}