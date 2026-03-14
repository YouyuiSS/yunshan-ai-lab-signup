<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 奇点俱乐部报名页

包含报名页、管理端，以及一个可接 OpenAI 兼容接口的 AI 辅助填写能力。

## 本地运行

前置条件：Node.js

1. 安装依赖：`npm install`
2. 复制环境变量模板：`cp .env.example .env.local`
3. 配置数据库连接
4. 如果需要启用 AI 辅助，再补充以下环境变量：
   `OPENAI_COMPAT_BASE_URL`
   `OPENAI_COMPAT_API_KEY`
   `OPENAI_COMPAT_MODEL`
5. 启动前端：`npm run dev`
6. 启动后端：`npm run dev:server`

## AI 配置说明

项目里的“AI 帮我判断”和“AI 帮我整理一下”现在都会走服务端代理，再调用 OpenAI 兼容的 `/chat/completions` 接口。

- `OPENAI_COMPAT_BASE_URL`
  例如 `https://api.openai.com/v1`
- `OPENAI_COMPAT_API_KEY`
  对应服务的 API Key
- `OPENAI_COMPAT_MODEL`
  例如 `gpt-4o-mini`，或者你自己的兼容模型名
- `OPENAI_COMPAT_TIMEOUT_MS`
  可选，默认 `20000`

如果没有配置这些变量，报名页仍可正常使用，只是 AI 辅助按钮会提示未配置。
