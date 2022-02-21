init();

function init() {
    loadJS('{{path}}/public/js/drag.js');
    loadJS('{{path}}/mc/socket.io.js', function () {
        loadJS('{{path}}/public/core/moneychat.js', function () {
            moneyChatInit();
            console.log(` ████     ████                                      ██████  ██                  ██  
░██░██   ██░██                            ██   ██  ██░░░░██░██                 ░██  
░██░░██ ██ ░██  ██████  ███████   █████  ░░██ ██  ██    ░░ ░██       ██████   ██████
░██ ░░███  ░██ ██░░░░██░░██░░░██ ██░░░██  ░░███  ░██       ░██████  ░░░░░░██ ░░░██░ 
░██  ░░█   ░██░██   ░██ ░██  ░██░███████   ░██   ░██       ░██░░░██  ███████   ░██  
░██   ░    ░██░██   ░██ ░██  ░██░██░░░░    ██    ░░██    ██░██  ░██ ██░░░░██   ░██  
░██        ░██░░██████  ███  ░██░░██████  ██      ░░██████ ░██  ░██░░████████  ░░██ 
░░         ░░  ░░░░░░  ░░░   ░░  ░░░░░░  ░░        ░░░░░░  ░░   ░░  ░░░░░░░░    ░░  
`)
        })
    })
}

/**
 * 加载JS文件
 * @param {*} url
 * @param {*} callback
 */
function loadJS(url, callback) {
    var script = document.createElement('script'),
        fn = callback || function () {
        };
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

/**
 * MoneyChat初始化
 */
const tx = "https://s1.ax1x.com/2020/10/24/BZsVjP.jpg";
const roomImage = "https://z3.ax1x.com/2021/06/27/RJ4E3F.jpg";

function moneyChatInit() {
    window.moneychat = new MoneyChat({
        path: '{{socketPath}}',
        cache: true
    });
    var myself = moneychat.login();
    // 接收系统信息(上线)
    moneychat.addEventListener('online', (msg) => {
        addUser(msg);
    })
    // 接收系统信息(下线)
    moneychat.addEventListener('offline', (msg) => {
        removeUser(msg);
    })
    // 接收系统信息
    moneychat.addEventListener('sys', (msg) => {
        // 上线初始化信息，当前在线用户和公开聊天室，并加入世界聊天室
        if (msg.msgType == '0') {
            addUser(msg.msg.onlineUsers);
            addRoom(new Array('世界'));
            addRoom(msg.msg.onlineRooms, 'noJoin');
        } else if (msg.msgType == '2') {
            addRoom(new Array(msg.msg), 'noJoin');
        }
    })
    // 接收私聊信息
    moneychat.addEventListener('private', (msg) => {
        let target = document.querySelector(`#chatBoxList .chat-box[mc-user='${msg.from}']`);
        if (!target) {
            target = createChatBox(msg.from, msg.fromName);
        }
        let recvMsg = `<div class="mc-media text-left">
				<img src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
				<div class="mc-media-content">
					<small class="mc-media-banner text-muted">${msg.createTime}</small>
					<div class="mc-media-manage">${msg.msg}</div>
				</div>
			</div>`;
        target.insertAdjacentHTML('beforeend', recvMsg);
        scrollToBottom();
        // 消息提醒
        $notice(msg.from);
    })
    // 接收群聊信息
    moneychat.addEventListener('room', (msg) => {
        let room = msg.room;
        let target = chatBoxList.querySelector(`.chat-box[mc-user='${room}']`);
        if (!target) {
            target = createChatBox(room, room, true);
        }
        let recvMsg = '';
        // 有人加入
        if (msg.msgType == 21) {
            recvMsg = `<div class="mc-media text-center">
                  <div class="mc-media-content" style="width: 100%">
                      <small class="text-muted">欢迎，${msg.msg.user} 加入聊天室！共：${msg.msg.count} 人</small>
                  </div>
              </div>`;
            ;
            // 有人退出
        } else if (msg.msgType == 22) {
            recvMsg = `<div class="mc-media text-center">
                  <div class="mc-media-content" style="width: 100%">
                      <small class="text-muted">恭送，${msg.msg.user}离开聊天室！共：${msg.msg.count} 人</small>
                  </div>
              </div>`;
            // 有人群里发信息
        } else {
            recvMsg = `<div class="mc-media text-left">
                  <img src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
                  <div class="mc-media-content">
                      <small class="mc-media-banner text-muted">${msg.fromName} ${msg.createTime}</small>
                      <div class="mc-media-manage">${msg.msg}</div>
                  </div>
              </div>`;
        }
        target.insertAdjacentHTML('beforeend', recvMsg);
        scrollToBottom();
        // 消息提醒
        $notice(room);
    })
    // 添加拖拽事件
    addDrag('#MoneyChat #moneyBox .drag', '#moneyBox')
    addDrag('#MoneyChat #chatWindow .drag', '#chatWindow')
    addDrag('#MoneyChat #ext .drag', '#ext')
}

//=================== 聊天工具 ===================================
(function () {
    // 隐藏聊天 ctrl + 空格
    document.body.addEventListener('keydown', function (e) {
        if (e.keyCode == 32 && e.ctrlKey) {
            let $MoneyChat = document.querySelector('#MoneyChat');
            if ($MoneyChat.style.display === 'none') $MoneyChat.style.display = 'block';
            else $MoneyChat.style.display = 'none';
        }
    });
    document.getElementById('moneyChatInput').addEventListener('keyup', function (e) {
        if (e.keyCode == 32 && e.ctrlKey) {
            let $MoneyChat = document.querySelector('#MoneyChat');
            if ($MoneyChat.style.display === 'none') $MoneyChat.style.display = 'block';
            else $MoneyChat.style.display = 'none';
        }
    });
    // 字符表情初始化
    let chatToolContent = document.getElementById('chatTool-centent');
    let emojiHtml = '<div id="ct-emoji" style="display: none;">';
    for (let i = 0; i < 80; i++) {
        emojiHtml += `<span style='cursor:pointer;padding: 0 2px' >${String.fromCodePoint(128512 + i)}</span>`;
    }
    emojiHtml += '</div>';
    // 文件
    // 视频
    // HTML
    chatToolContent.insertAdjacentHTML('beforeend', emojiHtml);
    document.querySelector('#MoneyChat #chatTool-centent').addEventListener('click', function (e) {
        if (e.target.localName == 'span' && e.target.parentElement.id == 'ct-emoji') {
            let input = document.getElementById('moneyChatInput');
            console.log(e.target.innerText);
            input.value += e.target.innerText;
        }
    });
    // 打开聊天工具
    document.querySelector('#MoneyChat #chatTool-menu span').addEventListener('click', function (e) {
        let chatToolContent = document.getElementById('chatTool-centent');
        active(chatToolContent);
        let targetTool = e.target.getAttribute('show-tool');
        active(chatToolContent.querySelector(`#${targetTool}`));
    });
    // 点击其他地方，关闭聊天工具
    document.querySelector('#MoneyChat #chatTool').addEventListener('click', function (e) {
        e.stopPropagation();
    });
    document.body.addEventListener('click', function (e) {
        let chatToolContent = document.getElementById('chatTool-centent');
        inactive(chatToolContent);
    });
}())

//=================== 业务功能==========================
// 获取在线列表，好友列表，聊天室列表 节点Node
var onlineList, friendsList, roomsList;
var list = document.querySelectorAll('#MoneyChat .tab-content .tab-pane');
list.forEach(e => {
    if (e.getAttribute('aria-labelledby') == 'online-tab') {
        onlineList = e;
    } else if (e.getAttribute('aria-labelledby') == 'friends-tab') {
        friendsList = e;
    } else if (e.getAttribute('aria-labelledby') == 'rooms-tab') {
        roomsList = e;
    }
})

// 用户上线添加到列表
function addUser(users = []) {
    let friendsCache = moneychat.getCache('friends') || [];
    for (let user of users) {
        let index = friendsCache.findIndex(friend => friend.username = user);
        let opt = index < 0 ?
            '<span class="makeFriend" onclick=" $makeFriend(this)">🤝</span>' :
            '';
        let html = `<div class="user-card" ondblclick='openSession(this)'
                    mc-user='${user.username}' mc-user-name='${user.name}'>
                  <img class="user-avatar" src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
                  <div class="info">
                      <div class="title">
                          <name title="${user.name}">${user.name}</name>
                          <div></div>
                      </div>
                      <small class="text-muted"></small>
                  </div>
                  <div class="opt">${opt}</div>
              </div>`;
        onlineList.insertAdjacentHTML('beforeend', html);
    }
}

// 用户下线移除列表（仅在线列表）
function removeUser(user) {
    onlineList.querySelectorAll('.user-card[mc-user]').forEach(e => {
        if (e.getAttribute('mc-user') == user.username) {
            e.remove();
        }
    });
}

// 加入聊天室到列表
function addRoom(rooms = [], roomType = 'public') {
    // 暂存加入的聊天室，用于退出时离开聊天室
    if (roomType != 'noJoin') {
        window.myJoinRooms = [window.myJoinRooms ? window.myJoinRooms : '', ...rooms]
    }
    let roomTypeHtml = '<span style="color:green">已加入</span>';
    let opt = '<span class="delRoom" onclick=" $delRoom(this)">❌</span>';
    switch (roomType) {
        case 'private':
            roomTypeHtml = '<span style="color:blue">私密</span>';
            break;
        case 'noJoin':
            roomTypeHtml = '<span style="color:grey">未加入</span>';
            opt = '';
            break;
        default:
    }
    for (let room of rooms) {
        let exist = false;
        roomsList.childNodes.forEach(e => {
            if (e.getAttribute('mc-user') == room) {
                exist = true;
            }
        })
        if (exist) continue;
        let html = `<div
                class="user-card" ondblclick='openSession(this)' mc-user='${room}' mc-user-name='${room}' mc-room='${roomType}'>
                <img class="user-avatar" src="${roomImage}">
                <div class="info">
                    <div class="title">
                        <name title="${room}">${room}</name>
                        <div></div>
                    </div>
                    <small class="text-muted">${roomTypeHtml}</small>
                </div>
                <div class="opt">${opt}</div>
                </div>`;
        roomsList.insertAdjacentHTML('beforeend', html);
    }
}

function delRoom(room) {
    roomsList.childNodes.forEach(e => {
        if (e.getAttribute('mc-user') == room) {
            e.remove();
        }
    })
}

// 搜索好友
function $search(word) {
    let searchResultBox = document.getElementById('searchResult');
    if (word) {
        searchResultBox.style.display = 'block';
        searchResultBox.innerHTML = ''
        onlineList.childNodes.forEach(e => {
            if (e.getAttribute('mc-user-name').match(word))
                searchResultBox.insertAdjacentElement('beforeend', e.cloneNode(true));
        })
    } else {
        searchResultBox.style.display = 'none';
    }
}

// 你好朋友
function $makeFriend(thisObj) {
    let friend = thisObj.parentElement.parentElement.getAttribute('mc-user');
    let friendName = thisObj.parentElement.parentElement.getAttribute('mc-user-name');
    let friendNode = thisObj.parentElement.parentElement.cloneNode(true);
    friendNode.querySelector('.makeFriend').setAttribute('onclick', '$delFriend(this)');
    friendNode.querySelector('.makeFriend').innerHTML = '❗'
    friendsList.insertAdjacentElement('beforeend', friendNode);
    thisObj.remove();
    moneychat.makeFriend(friend, friendName);
    $openSession(friend, friendName);
    let hello = '<span style="color:#e83e8c !important">我想和你做朋友</span>';
    $sendMsg('text', hello);
}

// 再见朋友
function $delFriend(thisObj) {
    let friend = thisObj.parentElement.parentElement.getAttribute('mc-user');
    let friendNode = thisObj.parentElement.parentElement;
    friendNode.remove();
    let makeFriend = '<span class="makeFriend" onclick=" $makeFriend(this)">🤝</span>';
    onlineList.querySelector(`.user-card[mc-user='${friend}'] .opt`).insertAdjacentHTML('afterbegin', makeFriend);
    moneychat.delFriend(friend)
}

// 加入聊天室
document.getElementById('roomSearch').addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        $joinRoom();
        event.preventDefault();
        closeExt();
    }
});

function $joinRoom() {
    let roomInput = document.querySelector('#MoneyChat #roomSearch');
    let roomTypeRadio = document.querySelector('#ext [name="roomType"]:checked');
    let room = roomInput.value;
    let roomType = roomTypeRadio.value;
    roomInput.value = '';
    document.querySelector('#ext [name="roomType"][value="public"]').checked = true;
    if (room == '') return;
    let exist = false;
    roomsList.childNodes.forEach(e => {
        if (e.getAttribute('mc-user') == room) {
            if (e.getAttribute('mc-room') == 'noJoin') {
                moneychat.joinRoom(room, roomType);
                delRoom(e.getAttribute('mc-user'));
                addRoom(new Array(e.getAttribute('mc-user')));
            }
            exist = true;
        }
    })
    if (!exist) {
        moneychat.joinRoom(room, roomType);
        addRoom(new Array(room), roomType);
    }
    $openSession(room, room, true);
}

// 离开聊天室
function $delRoom(thisObj) {
    let room = thisObj.parentElement.parentElement.getAttribute('mc-user');
    delRoom(room);
    moneychat.leaveRoom(room);
}

// 发送信息
document.getElementById('moneyChatInput').addEventListener('keydown', function (e) {
    if (e.keyCode === 13) {
        $sendMsg()
        e.preventDefault();
    }
});
document.getElementById('sendGo').addEventListener('click', $sendMsg)

function $sendMsg(msgType, message) {
    let input = document.getElementById('moneyChatInput');
    let msg = message || input.value;
    input.value = '';
    if (msg == '') return;
    let chatBox;
    document.querySelectorAll('#chatBoxList .chat-box').forEach(chat => {
        if (chat.className.includes('active')) {
            chatBox = chat;
        }
    });
    if (chatBox) {
        let recv = chatBox.getAttribute('mc-user')
        if (chatBox.hasAttribute('mc-room')) {
            moneychat.sendToRoom(msg, recv);
        } else {
            moneychat.send(msg, recv);
        }
        let sendMsg = `<div class="mc-media reverse text-right">
                    <img src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
                    <div class="mc-media-content">
                        <small class="mc-media-banner text-muted">${new Date().toLocaleString()} </small>
                        <div class="mc-media-manage">${msg}</div>
                    </div>
                </div>`;
        chatBox.insertAdjacentHTML('beforeend', sendMsg);
    }
    scrollToBottom();
}


// 消息提醒
function $notice(username = '') {
    // 位于当前框就不提示了
    let chatWindow = document.getElementById('chatWindow');
    let currentChatBox = document.querySelector(`#chatBoxList .chat-box[mc-user='${username}'].active`);
    if (isActive(chatWindow) && currentChatBox) return;
    let moneyBox = document.getElementById('moneyBox');
    moneyBox.className += ' newMsg';
    let target = document.querySelectorAll(`#MoneyChat .user-card[mc-user='${username}']`);
    if (target.length > 0) {
        target.forEach(e => e.className += ' newMsg');
    }
}

function $clearNotice(username = '') {
    let moneyBox = document.getElementById('moneyBox');
    moneyBox.className = moneyBox.className.replace(' newMsg', '');
    let target = document.querySelectorAll(`#MoneyChat .user-card[mc-user='${username}']`);
    if (target.length > 0) {
        target.forEach(e => e.className = e.className.replace(' newMsg', ''));
    }
}

//==============================其他功能============================
// 打开扩展盒子
function openExt(func) {
    active(document.querySelector('#MoneyChat #ext'));
    // todo 关闭其他
    if (func == 'joinRoom') {
        active(document.querySelector('#MoneyChat #ext .func-joinRoom'));
    }
}

// 关闭扩展盒子
function closeExt() {
    inactive(document.querySelector('#MoneyChat #ext'));
}

// 创建聊天会话选择框
function createChatSession(username, name, isRoom) {
    let chatSession = document.querySelector('#MoneyChat #chatWindow .mc-chat-session');
    let chatSessionHtml = `<div class="user-card" onclick="openSession(this)" mc-user='${username}'
                mc-user-name='${name}'>
                <img class="user-avatar drag" src="https://s1.ax1x.com/2020/10/24/BZsVjP.jpg">
                <div class="info">
                    <div class="title">
                        <name title="${name}">${name}</name>
                    </div>
                </div>
                <div class="opt"><span onclick="delSession(this)">x</span></div>
            </div>`;
    chatSession.insertAdjacentHTML('beforeend', chatSessionHtml);
    // 添加是否聊天室标识
    let session = chatSession.querySelector(`.user-card[mc-user='${username}']`);
    if (isRoom) {
        session.querySelector('.user-avatar').src = roomImage;
        session.setAttribute('mc-room', '');
    }
    return session
}

// 创建聊天记录窗口
function createChatBox(username, name, isRoom) {
    let chatBoxList = document.querySelector('#MoneyChat #chatWindow #chatBoxList')
    let chatBoxHtml = `<div class="chat-box scroll" mc-user='${username}' mc-user-name='${name}'></div>`;
    chatBoxList.insertAdjacentHTML('beforeend', chatBoxHtml);
    // 添加是否聊天室标识
    let chat = chatBoxList.querySelector(`.chat-box[mc-user='${username}']`);
    if (isRoom) {
        chat.setAttribute('mc-room', '');
    }
    return chat;
}

// 关闭聊天窗口
function closeChatWindow() {
    inactive(document.getElementById('chatWindow'));
}

// 打开聊天会话
function openSession(thisObj) {
    let isRoom = thisObj.hasAttribute('mc-room');
    // 如果是聊天室，但还未加入，就加入
    if (isRoom && thisObj.getAttribute('mc-room') == 'noJoin') {
        delRoom(thisObj.getAttribute('mc-user'));
        addRoom(new Array(thisObj.getAttribute('mc-user')));
        moneychat.joinRoom(thisObj.getAttribute('mc-user'), 'public');
    }
    ;
    $openSession(thisObj.getAttribute('mc-user'), thisObj.getAttribute('mc-user-name'), isRoom);
}

function $openSession(to, toName, isRoom) {
    window.event.stopPropagation();
    // 消息提醒
    $clearNotice(to);
    let chatBox = document.querySelector(`#chatBoxList .chat-box[mc-user='${to}']`);
    let chatSession = document.querySelector(`#chatWindow .mc-chat-session .user-card[mc-user='${to}']`);
    if (!chatBox) {
        chatBox = createChatBox(to, toName, isRoom);
    }
    if (!chatSession) {
        chatSession = createChatSession(to, toName, isRoom)
    }
    document.querySelectorAll('#chatBoxList .chat-box').forEach(chatBox => inactive(chatBox));
    active(chatBox);
    document.querySelectorAll('#chatWindow .mc-chat-session .user-card').forEach(session => inactive(session));
    active(chatSession)

    let chatWindow = document.getElementById('chatWindow');
    if (isRoom) {
        chatWindow.querySelector('.mc-header .user-avatar').src = roomImage;
    } else {
        chatWindow.querySelector('.mc-header .user-avatar').src =
            'https://s1.ax1x.com/2020/10/24/BZsVjP.jpg';
    }
    chatWindow.querySelector('.mc-header name').innerText = toName;
    chatWindow.querySelector('.mc-header name').setAttribute('title', toName);
    if (!isActive(chatWindow)) {
        chatWindow.className += " active";
    }
}

// 删除聊天会话
function delSession(thisObj) {
    window.event.stopPropagation();
    let chatSession = thisObj.parentNode.parentNode;
    // 关闭对应聊天窗
    let username = chatSession.getAttribute('mc-user');
    let target = document.querySelector(`#chatBoxList .chat-box[mc-user='${username}']`);
    inactive(target);
    // 打开下一个会话
    let nextSession = chatSession.nextElementSibling ?
        chatSession.nextElementSibling : chatSession.previousElementSibling;
    if (nextSession == null) {
        closeChatWindow();
    } else {
        openSession(nextSession);
    }
    chatSession.remove();
}

// 切换盒子
function toggleBox(thisObj, e) {
    // 消息提醒
    $clearNotice();
    if (e.target.className.includes('drag')) return;
    let mcMinBox = document.getElementById('mcMinBox');
    let mcBox = document.getElementById('mcBox');
    let displayMinBox = mcMinBox.style.display;
    if (displayMinBox == '' || displayMinBox == 'none') {
        mcMinBox.style.display = 'flex';
        mcBox.style.display = 'none';
    } else {
        mcBox.style.display = 'block';
        mcMinBox.style.display = 'none';
    }
}

// 切换选项卡
let navLink = document.querySelectorAll('#MoneyChat .nav-tabs .nav-link');
navLink.forEach(link => {
    let navContent = document.querySelectorAll('#MoneyChat .tab-content .tab-pane');
    link.onclick = function () {
        navLink.forEach(e => inactive(e));
        active(link)
        let controls = link.getAttribute('aria-controls');
        let target;
        navContent.forEach(e => {
            e.className = "tab-pane"
            if (e.getAttribute('aria-labelledby').includes(controls)) {
                target = e;
            }
        })
        active(target);
    }
});

// 指向信息，显示时间
document.querySelector('#MoneyChat #chatBoxList').addEventListener('mouseover', e => {
    if (e.target.className.includes('mc-media-content')) {
        if (e.target.querySelector('.mc-media-banner')) {
            e.target.querySelector('.mc-media-banner').style.visibility = 'initial';
        }
    }
})
document.querySelector('#MoneyChat #chatBoxList').addEventListener('mouseout', e => {
    if (e.target.className.includes('mc-media-content')) {
        if (e.target.querySelector('.mc-media-banner')) {
            e.target.querySelector('.mc-media-banner').style.visibility = 'hidden';
        }
    }
})

// 聊天记录窗口滚动条滚动到底部
function scrollToBottom() {
    document.querySelectorAll('#MoneyChat #chatWindow #chatBoxList .chat-box').forEach(box => {
        box.scrollTop = box.scrollHeight;
    });
}

// 激活显示
function active(e) {
    if (!e.className.includes('active')) {
        e.className += ' active';
    }
}

// 取消激活
function inactive(e) {
    e.className = e.className.replace(' active', '');
}

// 是否激活
function isActive(e) {
    return e.className.includes('active');
}