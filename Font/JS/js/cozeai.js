//   <!-- https://www.coze.cn/open/docs/developer_guides/install_web_sdk#94325683 -->
  const cozeWebSDK = new CozeWebSDK.WebChatClient({
        // 智能体或应用基础设置
        config: {
            type: 'bot', // 类型：集成智能体设为'bot'，集成应用需设为'app'
            bot_id: '7617766026704650240', // 智能体ID
            isIframe: false, // 是否使用iframe方式打开聊天框
        },
        // 鉴权配置：设置鉴权方式、访问密钥及刷新逻辑
        auth: {
            type: 'token', 
            token: 'pat_EhtFSduYGcbzQ5CfvrtfpPGppIKhNCB0LopcglLyz3nSZLANZLuS8N4NO30FFo9x', // 访问密钥
            onRefreshToken: async () => 'pat_EhtFSduYGcbzQ5CfvrtfpPGppIKhNCB0LopcglLyz3nSZLANZLuS8N4NO30FFo9x' // 密钥过期时返回新密钥
        },
        // 用户信息配置
        userInfo: {
            id: 'liheng', // 用户ID
            url: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png', // 用户头像URL
            nickname: 'law-ai', // 用户昵称
        },
        // UI配置：控制聊天窗口的整体样式、功能显示及布局
        ui: {
            // 基础UI配置：应用图标、布局类型、语言及层级
            base: {
                icon: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png', // 应用图标URL
                layout: 'pc', // 布局类型：'pc'适配电脑端，'mobile'适配移动端
                lang: 'zh-CN', // 系统语言：'en'英文，'zh-CN'中文
                zIndex: 1000 // 聊天框层级
            },
            // 控制标题栏及关闭按钮显示
            header: {
                isShow: true, // 是否显示顶部标题栏
                isNeedClose: true, // 是否显示关闭按钮
            },
            // 控制右下角悬浮球显示
            asstBtn: {
                isNeed: true // 展示悬浮球
            },
            // 底部文案配置（修复：补充linkvars和footer的闭合括号+逗号）
            footer: {
                isShow: true, // 是否显示底部版权模块
                expressionText: 'Powered by {{name}} {{name1}}', // 底部显示的文本信息
                linkvars: {
                    name: {
                        text: 'Law-ai-app By liheng',
                        link: 'https://github.com/lmliheng/law-ai-app'
                    },
  
                } // 修复：补充linkvars的闭合括号
            }, // 修复：补充footer的闭合括号
            // 会话列表配置：控制会话列表显示
            conversations: {
                isNeed: true, // 是否需要显示会话列表
            },
            // 聊天框核心配置
            chatBot: {
                title: '法律', // 聊天框标题
                uploadable: true, // 是否支持文件上传
                width: 420, // PC端聊天框宽度（单位：px）
                
                isNeedAudio: true, // 是否支持语音功能
                isNeedFunctionCallMessage: true, // 是否显示工具调用消息
                isNeedAddNewConversation: true, // 是否支持新建会话
                isNeedQuote: true, // 是否支持消息引用
                // 消息评价
                feedback: {
                    isNeedFeedback: true, // 是否开启消息评价
                    feedbackPanel: {
                        title: '您对这个回答有什么看法？请告诉我们', // 反馈卡片顶部的引导文本，用于解释反馈目的
                        placeholder: '请详细描述您的问题...', // 反馈输入框提示文字
                        tags: [ // 反馈标签选项
                            {
                                label: '内容不够详细', // 标签文本
                                isNeedDetail: false, // 是否需要详细说明
                            },
                            {
                                label: '内容错误', // 标签文本
                                isNeedDetail: false, // 是否需要详细说明
                            },
                            {
                                label: '其他', // 标签文本
                                isNeedDetail: true, // 是否需要详细说明
                            },
                        ],
                    },
                },
            },
        },
    });