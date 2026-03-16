

const ipt = document.getElementById('ipt');
const reply = document.getElementById('reply');
const endpoint = 'https://api.coze.cn/open_api/v1/chat';
// DOM 2 
ipt.addEventListener('change',async function(event) {
  const prompt = event.target.value;
  console.log('用户输入 prompt:', prompt);

  const payload = {
    bot_id: 7617766026704650240,
    user: 'yvo',
    query: prompt,
    chat_history:[],
    stream: false,
    custom_variables: {
      prompt: '你是一个AI助手'
    }
  }

  console.log('配置payload:', payload);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer cztei_hE9Y42wPnaTi9g5g8AwW9jareldY0Gk90hXgHNdloe3uDGhQ2obotiyVum374qZX1`
    },
    body: JSON.stringify(payload)
  })
  const data = await response.json();
  console.log(data, '////');
  // reply.innerHTML = data.messages[1].content;
  reply.innerHTML=marked.parse(data.messages.find(item => item.type === 'answer').content);
})