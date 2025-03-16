import { tool, experimental_generateImage as generateImage } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fal } from '@ai-sdk/fal';



// Initialize the S3 client with Cloudflare R2 credentials
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export const createImage = tool({
  description: 'Create one or more images from a prompt',
  parameters: z.object({
    prompt: z.string(),
    n: z.number().optional().default(1).describe('Number of images to generate (default: 1)'),
  }),
  execute: async ({ prompt, n = 1 }) => {
    try {
      // Generate the image(s)
      const { images } = await generateImage({
        model: fal.image('fal-ai/flux-pro/v1.1-ultra'),
        prompt: prompt,
        n: n,
      });
      
      const results = [];
      
      // Process each generated image
      for (const image of images) {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 10000);
          const filename = `ai_generated_${timestamp}_${randomSuffix}.png`;
          
          // Extract image dimensions from metadata if available
          const buffer = Buffer.from(image.uint8Array);
          // TEMPORARY FIX: Add dummy dimensions to satisfy type validation
          const { width = 1024, height = 1024 } = image as any;
          
          // Upload the image to Cloudflare R2
          const putCommand = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: 'image/png',
          });

          await s3Client.send(putCommand);
          
          // Create a direct URL to the R2 public bucket
          const publicUrl = `https://pub-8ddd283c539f458b8f9ee190cb5cbbdd.r2.dev/${filename}`;
          console.log(`Uploaded image to R2: ${publicUrl}`);

          results.push({
            url: publicUrl,
            pathname: filename,
            contentType: 'image/png'
          });
          
        } catch (error) {
          console.error('Error uploading image to R2:', error);
          throw new Error('Failed to upload generated image to R2');
        }
      }
      
      // If there's only one result, return it directly for backward compatibility
      return n === 1 ? results[0] : results;
    } catch (error) {
      console.error('Error in image generation process:', error);
      
      // Return a structured error response
      return {
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error in image generation',
        details: error instanceof Error && error.cause ? error.cause : undefined
      };
    }
  },
});
