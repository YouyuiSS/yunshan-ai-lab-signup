import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  createSignup,
  deleteSignup,
  ensureDatabaseReady,
  listSignups,
  updateSignup,
} from './database.ts';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const app = express();
const apiRouter = express.Router();
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, '..');
const distDir = path.resolve(projectRoot, 'dist');
const port = Number(process.env.API_PORT || process.env.PORT || 8787);
const basePath = normalizeBasePath(process.env.APP_BASE_PATH);
const apiBasePath = joinBasePath(basePath, 'api');

function normalizeBasePath(value?: string): string {
  if (!value || value === '/') {
    return '/';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, '');
  return trimmed || '/';
}

function joinBasePath(prefix: string, suffix: string): string {
  return prefix === '/' ? `/${suffix}` : `${prefix}/${suffix}`;
}

apiRouter.use(express.json({ limit: '1mb' }));

apiRouter.get('/health', (_request, response) => {
  response.json({ ok: true });
});

apiRouter.get('/signups', async (_request, response, next) => {
  try {
    response.json(await listSignups());
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/signups', async (request, response, next) => {
  try {
    const signup = await createSignup(request.body as Record<string, unknown>, randomUUID());
    response.status(201).json(signup);
  } catch (error) {
    next(error);
  }
});

apiRouter.patch('/signups/:id', async (request, response, next) => {
  try {
    const signup = await updateSignup(request.params.id, request.body as Record<string, unknown>);

    if (!signup) {
      response.status(404).json({ message: '报名记录不存在' });
      return;
    }

    response.json(signup);
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/signups/:id', async (request, response, next) => {
  try {
    const deleted = await deleteSignup(request.params.id);

    if (!deleted) {
      response.status(404).json({ message: '报名记录不存在' });
      return;
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : '服务器出了点问题，请稍后重试';
  const statusCode = /不能为空|不合法|格式不正确|至少需要/.test(message) ? 400 : 500;

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({ message });
});

app.use(apiBasePath, apiRouter);

if (fs.existsSync(distDir)) {
  if (basePath === '/') {
    app.use(express.static(distDir));
  } else {
    app.use(basePath, express.static(distDir));
  }

  app.get('*', (request, response, next) => {
    if (request.path.startsWith(apiBasePath)) {
      next();
      return;
    }

    if (basePath !== '/' && !request.path.startsWith(basePath)) {
      next();
      return;
    }

    response.sendFile(path.join(distDir, 'index.html'));
  });
}

async function startServer(): Promise<void> {
  await ensureDatabaseReady();

  app.listen(port, () => {
    console.log(`AI 试验场服务已启动: http://127.0.0.1:${port}${basePath}`);
  });
}

startServer().catch((error) => {
  console.error('服务启动失败', error);
  process.exit(1);
});
