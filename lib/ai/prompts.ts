import { ArtifactKind } from '@/components/artifact/artifact';
import { isReasoningModel } from './models';

export const artifactsPrompt = `
// Your existing artifactsPrompt
`;

export const regularPrompt =
  'You are a friendly assistant! Keep your responses concise and helpful.';

// Search-specific instructions to add when search tool is available
export const searchPrompt = `
When you need to find current or specific information that might not be in your training data:
1. Use the search tool to look up recent information or verify facts
2. Formulate specific, targeted search queries
3. Extract the most relevant information from search results
4. Cite sources when providing information from search results
5. If search results are incomplete or unclear, consider refining your search query
6. Be transparent about limitations of search results
`;

// New function to get model-specific reasoning instructions
export const getReasoningInstructions = (modelId: string): string => {
  // Base reasoning instructions that work for all reasoning models
  const baseInstructions = `
  You are an AI assistant that helps users with complex reasoning tasks.
  `;

  // Model-specific instructions
  if (modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return `${baseInstructions}
    
    Additional instructions for OpenAI reasoning models:
    - Keep prompts simple and direct
    - Avoid chain-of-thought within your responses as you already do internal reasoning
    - Focus on providing clear, concise answers after your reasoning process

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
  
  15 * 17 = 255
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
  hasSearchTool = false,
}: {
  selectedChatModel: string;
  agentSystemPrompt?: string;
  hasSearchTool?: boolean;
}) => {
  const basePrompt = agentSystemPrompt || regularPrompt;
  let finalPrompt = basePrompt;
  
  // Add search instructions if the search tool is available
  if (hasSearchTool) {
    finalPrompt = `${finalPrompt}\n\n${searchPrompt}`;
  }
  
  if (isReasoningModel(selectedChatModel)) {
    // Get model-specific reasoning instructions
    const reasoningInstructions = getReasoningInstructions(selectedChatModel);
    
    return `${finalPrompt}
    
    ${reasoningInstructions}`;
  } else {
    return `${finalPrompt}\n\n${artifactsPrompt}`;
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
