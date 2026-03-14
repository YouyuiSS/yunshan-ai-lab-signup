export const aiSuggestionAreas = [
  'AI 情报站',
  '实验室',
  '训练营 / IdeaHub',
  '工具引入与共创开发',
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
