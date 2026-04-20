1. 流式输出需要使用fetch，但我不擅长，把之前的axios实例对象改成了axios默认对象配置，最好实现流式输出，现在不用了 有思考提示

2. 我禁止了主页面的滚动条,在index.html中添加以下代码 overflow: hidden; 取消app.vue的局部样式

3. 更新了左侧侧边栏的关闭和打开功能

4. 输入框更新了，模仿了元宝的输入框样式

5. 历史记录功能 + 本地存储功能 localstorage ai写的 solved

用户发送消息 
    ↓
AI 思考中 (isThinking = true)
    ↓
AI 回复中 (流式输出到 messages.value)
    ↓
回复完成 → resetState() 
    ↓
自动保存到 localStorage ← 新增
    ↓
下次打开页面 → loadHistoryFromStorage() 读取历史记录

7. 思考中 提示  solved







