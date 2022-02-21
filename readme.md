# 麦尼匿名聊天

​	一个可以快速接入到任何项目&网页的IM即时聊天项目. [前往体验](http://175.178.102.32/money-chat/index)

![image-20220219194032194](readme.assets/image-20220219194032194.png)

## 环境

1. 编程语言 node.js 12.18.1
2. Web框架 express 4.17.1
3. 模板引擎 art-template 4.13.2
4. 实时应用框架 socket.io 2.3.0

## 模块

总共分为三个模块 **服务端程序**、**客户端JS框架**、**用户交互UI**

## 接入方式

无论哪种方式都需要启动服务端程序，即当前项目。

1. git clone
2. npm install
3. node .\money-chat-app.js

### 整套使用

 **服务端程序**+**客户端JS框架**+**用户交互UI**：就是体验看到

启动项目后，在自己的其他项目js部分加入如下代码。该聊天室是`无状态的`，但是可以把接入系统用户登录后的名称、用户名和头像信息通过`login`方法传入来固定名称和头像，则对于该聊天室用户来说看到的就是固定的这些用户信息。

~~~js
function MoneyChatDriver(url='http://localhost:3001/driver/1.0.0') {
	fetch(url).then(res => res.json()).then(json => {
		document.body.insertAdjacentHTML('beforeend', json.html);
		let src = document.createElement('script');
		src.innerHTML = json.js;
		document.body.appendChild(src);
	});
}
MoneyChatDriver()
// 登录：将接入系统登录信息传入即可显示对应名称和头像
moneychat.login(name, username, avatar, callback(name, username))
~~~

### 自定义UI

 **服务端程序**+**客户端JS框架**~~+**用户交互UI**~~

仅引入JS，通过提供的API获取聊天、用户等信息，自己画UI渲染：**参考API文档**

~~~html
<script src="{basePath}/public/core/moneychat-base-1.0"></script>
~~~

### 直接嵌入式

整套使用的原理其实就是**通过Ajax请求获取js和html再添加到当前页面**，所以其实可以在任何网页使用，比如哔哩哔哩打开F12，执行那段js，你就可以在哔哩哔哩页面看得聊天框了。

![image-20220219193752315](readme.assets/image-20220219193752315.png)

> 一些网站用不了：如百度、Github

## 功能

### 好友列表

1. 当前在线（已完成）

2. 好友（已完成）

3. 聊天室（已完成）

   > 1. 默认有个世界群聊
   > 2. 点击群聊图标，输入一样的号码进入到同一个房间

### 聊天方式

1. 私聊（已完成）
2. 群聊（已完成）

### 聊天功能

1. 文字&Unicode表情符号（已完成）
   - 字符串
2. 表情包、图片、文件
   1. 先上传
   2. 生成url
   3. 发送
3. 视频
   - 使用URL，放入video标签

### 其他功能

1. 缓存（已完成）

   - 无缓存：每次刷新都是全新的账号 **cache: false**
   - sessionStorage：同个标签页缓存，刷新是同一个账号，当前标签页聊天记录依旧存在。**cache: true, cacheLevel: 1(开启缓存默认)**
   - localStorage：同个浏览器缓存，刷新是同一个账号，当前浏览器聊天记录依旧在。**cache: true, cacheLevel: 2**

   **注：**是否缓存聊天记录 `saveChatHistory:true`默认为开，需开缓存才有效，否则只缓存好友和聊天室

   > 如果在money.login(name, username)的时候提供了名称name和账号username，那刷新还是这对名称和账号.

# 默认UI模板：HTML占用元素

如下是当整套使用时，嵌入的UI使用的元素选择器或属性，尽量不要和被嵌入界面选择器冲突，不然样式可能会影响到。特殊属性是**客户端JS框架**默认绑定了一些事件的属性，可以灵活使用放在被嵌入界面的标签上。

- 主盒子 #MoneyChat
- 聊天盒子 #moneyBox
  - #mcMinBox 简略界面
  - #mcBox 列表界面
    - #searchResult 搜索结果
- 聊天主界面 #chatWindow
  - #chatBoxList 聊天窗口列表（缓存聊天记录其实就是缓存列表里所有的窗口）
    - .chatBox 聊天窗口
  - #chatTool 工具行
  - #moneyChatInput 输入框
  - #sendGo 发送按钮
- 扩展框 #ext
  - 加入/创建聊天室

**特殊属性：**

- mc-name 自己名字（初始化会给有这个属性的标签内容改为你的名字）
- mc-user 存放唯一标识username或者room
- mc-user-name 存放昵称
- mc-room 代表是聊天室

# API文档

对于不喜欢我搞得界面UI，可以只引入**客户端JS框架**，通过API获取聊天的交互信息，API十分简单，且返回都是JSON对象。可以根据这些去自己写前端和UI交互。

## 引入依赖JS文件

~~~html
<script src="{basePath}/mc/socket.io.js"></script>
<script src="{basePath}/public/core/moneychat.js"></script>
~~~

或者

~~~html
<script src="{basePath}/public/core/moneychat-base-1.0"></script>
~~~

## 初始化

~~~js
const moneychat = new MoneyChat({
        path: '', // 服务端请求路径
        autoConnect: true, // 是否自动连接，关闭后需手动使用open()打开连接
        cache: false, // 是否缓存，配合cacheLevel
        cacheLevel: 1, // 1：sessionStorage, 2: localStorage
        saveChatHistory: true, // 是否缓存聊天记录,
        tools: ['emoji', 'image', 'video', 'html'], // 聊天工具
        defaultNameFun: this.randomName, // 提供一个生成默认名称的算法
        loadCacheCallback: '', // 提供一个获取缓存后的回调方法，function loadCache(cache) cache: 缓存的数据
});
~~~

## 属性

![image-20220219195407655](readme.assets/image-20220219195407655.png)

### 套接字 socket

### 用户名 username

获取唯一的username，初始化后就生成了默认的。在调用login函数时可更改，所以在login函数后获取的username才是当前使用的。

### 状态 status

- ‘online‘ ：上线
- ‘offLine’：离线

### 配置 config

一个json对象，可对MoneyChat进行配置，配置参数：

- **path**：*‘’*, // ws服务器所在地址
- **autoConnect**: *true*, // 是否自动连接，关闭后需手动使用open()打开连接
- **cache**: *false*, // 是否缓存，配合cacheLevel
- **cacheLevel**: *1*, // 1：sessionStorage, 2: localStorage
- **saveChatHistory**: *true*, // 是否缓存聊天记录,
- **tools**: *['emoji', 'image', 'video', 'html']*, // 聊天工具
- **defaultNameFun**: *this.randomName*, // 提供一个生成默认名称的算法
-  **loadCacheCallback**: *''*, // 提供一个获取缓存后的回调方法，function loadCache(cache) cache: 缓存的数据

## 开启/上线

**login(name，username，avatar, callback(name, username))**

- name：昵称，默认：通过defaultNameFun的方法生成，默认是 *‘代号‘+时间戳*
- username：唯一标识，默认：*随机id*
- avatar：头像url
- callback(name, username)：登录成功后的回调函数，带有参数name和username
- return: name 返回昵称

> 在接入自己项目的时候，昵称和账户可由原本的项目登录返回的信息赋值，就可保证每次用户使用的是同一个。但username必须是唯一的

## 开启

**open()**

开启socket，仅接收信息

## 关闭

**close()**

关闭后将不再接收任何信息

## 发送消息（私聊）

文本消息：

**send(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

多媒体消息：

**sendMulti(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

## 发送消息（群聊）

文本消息：

**sendToRoom(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

多媒体消息：

**sendMultiToRoom(msg, recv = [])**

- msg：消息内容
- Array recv：接收对象（单个直接传入接收者username，会帮忙封装为数组）

## 加入聊天室

**joinRoom(room)**

- room: 聊天室名

## 离开聊天室

**leaveRoom(room)**

- room: 聊天室名

## 事件监听

**addEventListener(type, callback(msg))**

- type: 事件类型
- callback(msg): 监听回调
  - msg：通常是json类型

例：

~~~js
// 监听用户上线消息
moneychat.addEventListener('online', (msg) => {
    // 返回数组，第一次是所有当前在线用户，接下来每次有人登录都会收到信息
})
// 监听用户下线消息
moneychat.addEventListener('offline', (msg) => {
    // 有人离线
})
// 监听系统消息
moneychat.addEventListener('sys', (msg) => {})
// 监听私聊消息
moneychat.addEventListener('private', (msg) => {})
// 监听群聊消息
moneychat.addEventListener('room', (msg) => {})
~~~

## 查看/修改当前配置

**config(key , value)**

- 不传参数则返回当前配置
- 根据key，value进行配置修改

## 自定义随机昵称

默认：

~~~js
function randomName() {
    return '代号' + Math.floor(Math.random() * 1000000000)
}
~~~

自定义配置方式

- 初始化时赋值配置`defaultNameFun: yourFunctionName`
- 使用`moneyChat.config('defaultNameFun', loadCache)`方式配置

## 自定义加载缓存

1. 创建方法`loadCache(cache)`

   ~~~js
   // function loadCache([friends, rooms, chatHistroy]) {
   function loadCache(cache) {
       let friends = cache.friends; // 获取缓存中的好友 [{username:'',name:''}]
       let rooms = cache.rooms; // 获取缓存中的聊天室 ['room1', 'room2']
       let chatHistory = cache.chatHistory; // 获取缓存中的聊天记录 html文本(所有的.chatBox节点)
       //自定义操作
       ...
   }
   ~~~

2. 进行配置  config.loadCacheCallback
   - 方式一：初始化时赋值`loadCacheCallback: yourFunctionName`
   - 方式二：使用`moneyChat.config('loadCacheCallback', loadCache)`方式配置
