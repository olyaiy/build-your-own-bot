// lib/ai/tools/registry.ts
import { getWeather } from './get-weather';
import { createDocument } from './create-document';
import { updateDocument } from './update-document';
import { requestSuggestions } from './request-suggestions';
import { retrieveTool } from './retrieve';
import { searchTool } from './search';
import { Session } from 'next-auth';
import { DataStreamWriter, Message } from 'ai';
import { createImage } from './generate-image';
interface ToolRegistryProps {
  session?: Session;
  dataStream?: DataStreamWriter;
}

export const toolRegistry = ({ session, dataStream }: ToolRegistryProps = {}) => ({
  getWeather,
  createDocument: session && dataStream ? createDocument({ session, dataStream }) : undefined,
  updateDocument: session && dataStream ? updateDocument({ session, dataStream }) : undefined,
  requestSuggestions: session && dataStream ? requestSuggestions({ session, dataStream }) : undefined,
  retrieveTool,
  searchTool,
  createImage,
});