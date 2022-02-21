const moneyChat = require(__dirname + '/router/index');
const chatApi = require(__dirname + '/api/chat');

const express = require('express');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    path: '/mc',
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
})

// 解决跨域问题
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Credentials", false);
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    next();
});
// 静态资源
app.use('/public/', express.static(__dirname + '/public'))
// 路由
app.use('/', moneyChat);

chatApi.io = io;
io.on('connection', socket => {
    // 上线初始化信息
    socket.on('init', () => chatApi.init(socket));

    // 上线
    socket.on('online', (username, name) => chatApi.online(socket, username, name))

    // 下线
    socket.on('disconnect', reason => chatApi.disconnect(socket, reason))

    // 私聊
    socket.on('private_chat', (msg, recv) => chatApi.private_chat(socket, msg, recv))

    // 聊天室
    socket.on('join', (room, type) => chatApi.join(socket, room, type))
    socket.on('leave', (room) => chatApi.leave(socket, room))
    socket.on('room_chat', (msg, room) => chatApi.room_chat(socket, msg, room))
})


http.listen(3001, () => {
    console.log('ok');
})