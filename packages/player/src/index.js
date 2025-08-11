import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './fast.css'
import player from "./player.js";

function createPlayer(container, options) {
    // 初始化播放器
    const p = videojs(container, {
        autoplay: false,
        preload: 'auto',
        controlBar: false,
        children: [] // 不添加任何默认组件
    });

    p.src({
        src: options.src,
        type: options.type
    })

    player(p, options)
}

((global) => {
    global.videojs = videojs;
    global.createPlayer = createPlayer;
})(window);