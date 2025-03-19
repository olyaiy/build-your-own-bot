import { tool } from 'ai';
import { z } from 'zod';

// Import fal the same way as in app/actions.ts
import { fal } from '@fal-ai/client';
fal.config({
    credentials: process.env.FAL_API_KEY
  });

  
export const generateLogo = tool({
  description: 'Generate a logo or image',
  parameters: z.object({
    prompt: z.string().describe('The text prompt describing the image to generate'),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4', '16:10', '10:16', '3:2', '2:3', '1:3', '3:1'])
      .default('1:1')
      .describe('The aspect ratio of the generated image'),
    style: z.enum(['auto', 'general', 'realistic', 'design', 'render_3D', 'anime'])
      .default('auto')
      .describe('The style of the generated image'),
    expandPrompt: z.boolean()
      .default(true)
      .describe('Whether to expand the prompt automatically'),
  }),
  execute: async ({ prompt, aspectRatio, style, expandPrompt }) => {
    try {
      // Using Fal's API directly with the passed parameters
      const result = await fal.subscribe("fal-ai/ideogram/v2/turbo", {
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          expand_prompt: false,
          style: style
        },
        logs: true,
      });
      
      // Based on the expected response structure
      if (result?.data?.images?.[0]?.url) {
        return {
          imageUrl: result.data.images[0].url,
          seed: result.data.seed
        };
      } else {
        return {
          error: "No image was generated"
        };
      }
    } catch (error) {
      console.error('Error generating logo:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred while generating logo'
      };
    }
  },
}); 