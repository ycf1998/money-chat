/**
 * 核心JS
 */
class MoneyChat {
    socket = null
    username = new Date().getTime() + '_' + Math.floor(Math.random() * 1024)
    status = 'offLine'
    config = {
        path: '',
        autoConnect: true, // 是否自动连接，关闭后需手动使用open()打开连接
        cache: false, // 是否缓存，配合cacheLevel
        cacheLevel: 1, // 1：sessionStorage, 2: localStorage
        saveChatHistory: true, // 是否缓存聊天记录,
        tools: ['emoji', 'image', 'video', 'html'], // 聊天工具
        defaultNameFun: this.randomName, // 提供一个生成默认名称的算法
        loadCacheCallback: '', // 提供一个获取缓存后的回调方法，function loadCache(cache) cache: 缓存的数据
    }
    constructor(config) {
        Object.assign(this.config, config)
        this.socket = io(this.config.path, {
            path: '/mc',
            autoConnect: this.config.autoConnect
        });
        this.socket.on('connect', (msg) => {
            console.log("connect success")
        });
        this.init()
    }
    /**
     * 初始化
     * @param {*} config 
     */
    init() {
        if (this.config.cache) {
            let that = this;
            // 获取自己
            let username = sessionStorage.getItem('username');
            if (username) {
                this.username = username;
            }
            // 开启缓存
            window.onbeforeunload = function (e) {
                document.getElementById('chatBoxList').childNodes.forEach(node => {
                    if (node.hasAttribute('mc-room')) {
                        node.remove();
                    }
                })
                let chatHistory = document.getElementById('chatBoxList').innerHTML;
                // 好友和聊天室在添加的时候就已经添加缓存了
                that.config.saveChatHistory ? that.setCache('chatHistory', chatHistory) : '';
                sessionStorage.setItem('username', that.username);
                // 退出所有聊天室
                let rooms = window.myJoinRooms || [];
                for (let room of rooms) {
                    that.leaveRoom(room);
                }
            }
        }
    }
    /**
     * 查看/修改配置
     * @param {*} key 
     * @param {*} value 
     */
    config(key = '', value) {
        if (key == '') {
            return this.config;
        } else {
            this.config[key] == value;
        } 
    }
    /**
     * 加载缓存
     */
    loadCache(callback = this.config.loadCacheCallback) {
        if (!this.config.cache) return '';
        let friends = this.getCache('friends');
        let rooms = this.getCache('rooms');
        let chatHistory = this.getCache('chatHistory');
        if (typeof callback === 'function') {
            callback({
                friends,
                rooms,
                chatHistory
            });
        } else {
            document.getElementById('chatBoxList').innerHTML = chatHistory;
            let friendsTab = document.querySelector('#MoneyChat .tab-content .tab-pane[aria-labelledby="friends-tab"]');
            let roomsTab = document.querySelector('#MoneyChat .tab-content .tab-pane[aria-labelledby="rooms-tab"]');
            if (friends != null && friends.length > 0) {
                for (let friend of friends) {
                    let html = `<div class="user-card" ondblclick='openSession(this)'
                    mc-user='${friend.username}' mc-user-name='${friend.name}'>
                  <img class="user-avatar" src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
                  <div class="info">
                      <div class="title">
                          <name title="${friend.name}">${friend.name}</name>
                          <div></div>
                      </div>
                      <small class="text-muted"></small>
                  </div>
                  <div class="opt"> <span class="makeFriend" onclick="$delFriend(this)"> ❗ </span></div>
              </div>`;
                    friendsTab.insertAdjacentHTML('beforeend', html)
                }
            }
            if (rooms != null && rooms.length > 0) {
                for (let i in rooms) {
                    let html = `<div class="user-card" ondblclick='openSession(this)'
                    mc-user='${rooms[i]}' mc-user-name='${rooms[i]}' mc-room>
                  <img class="user-avatar" src="https://z3.ax1x.com/2021/06/27/RJ4E3F.jpg">
                  <div class="info">
                      <div class="title">
                          <name title="${rooms[i]}">${rooms[i]}</name>
                          <div></div>
                      </div>
                      <small class="text-muted"></small>
                  </div>
                  <div class="opt"> <span class="delRoom" onclick="$delRoom(this)"> ❌ </span></div>
              </div>`;
                    roomsTab.insertAdjacentHTML('beforeend', html)
                }
            }
        }
    }
    /**
     * 缓存
     * @param {*} key 
     * @param {*} value 
     */
    setCache(key, value) {
        if (!this.config.cache || key == '') return '';
        if (this.config.cacheLevel == 1) {
            let cache = JSON.parse(sessionStorage.getItem(this.username)) || {};
            cache[key] = value;
            sessionStorage.setItem(this.username, JSON.stringify(cache));
        } else if (this.config.cacheLevel == 2) {
            let cache = JSON.parse(localStorage.getItem(this.username)) || {};
            cache[key] = value;
            localStorage.setItem(this.username, JSON.stringify(cache));
        }
    }
    /**
     * 获取缓存
     * @param {*} key 
     */
    getCache(key = '') {
        if (!this.config.cache || key == '') return '';
        if (this.config.cacheLevel == 1) {
            let cache = JSON.parse(sessionStorage.getItem(this.username));
            return cache ? cache[key] : '';
        } else if (this.config.cacheLevel == 2) {
            let cache = JSON.parse(localStorage.getItem(this.username));
            return cache ? cache[key] : '';
        }
        return '';
    }
    /**
     * 随机名称
     */
    randomName() {
        return '代号' + Math.floor(Math.random() * 1000000000)
    }
    /**
     * 开关 
     */
    open() {
        this.socket.open();
    }
    close() {
        this.socket.close();
    }
    /**
     * 登录/上线
     * @param {*} name 名称
     * @param {*} callback 
     */
    login() {
		switch(arguments.length) {
			case 0:  return this._login(); break;
			case 1:  return this._login(arguments[0]); break;
			case 2:  return this._login(arguments[0], arguments[1]); break;
			case 3:  {
				if (typeof arguments[2] === 'function')
					return this._login(arguments[0], arguments[1], undefined, arguments[2]);
				return this._login(arguments[0], arguments[1], arguments[2]);
			}				
			break;
			default:  return this._login(arguments[0], arguments[1], arguments[2], arguments[3]); break;
		}
    }
    /**
     * 
     * @param {*} name 名称
     * @param {*} username 唯一标识
     * @param {*} callback 
     * @returns name 名称
     */
    _login(name = '', username = '', avatar = 'https://s1.ax1x.com/2020/10/24/BZsVjP.jpg', callback) {
        if (!this.socket.connected) {
            this.open();
        } else {
            this.close();
            this.open();
        }
        if (name == '') {
            name = sessionStorage.getItem('name') || this.config.defaultNameFun();
        }
        if (username == '') {
            username = this.username;
        } else {
            this.username = username;
        }
        // 加载缓存
        if (this.config.cache) {
            sessionStorage.setItem('name', name);
            this.loadCache();
        }
        this.socket.emit('online', username, name);
        this.socket.emit('init')
        if (typeof callback === 'function') {
            callback(name, username);
        } else {
            let mcName = document.querySelectorAll('#MoneyChat [mc-name]');
            mcName.forEach(e => {
                e.innerText = name
                e.setAttribute('title', name);
            });
			let mcAvatar = document.querySelectorAll('#MoneyChat [mc-avatar]');
            mcAvatar.forEach(e => {
                e.src = avatar;
            });
        }
        this.status = 'online';
        return {
			name,
			username,
			avatar
		};
    }
    /**
     * 交朋友
     * @param {*} friend 
     */
    makeFriend(username, name) {
        if (this.config.cache) {
            let friends = this.getCache('friends') || [];
            let friend = {
                username,
                name
            }
            friends.push(friend);
            this.setCache('friends', friends)
        }
    }
    /**
     * 删朋友
     * @param {*} friend 
     */
    delFriend(username) {
        let friends = this.getCache('friends') || [];
        friends = friends.filter(friend => friend.username != username);
        this.setCache('friends', friends)
    }
    /**
     * 私聊、 群发
     * @param {*} msg 消息
     * @param {Array} recv 接收者
     */
    send(msg, recv = []) {
        if (!Array.isArray(recv)) {
            recv = new Array(recv);
        }
        this.socket.emit('private_chat', msg, recv);
    }
    /**
     * 私聊、 群发发送多媒体信息
     * @param {*} msg 
     * @param {*} recv 
     */
    sendMulti(msg, recv = []) {
        if (!Array.isArray(recv)) {
            recv = new Array(recv);
        }
        this.socket.emit('private_chat_multi', msg, recv);
    }
    /**
     * 聊天室聊天
     * @param {*} msg 
     * @param {*} room 
     */
    sendToRoom(msg, room) {
        this.socket.emit('room_chat', msg, room);
    }
    /**
     * 聊天室发送多媒体信息
     * @param {*} msg 
     * @param {*} room 
     */
    sendMultiToRoom(msg, room) {
        this.socket.emit('room_chat_multi', msg, room);
    }
    /**
     * 创建 / 加入聊天室
     * @param {*} room 
     */
    joinRoom(room, type) {
        // if (this.config.cache) {
        //     let rooms = this.getCache('rooms') || [];
        //     rooms.push(room);
        //     this.setCache('rooms', rooms)
        // }
        this.socket.emit('join', room, type);
    }
    /**
     * 离开聊天室
     * @param {*} room 
     */
    leaveRoom(room) {
        // if (this.config.cache) {
        //     let rooms = this.getCache('rooms') || [];
        //     rooms = rooms.filter(e => e == room);
        //     this.setCache('rooms', rooms)
        // }
        this.socket.emit('leave', room);
    }

    /**
     * 事件监听
     * @param {*} type 事件类型
     * @param {*} callback 
     */
    addEventListener(type, callback) {
        if (typeof callback != 'function') return;
        // 系统
        if (type === 'sys') {
            this.socket.on('sys', msg => {
                callback(msg)
            });
            // 上线
        } else if (type === 'online') {
            this.socket.on('sys_online', msg => {
                callback(msg)
            });
            // 下线
        } else if (type === 'offline') {
            this.socket.on('sys_offline', msg => {
                callback(msg)
            });
            // 私聊
        } else if (type === 'private') {
            this.socket.on('private_chat', msg => {
                callback(msg)
            });
            // 聊天室
        } else if (type === 'room') {
            this.socket.on('room_chat', msg => {
                callback(msg)
            });
        } else {
            this.socket.on(type, msg => {
                callback(msg)
            });
        }
    }

}