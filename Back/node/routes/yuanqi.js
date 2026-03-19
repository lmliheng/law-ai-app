const express = require('express');
const https = require('https');

const router = express.Router();

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`缺少环境变量：${name}`);
  return v;
}

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body ?? {});

    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers
        }
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (_) {
            // keep raw string
          }
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            const err = new Error(`元器接口调用失败(${res.statusCode})`);
            err.status = res.statusCode;
            err.data = parsed;
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getYuanqiConfig() {
  const assistant_id = mustGetEnv('YUANQI_ASSISTANT_ID'); // 元器文档：assistant_id 填 appid
  const appkey = mustGetEnv('YUANQI_APPKEY'); // Bearer token
  const apiBase = process.env.YUANQI_API_BASE || 'https://yuanqi.tencent.com';
  return { assistant_id, appkey, apiBase };
}

// 统一聊天入口：把用户问题交给“元器智能体（内含得理检索工作流）”
router.post('/chat', async (req, res) => {
  try {
    const { query, user_id, stream, messages } = req.body ?? {};
    const { assistant_id, appkey, apiBase } = getYuanqiConfig();

    const finalMessages =
      Array.isArray(messages) && messages.length
        ? messages
        : [
            {
              role: 'user',
              content: [{ type: 'text', text: typeof query === 'string' ? query : '' }]
            }
          ];

    const body = {
      assistant_id,
      user_id: user_id || 'local-user',
      stream: Boolean(stream ?? false),
      messages: finalMessages
    };

    const r = await postJson(
      `${apiBase.replace(/\/+$/, '')}/openapi/v1/agent/chat/completions`,
      {
        // 元器示例中有时会带这个头；加上兼容性更好
        'X-Source': 'openapi',
        Authorization: `Bearer ${appkey}`
      },
      body
    );
    res.json(r.data);
  } catch (e) {
    res.status(500).json({
      message: '元器调用失败',
      error: e?.message,
      detail: e?.data
    });
  }
});

module.exports = router;

