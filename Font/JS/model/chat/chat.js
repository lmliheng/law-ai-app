const API_BASE = 'http://127.0.0.1:3000';

const $messages = document.getElementById('messages');
const $input = document.getElementById('input');
const $sendBtn = document.getElementById('sendBtn');

function addMsg(text, who, meta) {
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  el.textContent = text || '';

  if (meta) {
    const m = document.createElement('div');
    m.className = 'meta';
    m.textContent = meta;
    el.appendChild(m);
  }

  $messages.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function getAssistantText(resp) {
  // 元器返回格式：choices[0].message.content 或 choices[0].delta.content(流式)
  const msg = resp?.choices?.[0]?.message;
  if (typeof msg?.content === 'string') return msg.content;
  if (Array.isArray(msg?.content)) {
    return msg.content
      .map((c) => (c?.type === 'text' ? c.text : ''))
      .filter(Boolean)
      .join('');
  }
  return '';
}

async function send() {
  const q = ($input.value || '').trim();
  if (!q) return;

  addMsg(q, 'me');
  $input.value = '';
  $sendBtn.disabled = true;
  const started = Date.now();

  try {
    const r = await fetch(`${API_BASE}/api/yuanqi/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q, user_id: 'web-user', stream: false })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.message || '请求失败');

    const text = getAssistantText(data) || JSON.stringify(data, null, 2);
    addMsg(text, 'bot', `耗时 ${(Date.now() - started) / 1000}s`);
  } catch (e) {
    addMsg(`请求失败：${e?.message || e}`, 'bot');
  } finally {
    $sendBtn.disabled = false;
  }
}

$sendBtn.addEventListener('click', send);
$input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

addMsg('已连接本机后端。请输入问题并发送。', 'bot');

