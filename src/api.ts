import type {
  SignupFormData,
  SignupRecord,
  SignupUpdatePayload,
} from '../shared/signups.ts';
import type { AiSuggestion, AiSuggestionRequest } from '../shared/ai.ts';

const apiBasePath = `${import.meta.env.BASE_URL}api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBasePath}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = '请求失败，请稍后重试';

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // ignore malformed error body
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const signupsApi = {
  create(payload: SignupFormData) {
    return request<SignupRecord>('/signups', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },
  list() {
    return request<SignupRecord[]>('/signups');
  },
  remove(id: string) {
    return request<void>(`/signups/${id}`, {
      method: 'DELETE',
    });
  },
  update(id: string, payload: SignupUpdatePayload) {
    return request<SignupRecord>(`/signups/${id}`, {
      body: JSON.stringify(payload),
      method: 'PATCH',
    });
  },
};

export const aiApi = {
  suggest(payload: AiSuggestionRequest) {
    return request<AiSuggestion>('/ai/suggestions', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },
};
