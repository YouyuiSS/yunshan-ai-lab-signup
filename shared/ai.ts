export const aiSuggestionAreas = [
  'AI情报站',
  '实验室',
  'IdeaHub训练营',
  'AI赋能落地',
] as const;

export type AiSuggestionArea = (typeof aiSuggestionAreas)[number];
export type AiAssistMode = 'direction' | 'problem';

export type AiSuggestion = {
  nextStep: string;
  polishedProblem: string;
  reason: string;
  suggestedArea: AiSuggestionArea;
  summary: string;
};

export type AiSuggestionRequest = {
  input: string;
  mode: AiAssistMode;
};

export function isAiSuggestionArea(value: unknown): value is AiSuggestionArea {
  return aiSuggestionAreas.some((item) => item === value);
}
