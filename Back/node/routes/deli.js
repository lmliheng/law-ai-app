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
            const err = new Error(`得理接口调用失败(${res.statusCode})`);
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

function getDeliHeaders() {
  // 注意：请使用你在 open.delilegal.com 申请到的 appid/secret
  const appid = mustGetEnv('DELI_APPID');
  const secret = mustGetEnv('DELI_SECRET');
  return { appid, secret };
}

// 类案检索
// 手册接口：/api/qa/v3/search/queryListCase
router.post('/cases', async (req, res) => {
  try {
    const { query, pageNo, pageSize, sortField, sortOrder, condition } = req.body ?? {};
    const keywordArr =
      Array.isArray(condition?.keywordArr)
        ? condition.keywordArr
        : typeof query === 'string' && query.trim()
          ? [query.trim()]
          : [];

    const body = {
      pageNo: Number.isFinite(Number(pageNo)) ? Number(pageNo) : 1,
      pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 3,
      sortField: sortField || 'correlation',
      sortOrder: sortOrder || 'desc',
      condition: {
        ...(condition ?? {}),
        keywordArr
      }
    };

    const r = await postJson(
      'https://openapi.delilegal.com/api/qa/v3/search/queryListCase',
      getDeliHeaders(),
      body
    );
    res.json(r.data);
  } catch (e) {
    res.status(500).json({
      message: '得理类案检索失败',
      error: e?.message,
      detail: e?.data
    });
  }
});

// 法规检索
// 手册接口：/api/qa/v3/search/queryListLaw
router.post('/laws', async (req, res) => {
  try {
    const { query, pageNo, pageSize, sortField, sortOrder, condition } = req.body ?? {};
    const keywords =
      Array.isArray(condition?.keywords)
        ? condition.keywords
        : typeof query === 'string' && query.trim()
          ? [query.trim()]
          : [];

    const body = {
      pageNo: Number.isFinite(Number(pageNo)) ? Number(pageNo) : 1,
      pageSize: Number.isFinite(Number(pageSize)) ? Number(pageSize) : 5,
      sortField: sortField || 'correlation',
      sortOrder: sortOrder || 'desc',
      condition: {
        ...(condition ?? {}),
        keywords
      }
    };

    const r = await postJson(
      'https://openapi.delilegal.com/api/qa/v3/search/queryListLaw',
      getDeliHeaders(),
      body
    );
    res.json(r.data);
  } catch (e) {
    res.status(500).json({
      message: '得理法规检索失败',
      error: e?.message,
      detail: e?.data
    });
  }
});

module.exports = router;
