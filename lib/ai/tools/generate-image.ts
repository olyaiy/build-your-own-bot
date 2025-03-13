import { tool } from 'ai';
import { z } from 'zod';
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
  description: 'Create an image from a prompt',
  parameters: z.object({
    prompt: z.string(),
  }),
  execute: async ({ prompt }) => {

    const { image } = await generateImage({
        model: openai.image('dall-e-3'),
        prompt: prompt,
      });
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `ai_generated_${timestamp}.png`;
      
      // Convert base64 to buffer
      const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
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

      return {
        url: publicUrl,
        pathname: filename,
        contentType: 'image/png'
      };
      
    } catch (error) {
      console.error('Error uploading image to R2:', error);
      throw new Error('Failed to upload generated image to R2');
    }
  },
});
