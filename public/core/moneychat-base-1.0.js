// 纯JS接入
init();
function init() {
    loadJS('{{path}}/public/js/drag.js');
    loadJS('{{path}}/mc/socket.io.js', function () {
        loadJS('{{path}}/public/core/moneychat.js')
    })
}

/**
 * 加载JS文件
 * @param {*} url 
 * @param {*} callback 
 */
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