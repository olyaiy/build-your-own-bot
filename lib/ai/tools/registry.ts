// lib/ai/tools/registry.ts
import { getWeather } from './get-weather';
import { createDocument } from './create-document';
import { updateDocument } from './update-document';
import { requestSuggestions } from './request-suggestions';
import { retrieveTool } from './retrieve';
import { searchTool } from './search';
import { Session } from 'next-auth';
import { DataStreamWriter, Message } from 'ai';

interface ToolRegistryProps {
  session?: Session;
  dataStream?: DataStreamWriter;
  messages?: Array<Message>;
}

export const toolRegistry = ({ session, dataStream, messages }: ToolRegistryProps = {}) => ({
  getWeather,
  createDocument: session && dataStream ? createDocument({ session, dataStream, messages }) : undefined,
  updateDocument: session && dataStream ? updateDocument({ session, dataStream, messages }) : undefined,
  requestSuggestions: session && dataStream ? requestSuggestions({ session, dataStream }) : undefined,
  retrieveTool,
  searchTool,
});