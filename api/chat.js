const monment = require('moment')

/**
 * msgType:
 * 0 初始化
 * 2 创建聊天室
 * 10 私聊
 * 20 群聊
 * 21 有人进群
 * 22 有人退群
 */
class chatApi {
    io
    users = []
    rooms = []

    /**
     * 登录初始化
     */
    init = (socket) => {
        // 当前线上用户
        let onlineUsers = [];
        this.users.forEach(u => {
            if (u.username === socket.username) return;
            let user = {
                username: u.username,
                name: u.name
            }
            onlineUsers.push(user);
        })
        // 当前世界聊天室
        let onlineRooms = this.rooms.filter(e => e.type === 'public').map(e => e.room);
        let message = {
            from: 'sys',
            fromName: '系统',
            to: '',
            msg: {
                onlineUsers,
                onlineRooms
            },
            dataType: 1,
            msgType: 0, // 初始化信息
            createTime: monment().format('Y-MM-DD HH:mm:ss')
        }
        this.io.to(socket.id).emit('sys', message);

    }
    /**
     * 上线
     * @param username
     * @param name
     * @returns {boolean}
     */
    online = (socket, username, name) => {
        // 临时用户
        if (username == '' || name == '') {
            return false;
        }
        socket.name = name
        socket.username = username;
        // 保存用户信息
        let user = {
            sid: socket.id,
            username,
            status: 'online',
            name: name
        }
        this.users.push(user);
        // 自己
        let oneself = {
            username,
            name
        }
        socket.broadcast.emit('sys_online', new Array(oneself));
        this.join(socket, '世界', 'public');
    }
    /**
     * 下线
     * @param reason
     */
    disconnect = (socket, reason) => {
        let user = {
            username: socket.username,
            name: socket.name
        }
        this.users = this.users.filter(u => u.username != socket.username);
        socket.broadcast.emit('sys_offline', user)
    }
    /**
     * 私聊
     * @param msg
     * @param recv
     */
    private_chat = (socket, msg, recv) => {
        for (let username of recv) {
            let target = this.users.find(e => e.username == username);
            if (target) {
                let message = {
                    from: socket.username,
                    fromName: socket.name,
                    to: '',
                    msg: msg,
                    dataType: 1,
                    msgType: 10,
                    createTime: monment().format('Y-MM-DD HH:mm:ss')
                }
                socket.to(target.sid).emit('private_chat', message);
            }
        }
    }
    /**
     * 加入聊天室
     * @param room
     * @param type
     */
    join = (socket, room, type) => {
        let currRoom = room;
        let index = this.rooms.findIndex(e => e.room == room);
        if (index < 0) {
            let roomInfo = {
                room,
                type,
                count: 1
            }
            index = this.rooms.push(roomInfo) - 1;
            if (type == 'public') {
                let message2 = {
                    from: 'sys',
                    fromName: '系统',
                    to: '',
                    msg: room,
                    dataType: 1,
                    msgType: 2, // 新聊天室
                    room: room,
                    createTime: monment().format('Y-MM-DD HH:mm:ss')
                }
                socket.broadcast.emit('sys', message2)
            }
        } else {
            this.rooms[index].count++;
        }
        let message = {
            from: 'sys',
            fromName: '系统',
            to: '',
            msg: {
                user: socket.name,
                count: this.rooms[index].count
            },
            dataType: 1,
            msgType: 21,
            room: room,
            createTime: monment().format('Y-MM-DD HH:mm:ss')
        }
        socket.join(room, () => {
            this.io.to(currRoom).emit('room_chat', message);
        });
    }
    /**
     * 离开聊天室
     * @param room
     */
    leave = (socket, room) => {
        let currRoom = room;
        let index = this.rooms.findIndex(e => e.room == room);
        if (index >= 0) {
            this.rooms[index].count -= 1;
            let message = {
                from: 'sys',
                fromName: '系统',
                to: '',
                msg: {
                    user: socket.name,
                    count: this.rooms[index].count
                },
                dataType: 1,
                msgType: 22,
                room: room,
                createTime: monment().format('Y-MM-DD HH:mm:ss')
            }
            socket.leave(room, () => {
                this.io.to(currRoom).emit('room_chat', message);
            });
            // 没人了删除
            if((this.rooms)[index].count < 1)
                this.rooms = this.rooms.filter(e=>e !== this.rooms[index]);
        }
    }
    /**
     * 群聊
     * @param msg
     * @param room
     */
    room_chat = (socket, msg, room) => {
        let message = {
            from: socket.username,
            fromName: socket.name,
            to: '',
            msg: msg,
            dataType: 1,
            msgType: 20,
            room: room,
            createTime: monment().format('Y-MM-DD HH:mm:ss')
        }
        socket.to(room).emit('room_chat', message);
    }

}

module.exports = new chatApi()