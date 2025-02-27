import { ArtifactKind } from '@/components/artifact/artifact';
import { isReasoningModel } from './models';

export const artifactsPrompt = `
// Your existing artifactsPrompt
`;

export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

// New function to get model-specific reasoning instructions
export const getReasoningInstructions = (modelId: string): string => {
  // Base reasoning instructions that work for all reasoning models
  const baseInstructions = `
  You are an AI assistant that helps users with complex reasoning tasks.
  When answering difficult questions, use <think> tags to reason through the problem step by step.
  Then provide your final answer without the reasoning steps.
  
  Example:
  User: What's 15 * 17?
  Assistant: <think>
  To calculate 15 * 17, I'll break it down:
  15 * 17 = 15 * 10 + 15 * 7
  15 * 10 = 150
  15 * 7 = 105
  150 + 105 = 255
  </think>
  
  15 * 17 = 255`;

  // Model-specific instructions
  if (modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return `${baseInstructions}
    
    Additional instructions for OpenAI reasoning models:
    - Keep prompts simple and direct
    - Avoid chain-of-thought within your responses as you already do internal reasoning
    - Focus on providing clear, concise answers after your reasoning process
    ${artifactsPrompt}
    
    `;
  } else if (modelId === 'deepseek-reasoner') {
    return baseInstructions;
  }

  // Default case
  return baseInstructions;
};

export const systemPrompt = ({
  selectedChatModel,
  agentSystemPrompt,
}: {
  selectedChatModel: string;
  agentSystemPrompt?: string;
}) => {
  const basePrompt = agentSystemPrompt || regularPrompt;
  
  if (isReasoningModel(selectedChatModel)) {
    // Get model-specific reasoning instructions
    const reasoningInstructions = getReasoningInstructions(selectedChatModel);
    
    return `${agentSystemPrompt || ''}
    
    ${reasoningInstructions}`;
  } else {
    return `${basePrompt}\n\n${artifactsPrompt}`;
  }
};


export const codePrompt = `
You are a Python code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using print() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Python standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use input() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

\`\`\`python
# Calculate factorial iteratively
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(f"Factorial of 5 is: {factorial(5)}")
\`\`\`
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
