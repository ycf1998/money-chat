# Money聊天室

## 环境

1. 编程语言 node.js 12.18.1
2. Web框架 express 4.17.1
3. 模板引擎 art-template 4.13.2
4. 实时应用框架 socket.io 2.3.0

## 功能

### 好友列表

1. 当前在线（已完成）
2. 好友（已完成）
3. 聊天室（已完成）

### 聊天方式

1. 私聊（已完成）
2. 群聊（已完成）

### 聊天功能

1. 文字&Unicode表情符号
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
   - sessionStorage：同个标签页缓存，刷新是同一个账号（名称会不同）**cache: true, cacheLevel: 1(开启缓存默认)**
   - localStorage：同个浏览器缓存，刷新是同一个账号（名称会不同）**cache: true, cacheLevel: 2**

   **注：**是否缓存聊天记录 `saveChatHistory:true`默认为开，需开缓存才有效，否则只缓存好友和聊天室

   > 如果在money.login(name, username)的时候提供了名称name和账号username，那刷新还是这对名称和账号.


## HTML占用元素

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



## socket.io

![](http://me.lizhooh.com//assets/image/2017/10/20171015230023.png)

### 服务端：

~~~js
const app = require('express')()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

var user = {}; // 假装在线用户数据库
//io.of("/").on(...) of里是命名空间，默认“/”，这个我没去研究，默认这个就够玩了
io.on('connection', socket => {
    /** 连接后，获取分配的socket对象，此时的socket代表当前用户，有唯一的标识socket.id。
    * 如图：io是蓝色的圈，他发信息是监听它所发事件的人都能收到，io.[.to()].emit('sys',msg);听sys的都收的到，除非to限定
    * socket可当做一个room，默认就是自己一个房间称为个体。如果用socket[.to()].emit('sys', msg)发信息自己是收不到。
    * 而群聊，其实就是几个socket进同一个room。
    **/
    
    // 广播，当前命名空间下的都能接听
    io.emit('sys', 'a user come in')
	// 上线（监听online，即客户端给此事件发送信息，发个名字过来）
	socket.on('online', username => {
		// 当前用户
		socket.username = username;
		// 保存刷新用户信息：user=｛username: socketId, username: socketId...｝
		user[username] = socket.id;
        // 广播信息：除了自己, 监听sys事件的人都会收到
		socket.broadcast.emit('sys', `${socket.username}上线了`)
	})
	// 下线
	socket.on('disconnect', reason => {
		socket.broadcast.emit('sys', `${socket.username}下线了`)
	})
	
	// 私聊：
	socket.on('private_chat', (to, msg) => {
		let from = socket.username; // 当前发送信息的用户，也就是当前socket对象，刚才我们存了名字
        // 给某个人（某个socketId）发送信息
		socket.to(user[to]).emit('private_chat', msg);
	})
    
    // 聊天室
	socket.on('join', room => {
		let currRoom = room;
        // 根据房间名加入房间
		socket.join(room, () => {
            // 群发给当前房间监听sys的人
			io.to(currRoom).emit('sys', `${socket.username} come in ${room}`);
		});	
	})
	socket.on('leave', room => {
		let currRoom = room;
		socket.leave(room, () => {
			io.to(currRoom).emit('sys', `${socket.username} leave ${room}`);
		});
	})
	
})

~~~

### 客户端（html）

~~~js
<script src="/socket.io/socket.io.js"></script>
// 服务端引入socket.io 就可通过GET /socket.io/socket.io.js请求获取socket.io库
<script>
    var socket = io({
        autoConnect: false // 自动连接，true就不用手动socket.open()了
    });
	socket.open();
	// socket.close();
    // 发送信息到online，随机数充当名称
    socket.emit('online', Math.floor(Math.random()*10));
    // 私聊，绑定个点击事件就可以了
    //socket.emit('private_chat', 接受者名称, 消息);
    // 监听私聊信息
	socket.on('private_chat', function (msg) {
        console.log(msg)
      });

  	socket.on('sys', function (msg) {
        console.log(msg)
      });
</script>
~~~

### 常用API

默认命名空间为'/'，我也没有使用多个命名空间

- 发送消息

  > socket.emit(**事件**, **消息**, callback);
  >
  > 注：中间可以多个参数，如socket.emit(**事件**, **消息1**, , **消息2**, **消息3**。。。, callback);
  >
  > 对应socket.on(**事件**, **arg1**，**arg2**..)

- 发送信息给指定人：**聊天功能关键API 私聊、群聊、群发**

  > socket.to(**socketId**).emit(**事件**, **消息**) // 客户端不能使用此api，所以是后端使用来代替转发，发送给自己是无效的
  >
  > ~~~js
  > io.on('connection', (socket) => {
  >     // 私聊 user｛'money': socketId｝
  >     socket.on('private_chat', (to, msg) => {
  >         // 发送 to = 'money'
  >         socket.to(user[to]).emit('private_chat', msg);
  >     })
  > });
  > ~~~
  >
  > 注：1. 多个.to(**socketId**)表示多发 2. to() 表示发给除自己其他监听此事件的人

- 给整个个命名空间广播

  > ~~~js
  > io.emit('事件', '消息');
  > ~~~

- 给除了自己以外的人广播（同个命名空间）

  > ~~~js
  > socket.broadcast.emit('事件', '消息')
  > ~~~

- 聊天室常用api

  房间room：其实默认是每个人一个房间，一个房间对应一个socketId

  - 加入聊天室

    > ```js
    > io.on('connection', (socket) => {
    >     socket.join('room 237', () => {
    >         let rooms = Object.keys(socket.rooms);
    >         console.log(rooms); // [ <socket.id>, 'room 237' ]
    >         io.to('room 237').emit('sys','a new user has joined the room'); // 发送信息到该聊天室
    >     });
    > });
    > ```

  - 离开聊天室

    > ```js
    > io.on('connection', (socket) => {
    >   socket.leave('room 237', () => {
    >     io.to('room 237').emit('sys',`user ${socket.id} has left the room`);
    >   });
    > });
    > ```

## 问题汇总

### 1. 用ajax请求引入MoneyChat方式

1. 直接请求整个文件（包含script标签）：失败

   - 原因：引入的JS并不会立即执行。
     1. 解决1：使用eval，但是不仅仅是里面的JS代码，还有引入JS的<script srt=""></script>，这个得单独处理

     2. 解决2：单独处理就是的用创建节点的方式，才能立马执行。于是我就写了一个初始化JS文件，如下：

     ~~~js
     init();
     function init() {
         // 引入需要的JS
         loadJS('{{path}}/public/js/drag.js');
         loadJS('{{path}}/chat/socket.io.js', function () {
             loadJS('{{path}}/public/core/moneychat.js', function () {
                 // 本身我自己需要立即执行的代码
                 moneyChatInit();
             })
         })
     }
     // 使用创建节点添加入dom的方式，才能立即执行
     function loadJS(url, callback) {
         var script = document.createElement('script'),
             fn = callback || function () {};
         script.type = 'text/javascript';
         //IE
         if (script.readyState) {
             script.onreadystatechange = function () {
                 if (script.readyState == 'loaded' || script.readyState == 'complete') {
                     script.onreadystatechange = null;
                     fn();
                 }
             };
         } else {
             //其他浏览器
             script.onload = function () {
                 fn();
             };
         }
         script.src = url;
         document.getElementsByTagName('head')[0].appendChild(script);
     }
     ~~~

   

## 参考

[socket.io 文档](https://socket.io/get-started/chat/)

[art-template集成express](http://aui.github.io/art-template/express/)

[了解webSocekt](http://www.ruanyifeng.com/blog/2017/05/websocket.html)

[时间操作工具moment.js](http://momentjs.cn/)