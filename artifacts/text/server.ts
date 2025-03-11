import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/models';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, dataStream, messages = [] }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: `Write about the given topic. Markdown is supported. Use headings wherever appropriate. Title: ${title}`,
      messages,
      experimental_transform: smoothStream({ chunking: 'word' }),

    });



    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, messages = [] }) => {
    let draftContent = '';

    let prompt = updateDocumentPrompt(document.content, 'text');
    prompt = prompt += `${description}`;

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: prompt,
      messages,
      experimental_transform: smoothStream({ chunking: 'word' }),
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;
        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
});
