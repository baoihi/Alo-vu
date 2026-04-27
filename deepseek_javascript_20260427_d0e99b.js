// ==UserScript==
// @name         Control Panel - Music & Auto Clicker
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Menu điều khiển với nhạc, auto clicker và tính năng VIP
// @author       Admin
// @icon         https://i.postimg.cc/3wJFzXWv/resized-image.jpg
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    // Xóa menu cũ nếu có
    document.querySelectorAll('.main-menu-fab, .main-menu-panel, .autoClick-fab, .autoClick-panel, .autoClick-menu, #music-round-btn, #music-panel').forEach(el => el && el.remove());
    
    // Thêm CSS bằng GM_addStyle
    GM_addStyle(`
        .main-menu-fab {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            background: #00adb5;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 999999;
            cursor: grab;
            overflow: hidden;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: none;
            user-select: none;
        }
        .main-menu-fab:active {
            cursor: grabbing;
        }
        .main-menu-fab img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            pointer-events: none;
        }
        .main-menu-panel {
            position: fixed;
            bottom: 150px;
            right: 20px;
            width: 320px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            border: 1px solid #667eea;
            color: white;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            z-index: 999998;
            box-shadow: 0 8px 25px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            touch-action: pan-y pinch-zoom;
        }
        .main-menu-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px;
            max-height: calc(80vh - 50px);
            touch-action: pan-y pinch-zoom;
        }
        .main-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(102,126,234,0.2);
            border-bottom: 1px solid #667eea;
            cursor: grab;
            user-select: none;
            touch-action: none;
            flex-shrink: 0;
        }
        .main-menu-header:active {
            cursor: grabbing;
        }
        .main-menu-title { font-weight: bold; color: #667eea; font-size: 14px; pointer-events: none; }
        .main-menu-close {
            background: #ff4757;
            border: none;
            color: white;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
            transition: 0.2s;
        }
        .main-menu-close:hover { background: #ff6b81; }
        .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: #0f0f1a;
            border-radius: 10px;
            cursor: pointer;
            transition: 0.2s;
        }
        .menu-item:hover {
            background: #1a1a2e;
        }
        .menu-item-left { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .menu-item-title { font-weight: bold; font-size: 14px; }
        .menu-item-desc { font-size: 11px; color: #aaa; }
        .arrow-icon {
            font-size: 18px;
            transition: transform 0.3s ease;
            color: #667eea;
        }
        .arrow-icon.expanded {
            transform: rotate(90deg);
        }
        .toggle-switch {
            position: relative;
            width: 50px;
            height: 24px;
            background-color: #2d2d44;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .toggle-switch.active { background-color: #00adb5; }
        .toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            transition: all 0.3s;
        }
        .toggle-switch.active .toggle-slider { left: 28px; }
        
        .submenu-container {
            margin-left: 15px;
            overflow: hidden;
            transition: max-height 0.3s ease;
            max-height: 0;
        }
        .submenu-container.show {
            max-height: 300px;
        }
        .submenu-item {
            padding: 10px;
            background: #0a0a14;
            border-radius: 8px;
            margin-top: 8px;
        }
        .submenu-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .music-controls {
            margin-top: 5px;
            display: flex;
            gap: 10px;
        }
        .music-btn {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
        }
        .play-music-btn {
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
        }
        .play-music-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .stop-music-btn {
            background: linear-gradient(135deg, #ff9800, #ff5722);
            color: white;
        }
        .stop-music-btn:hover { opacity: 0.9; transform: scale(1.02); }
        .music-status {
            font-size: 10px;
            text-align: center;
            margin-top: 6px;
            color: #4caf50;
        }
        .vip-badge {
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            color: #000;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
        }
        .compact-item {
            margin-bottom: 5px !important;
            padding: 8px !important;
        }
        
        @media (max-width: 768px) {
            .main-menu-panel { width: 300px; right: 5px; left: auto; max-height: 85vh; }
            .main-menu-fab { bottom: 70px; right: 10px; width: 50px; height: 50px; }
        }
    `);
    
    // ========== BIẾN TOÀN CỤC ==========
    let myAudio = null;
    let isPlaying = false;
    let gameSoundMuted = false;
    let musicFeatureState = {
        isMuteGame: false
    };
    
    // ========== TẠO NÚT MENU TRÒN ==========
    const fab = document.createElement('div');
    fab.className = 'main-menu-fab';
    fab.innerHTML = '<img src="https://i.postimg.cc/3wJFzXWv/resized-image.jpg" alt="Menu">';
    document.body.appendChild(fab);
    
    // ========== TẠO PANEL MENU CHÍNH ==========
    const panel = document.createElement('div');
    panel.className = 'main-menu-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="main-menu-header" id="mainMenuHeader">
            <span class="main-menu-title">Control Panel</span>
            <button class="main-menu-close" id="closeMenuBtn">✖</button>
        </div>
        <div class="main-menu-content">
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">🎯 Auto Clicker</span>
                    <span class="menu-item-desc">Auto click theo toa do</span>
                </div>
                <div class="toggle-switch" id="toggleAutoClicker">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">⚡ SpeedHack</span>
                    <span class="menu-item-desc">Tang toc game (Coming soon)</span>
                </div>
                <div class="toggle-switch" id="toggleSpeedHack">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="menu-item" id="musicItem">
                <div class="menu-item-left">
                    <span class="menu-item-title">🎵 Music</span>
                    <span class="menu-item-desc">Nghe nhạc & tắt âm game</span>
                </div>
                <div class="arrow-icon" id="musicArrow">▶</div>
            </div>
            <div id="musicSubmenu" class="submenu-container"></div>
            
            <div class="menu-item" id="vipItem">
                <div class="menu-item-left">
                    <span class="menu-item-title">👑 Log [VIP] <span class="vip-badge">VIP</span></span>
                    <span class="menu-item-desc">Tính năng đặc biệt dành cho VIP</span>
                </div>
                <div class="arrow-icon" id="vipArrow">▶</div>
            </div>
            <div id="vipSubmenu" class="submenu-container"></div>
        </div>
    `;
    document.body.appendChild(panel);
    
    // ========== CHỨC NĂNG TẮT ÂM THANH GAME ==========
    function muteGameSound() {
        console.log("%c🔇 DANG TAT AM THANH GAME...", "color: #ff9800");
        
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            try {
                var iframeDoc = iframes[i].contentDocument;
                if (iframeDoc) {
                    var iframeMedia = iframeDoc.querySelectorAll('audio, video');
                    for (var j = 0; j < iframeMedia.length; j++) {
                        iframeMedia[j].volume = 0;
                        iframeMedia[j].muted = true;
                    }
                }
            } catch(e) {}
        }
        
        var allMedia = document.querySelectorAll('audio, video');
        for (var i = 0; i < allMedia.length; i++) {
            if (!allMedia[i].isOurMusic) {
                allMedia[i].volume = 0;
                allMedia[i].muted = true;
            }
        }
        
        var originalPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function() {
            if (this.isOurMusic) {
                return originalPlay.call(this);
            }
            this.volume = 0;
            this.muted = true;
            return Promise.resolve();
        };
        
        gameSoundMuted = true;
        const statusSpan = document.getElementById('muteGameStatus');
        if (statusSpan) statusSpan.innerHTML = '✅ Đã tắt';
    }
    
    function unmuteGameSound() {
        var allMedia = document.querySelectorAll('audio, video');
        for (var i = 0; i < allMedia.length; i++) {
            if (!allMedia[i].isOurMusic) {
                allMedia[i].volume = 1;
                allMedia[i].muted = false;
            }
        }
        gameSoundMuted = false;
        const statusSpan = document.getElementById('muteGameStatus');
        if (statusSpan) statusSpan.innerHTML = '🔊 Chưa tắt';
    }
    
    // ========== CHỨC NĂNG PHÁT NHẠC ==========
    function playMusic() {
        try {
            if (myAudio && isPlaying) {
                console.log("Nhạc đang phát rồi!");
                return;
            }
            
            if (myAudio && !isPlaying) {
                myAudio.play();
                isPlaying = true;
            } else {
                myAudio = new Audio();
                myAudio.src = 'https://files.catbox.moe/l2a2j2.mp3';
                myAudio.loop = true;
                myAudio.volume = 0.8;
                myAudio.muted = false;
                myAudio.isOurMusic = true;
                
                myAudio.play().then(() => {
                    isPlaying = true;
                    const statusSpan = document.getElementById('songStatus');
                    if (statusSpan) {
                        statusSpan.innerHTML = '🎵 ĐANG PHÁT';
                        statusSpan.style.color = '#4caf50';
                    }
                    console.log("✅ Đang phát nhạc: Sớm như vậy");
                }).catch(err => console.error("Lỗi phát nhạc:", err));
            }
        } catch(e) { console.error(e); }
    }
    
    function stopMusic() {
        if (myAudio) {
            myAudio.pause();
            isPlaying = false;
            const statusSpan = document.getElementById('songStatus');
            if (statusSpan) {
                statusSpan.innerHTML = '⏸ ĐÃ DỪNG';
                statusSpan.style.color = '#ffeb3b';
            }
            console.log("Đã dừng nhạc");
        }
    }
    
    // ========== TẠO SUBMENU MUSIC ==========
    function createMusicSubmenu() {
        const submenuDiv = document.getElementById('musicSubmenu');
        if (!submenuDiv) return;
        
        submenuDiv.innerHTML = `
            <div class="submenu-item">
                <div class="submenu-content">
                    <span>🔇 Tắt âm thanh game</span>
                    <div class="toggle-switch" id="toggleMuteGame">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
                <span id="muteGameStatus" style="font-size: 10px; color: #ffeb3b;">🔊 Chưa tắt</span>
            </div>
            <div class="submenu-item compact-item">
                <div style="font-size: 12px; margin-bottom: 8px;">🎵 Sớm như vậy - Bùi Trường Linh</div>
                <div class="music-controls">
                    <button class="music-btn play-music-btn" id="playMusicBtn">▶ PLAY</button>
                    <button class="music-btn stop-music-btn" id="stopMusicBtn">⏹ DỪNG</button>
                </div>
                <div class="music-status">
                    Trạng thái: <span id="songStatus">⏸ Chưa phát</span>
                </div>
            </div>
        `;
        
        // Khôi phục trạng thái
        const toggleMuteGame = document.getElementById('toggleMuteGame');
        if (toggleMuteGame && musicFeatureState.isMuteGame) {
            toggleMuteGame.classList.add('active');
            muteGameSound();
        }
        
        if (toggleMuteGame) {
            toggleMuteGame.onclick = (e) => {
                e.stopPropagation();
                musicFeatureState.isMuteGame = !musicFeatureState.isMuteGame;
                if (musicFeatureState.isMuteGame) {
                    toggleMuteGame.classList.add('active');
                    muteGameSound();
                } else {
                    toggleMuteGame.classList.remove('active');
                    unmuteGameSound();
                }
            };
        }
        
        const playBtn = document.getElementById('playMusicBtn');
        if (playBtn) {
            playBtn.onclick = (e) => { 
                e.stopPropagation(); 
                playMusic();
            };
        }
        
        const stopBtn = document.getElementById('stopMusicBtn');
        if (stopBtn) {
            stopBtn.onclick = (e) => { 
                e.stopPropagation(); 
                stopMusic();
            };
        }
    }
    
    // ========== TẠO SUBMENU VIP ==========
    function createVipSubmenu() {
        const submenuDiv = document.getElementById('vipSubmenu');
        if (!submenuDiv) return;
        
        submenuDiv.innerHTML = `
            <div class="submenu-item">
                <div class="submenu-content">
                    <span>👑 Log hoạt động VIP</span>
                </div>
                <div style="font-size: 11px; color: #ffd700; margin-top: 8px; padding: 8px; background: #1a1a2e; border-radius: 8px;">
                    📝 Tính năng đang phát triển<br>
                    🔜 Sắp ra mắt: Auto Farm, Auto Quest, và nhiều tính năng VIP khác!
                </div>
            </div>
        `;
    }
    
    // ========== XỬ LÝ MỞ/ĐÓNG SUBMENU ==========
    let musicExpanded = false;
    let vipExpanded = false;
    
    const musicItem = document.getElementById('musicItem');
    const musicArrow = document.getElementById('musicArrow');
    const musicSubmenu = document.getElementById('musicSubmenu');
    
    if (musicItem) {
        musicItem.addEventListener('click', (e) => {
            e.stopPropagation();
            musicExpanded = !musicExpanded;
            if (musicExpanded) {
                musicArrow.classList.add('expanded');
                musicSubmenu.classList.add('show');
                createMusicSubmenu();
            } else {
                musicArrow.classList.remove('expanded');
                musicSubmenu.classList.remove('show');
            }
        });
    }
    
    const vipItem = document.getElementById('vipItem');
    const vipArrow = document.getElementById('vipArrow');
    const vipSubmenu = document.getElementById('vipSubmenu');
    
    if (vipItem) {
        vipItem.addEventListener('click', (e) => {
            e.stopPropagation();
            vipExpanded = !vipExpanded;
            if (vipExpanded) {
                vipArrow.classList.add('expanded');
                vipSubmenu.classList.add('show');
                createVipSubmenu();
            } else {
                vipArrow.classList.remove('expanded');
                vipSubmenu.classList.remove('show');
            }
        });
    }
    
    // ========== KÉO THẢ HỖ TRỢ CẢ PC & MOBILE ==========
    function makeDraggable(element, dragHandle = null, onClickCallback = null) {
        let isDragging = false;
        let dragStarted = false;
        let startX = 0, startY = 0;
        let initialLeft = 0, initialTop = 0;
        
        const handle = dragHandle || element;
        
        const onStart = (clientX, clientY) => {
            isDragging = true;
            dragStarted = false;
            startX = clientX;
            startY = clientY;
            
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            
            element.style.cursor = 'grabbing';
            if (dragHandle) dragHandle.style.cursor = 'grabbing';
        };
        
        const onMove = (clientX, clientY) => {
            if (!isDragging) return;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                dragStarted = true;
            }
            
            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            
            newLeft = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, newTop));
            
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        };
        
        const onEnd = () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = '';
                if (dragHandle) dragHandle.style.cursor = '';
                
                if (!dragStarted && onClickCallback) {
                    onClickCallback();
                }
                dragStarted = false;
            }
        };
        
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onStart(e.clientX, e.clientY);
        });
        
        window.addEventListener('mousemove', (e) => {
            if (isDragging) onMove(e.clientX, e.clientY);
        });
        
        window.addEventListener('mouseup', onEnd);
        
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            onStart(touch.clientX, touch.clientY);
        });
        
        window.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                onMove(touch.clientX, touch.clientY);
            }
        });
        
        window.addEventListener('touchend', onEnd);
    }
    
    makeDraggable(fab, null, () => {
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
        } else {
            panel.style.display = 'none';
        }
    });
    
    const panelHeader = document.getElementById('mainMenuHeader');
    makeDraggable(panel, panelHeader, null);
    
    document.getElementById('closeMenuBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = 'none';
    });
    
    // ========== XỬ LÝ TOGGLE ==========
    let autoClickerEnabled = false;
    const toggleAutoClicker = document.getElementById('toggleAutoClicker');
    if (toggleAutoClicker) {
        toggleAutoClicker.addEventListener('click', (e) => {
            e.stopPropagation();
            autoClickerEnabled = !autoClickerEnabled;
            if (autoClickerEnabled) {
                toggleAutoClicker.classList.add('active');
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://raw.githubusercontent.com/Minhbeo8/autoclickGUI/refs/heads/main/autoclick.js",
                    onload: function(response) {
                        if (response.status === 200) {
                            const script = document.createElement('script');
                            script.textContent = response.responseText;
                            document.head.appendChild(script);
                            script.remove();
                            console.log('✅ Auto Clicker đã tải!');
                        }
                    },
                    onerror: function(err) {
                        console.error('Lỗi tải Auto Clicker:', err);
                    }
                });
            } else {
                toggleAutoClicker.classList.remove('active');
                document.querySelectorAll('.autoClick-fab, .autoClick-panel, .autoClick-menu').forEach(el => el.remove());
            }
        });
    }
    
    const toggleSpeedHack = document.getElementById('toggleSpeedHack');
    if (toggleSpeedHack) {
        toggleSpeedHack.addEventListener('click', (e) => {
            e.stopPropagation();
            alert('⚡ SpeedHack đang được phát triển!');
        });
    }
    
    console.log('%c✅ Tampermonkey Script đã sẵn sàng!', 'color: #0f0; font-size: 14px');
    console.log('%c🎵 Click nút tròn góc phải dưới để mở menu', 'color: #ff9800; font-size: 12px');
})();