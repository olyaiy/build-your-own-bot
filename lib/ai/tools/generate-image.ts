import { tool } from 'ai';
import { z } from 'zod';
import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';


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

    return image.base64;
  },
});
