'use server';

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function generateImage() {
    console.log('Generating image...');
  const result = await generateText({
    model: google('gemini-2.0-flash-exp'),
    providerOptions: {
      google: { responseModalities: ['TEXT', 'IMAGE'] },
    },
    prompt: 'Generate an image of a comic cat',
  });
  console.log(result);

  for (const file of result.files) {
    if (file.mimeType.startsWith('image/')) {
      // show the image
      console.log("file of results recieved");
    }
  }

  return result;
} 