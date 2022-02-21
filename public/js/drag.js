/**
 * 拖拽 
 * @param {*} selector 点击触发拖拽的元素
 * @param {*} targetSelector 被拖拽的元素，默认拖拽自己
 * 注：被拖拽的元素margin需设为0
 */
function addDrag(selector = '.drag', targetSelector) {
    if (selector == '') {
        selector = '.drag';
    }
    let moneyDrags = document.querySelectorAll(selector);
    moneyDrags.forEach(moneyDrag => {
        moneyDrag.style.cursor = 'move';
        moneyDrag.addEventListener('mousedown', function (event) {
            let drag = document.querySelector(targetSelector) || this;
            event = event || window.event; // 兼容IE
            let diffX = event.clientX - drag.offsetLeft;
            let diffY = event.clientY - drag.offsetTop;
            if (typeof drag.setCapture !== 'undefined') {
                drag.setCapture();
            }
            document.onmousemove = function (event) {
                event = event || window.event; // 兼容IE
                let moveX = event.clientX - diffX;
                let moveY = event.clientY - diffY;
                if (moveX < 0) {
                    moveX = 0
                } else if (moveX > window.innerWidth - drag.offsetWidth) {
                    moveX = window.innerWidth - drag.offsetWidth
                }
                if (moveY < 0) {
                    moveY = 0
                } else if (moveY > window.innerHeight - drag.offsetHeight) {
                    moveY = window.innerHeight - drag.offsetHeight
                }
                drag.style.left = moveX + 'px';
                drag.style.top = moveY + 'px';
            }
            document.onmouseup = function (event) {
                this.onmousemove = null;
                this.onmouseup = null;
                //修复低版本ie bug
                if (typeof drag.releaseCapture != 'undefined') {
                    drag.releaseCapture();
                }
            }
        })
    })
}