import {nextIcon, pauseIcon, playIcon, prevIcon} from "./svg.js";

export default function (player, options) {
    const el = player.el();
    console.log(el)
    const container = document.createElement('div');
    container.className = 'fast-player-container'
    const state = {
        show: false
    }
    container.innerHTML = `
        <div class="fast-player-title">${options.title}</div>
        <div class="fast-player-play-container">
            <div data-go="${options.state?.canPrev}">${prevIcon}</div>
            <div class="playIconContainer">${playIcon}</div>
            <div data-go="${options.state?.canNext}">${nextIcon}</div>
        </div>
        <div class="fast-player-control">
            <div id="fast-player-time" class="fast-player-time">00:00</div>
            <div class="fast-player-timeline-container">
                <div class="fast-player-timeline-left"></div>
                <div class="fast-player-timeline-circle"><div></div></div>
            </div>
            <div id="fast-player-time-all" class="fast-player-time">00:00</div>
        </div>
    `
    el.appendChild(container);

    player.on('play', () => {
        el.querySelector('.playIconContainer').innerHTML = pauseIcon
    })

    player.on('pause', () => {
        el.querySelector('.playIconContainer').innerHTML = playIcon
    })

    player.on('timeupdate', () => {
        const currentTime = player.currentTime(); // 秒数
        const duration = player.duration(); // 秒数
        const percent = currentTime / duration;
        el.querySelector('#fast-player-time').innerHTML = formatToMinSec(currentTime);
        if (isDragging) {
            return;
        }
        const timelineLeft = el.querySelector('.fast-player-timeline-left');
        timelineLeft.style.width = `${percent * 100}%`;
        el.querySelector('.fast-player-timeline-left').style.width = `${percent * 100}%`;
        el.querySelector('.fast-player-timeline-circle').style.left = `${percent * 100}%`;
    });


    const timeline = container.querySelector('.fast-player-timeline-container');
    const circle = container.querySelector('.fast-player-timeline-circle');
    const timelineLeft = container.querySelector('.fast-player-timeline-left');

    let isDragging = false;

    function getClientX(e) {
        if (!e) return 0;
        if (e.touches && e.touches.length > 0) {
            return e.touches[0].clientX;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return e.changedTouches[0].clientX;
        } else if (typeof e.clientX === 'number') {
            return e.clientX;
        }
        return 0;
    }

// 通用拖动处理
    function updatePosition(clientX) {
        const rect = timeline.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));
        const percent = offsetX / rect.width;
        const newTime = percent * player.duration();

        timelineLeft.style.width = `${percent * 100}%`;
        circle.style.left = `${percent * 100}%`;
        container.querySelector('#fast-player-time').innerText = formatToMinSec(newTime);
    }

// 开始拖动
    function onDragStart(e) {
        if (player.paused()) {
            return;
        }
        e.preventDefault();
        isDragging = true;
        document.body.style.userSelect = 'none';
        updatePosition(getClientX(e));
    }

// 拖动中
    function onDragMove(e) {
        if (!isDragging) return;
        updatePosition(getClientX(e));
    }

// 拖动结束
    function onDragEnd(e) {
        console.log(e)
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';

        const rect = timeline.getBoundingClientRect();
        let offsetX = getClientX(e) - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));
        const percent = offsetX / rect.width;
        const newTime = percent * player.duration();

        player.currentTime(newTime);
    }

// 绑定事件（支持 PC + 移动）
    circle.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    circle.addEventListener('touchstart', onDragStart, {passive: false});
    document.addEventListener('touchmove', onDragMove, {passive: false});
    document.addEventListener('touchend', onDragEnd);

    // 鼠标松开，设置播放器时间
    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = '';

        const rect = timeline.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));
        const percent = offsetX / rect.width;
        const newTime = percent * player.duration();

        player.currentTime(newTime);
    });

    player.ready(() => {
        // 监听元数据加载完成
        player.on('loadedmetadata', () => {
            const duration = player.duration(); // 秒数
            el.querySelector('#fast-player-time-all').innerHTML = formatToMinSec(duration);
        });
    });

    const playBtn = container.querySelector('.playIconContainer');
    playBtn.addEventListener('click', (e) => {
        if (!player.paused()) {
            player.pause();
            return;
        }
        player.play()
        e.stopPropagation();
    })

    const prevBtn = container.querySelector('.prevIcon');
    prevBtn.addEventListener('click', (e) => {
        options.callback.prev();
        e.stopPropagation();
    })
    const nextBtn = container.querySelector('.nextIcon');
    nextBtn.addEventListener('click', (e) => {
        options.callback.next();
        e.stopPropagation();
    })

}


function formatToMinSec(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const minStr = totalMinutes.toString().padStart(2, '0');
    const secStr = secs.toString().padStart(2, '0');

    return `${minStr}:${secStr}`;
}