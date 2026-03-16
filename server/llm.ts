import {
  aiSuggestionAreas,
  isAiSuggestionArea,
  type AiAssistMode,
  type AiSuggestion,
  type AiSuggestionArea,
} from '../shared/ai.ts';

type OpenAiCompatibleConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

const defaultTimeoutMs = 20_000;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveOpenAiCompatibleConfig(): OpenAiCompatibleConfig | null {
  const apiKey = process.env.OPENAI_COMPAT_API_KEY?.trim();
  const baseUrl = process.env.OPENAI_COMPAT_BASE_URL?.trim();
  const model = process.env.OPENAI_COMPAT_MODEL?.trim();
  const timeoutMs = Number(process.env.OPENAI_COMPAT_TIMEOUT_MS || defaultTimeoutMs);

  if (!apiKey || !baseUrl || !model) {
    return null;
  }

  return {
    apiKey,
    baseUrl: trimTrailingSlash(baseUrl),
    model,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : defaultTimeoutMs,
  };
}

function getOpenAiCompatibleConfig(): OpenAiCompatibleConfig {
  const config = resolveOpenAiCompatibleConfig();

  if (!config) {
    throw new Error(
      'AI 助手尚未配置，请在 .env.local 中提供 OPENAI_COMPAT_BASE_URL、OPENAI_COMPAT_API_KEY 和 OPENAI_COMPAT_MODEL',
    );
  }

  return config;
}

function buildSystemPrompt(mode: AiAssistMode): string {
  const modeGuidance =
    mode === 'direction'
      ? `结合用户的方向兴趣、经验和参与方式，判断最合适的方向。
四个候选方向的定义如下：
- AI 情报站：关注工具、方法和趋势，筛出真正值得试的方向。
- 实验室：做工具解析、demo、教程和第一轮验证。
- 训练营 / IdeaHub：把问题和想法收进来，拉人一起共创推进。
- 效能学堂：萃取实战经验，输出最佳实践，为大家赋能。

suggestedArea 必须严格从这四个值中选择一个：${aiSuggestionAreas.join('、')}。`
      : '把用户的问题整理得更具体、更像一个可推进的问题陈述。suggestedArea 固定输出空字符串 ""。';

  return [
    '你是“奇点俱乐部”报名页里的中文 AI 助手。',
    modeGuidance,
    '请只输出一个 JSON 对象，不要输出 Markdown，不要加代码块。',
    'JSON 必须包含这五个字段：summary、suggestedArea、reason、nextStep、polishedProblem。',
    '每个字段都使用中文，简洁、友好、可执行，长度控制在 1 到 2 句话。',
  ].join('');
}

function extractJsonObject(rawContent: string): string {
  const start = rawContent.indexOf('{');
  const end = rawContent.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI 返回内容不是合法 JSON');
  }

  return rawContent.slice(start, end + 1);
}

function sanitizeSuggestion(payload: unknown): AiSuggestion {
  if (!payload || typeof payload !== 'object') {
    throw new Error('AI 返回结果格式不正确');
  }

  const record = payload as Record<string, unknown>;
  const summary = typeof record.summary === 'string' ? record.summary.trim() : '';
  const suggestedArea = typeof record.suggestedArea === 'string' ? record.suggestedArea.trim() : '';
  const reason = typeof record.reason === 'string' ? record.reason.trim() : '';
  const nextStep = typeof record.nextStep === 'string' ? record.nextStep.trim() : '';
  const polishedProblem = typeof record.polishedProblem === 'string' ? record.polishedProblem.trim() : '';

  if (!summary || !reason || !nextStep || !polishedProblem || (suggestedArea !== '' && !isAiSuggestionArea(suggestedArea))) {
    throw new Error('AI 返回结果缺少必要字段');
  }

  return {
    nextStep,
    polishedProblem,
    reason,
    suggestedArea: suggestedArea as AiSuggestionArea,
    summary,
  };
}

export function isAiAssistantConfigured(): boolean {
  return resolveOpenAiCompatibleConfig() !== null;
}

export async function generateAiSuggestion(input: string, mode: AiAssistMode): Promise<AiSuggestion> {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    throw new Error('AI 输入内容不能为空');
  }

  const config = getOpenAiCompatibleConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(mode),
          },
          {
            role: 'user',
            content: JSON.stringify({
              mode,
              input: normalizedInput,
            }),
          },
        ],
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    let payload: ChatCompletionResponse | null = null;

    try {
      payload = JSON.parse(rawText) as ChatCompletionResponse;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.error?.message?.trim() || rawText.trim() || 'LLM 请求失败';
      throw new Error(`AI 助手调用失败: ${message}`);
    }

    const content = payload?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('AI 没有返回可用内容');
    }

    return sanitizeSuggestion(JSON.parse(extractJsonObject(content)));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI 助手响应超时，请稍后重试');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
