// ==UserScript==
// @name         Main Menu - Auto Clicker Controller
// @namespace    http://tampermonkey.net/
// @version      4.0
// @license      MIT
// @description  Menu chính điều khiển auto clicker + bảng nhập lệnh ẩn menu
// @author       Admin
// @icon         https://i.postimg.cc/3wJFzXWv/resized-image.jpg
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_deleteValue
// @grant        GM_listValues
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    // Kiem tra neu menu da ton tai thi xoa menu cu truoc khi tao moi
    if (document.querySelector('.main-menu-fab')) {
        document.querySelector('.main-menu-fab')?.remove();
        document.querySelector('.main-menu-panel')?.remove();
        document.querySelector('.command-panel')?.remove();
    }
    
    let isDragging = false;
    let dragStarted = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let loaderScriptInjected = false;
    let isCommandPanelOpen = false;
    
    // Trang thai hien/ẩn cua cac menu con
    let isAutoClickerVisible = true;
    let isSpeedHackVisible = true;
    
    // Trang thai toggle
    let toggleStates = {
        autoClicker: GM_getValue('toggle_autoClicker', false),
        speedHack: GM_getValue('toggle_speedHack', false),
        hideCommand: GM_getValue('toggle_hideCommand', false),
        coming3: GM_getValue('toggle_coming3', false)
    };
    
    // ========== CSS ==========
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
            transition: transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .main-menu-fab img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            pointer-events: none;
        }
        .main-menu-fab:active {
            cursor: grabbing;
            transform: scale(0.95);
        }
        .main-menu-panel {
            position: fixed;
            bottom: 150px;
            right: 20px;
            width: 280px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            border: 1px solid #667eea;
            color: white;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 14px;
            z-index: 999998;
            box-shadow: 0 8px 25px rgba(0,0,0,0.5);
            display: none;
            backdrop-filter: blur(5px);
        }
        .main-menu-panel.show { display: block; }
        .main-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(102,126,234,0.2);
            border-bottom: 1px solid #667eea;
            border-radius: 16px 16px 0 0;
            cursor: grab;
        }
        .main-menu-header:active { cursor: grabbing; }
        .main-menu-title { font-weight: bold; color: #667eea; font-size: 14px; }
        .main-menu-close {
            background: #ff4757;
            border: none;
            color: white;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
        }
        .main-menu-content { padding: 12px; }
        .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: #0f0f1a;
            border-radius: 10px;
        }
        .menu-item-left { display: flex; flex-direction: column; gap: 4px; }
        .menu-item-title { font-weight: bold; font-size: 14px; }
        .menu-item-desc { font-size: 11px; color: #aaa; }
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
        .hidden-menu {
            display: none !important;
        }
        
        /* Bang nhap lenh */
        .command-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 350px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            border: 2px solid #00adb5;
            color: white;
            font-family: 'Segoe UI', Arial, sans-serif;
            z-index: 1000000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.5);
            display: none;
        }
        .command-panel.show {
            display: block;
            animation: fadeIn 0.2s ease;
        }
        .command-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(0,173,181,0.2);
            border-bottom: 1px solid #00adb5;
            border-radius: 16px 16px 0 0;
        }
        .command-title {
            font-weight: bold;
            color: #00adb5;
            font-size: 16px;
        }
        .command-close {
            background: #ff4757;
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
        }
        .command-content {
            padding: 15px;
        }
        .command-input-group {
            margin-bottom: 15px;
        }
        .command-input-group label {
            display: block;
            margin-bottom: 5px;
            color: #aaa;
            font-size: 12px;
        }
        .command-input {
            width: 100%;
            padding: 10px;
            background: #0f0f1a;
            border: 1px solid #00adb5;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
        }
        .command-input:focus {
            outline: none;
            border-color: #ffa502;
        }
        .command-buttons {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .command-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s;
        }
        .command-btn.execute {
            background: #00adb5;
            color: white;
        }
        .command-btn.execute:hover {
            background: #008c93;
        }
        .command-btn.clear {
            background: #ff4757;
            color: white;
        }
        .command-status {
            margin-top: 15px;
            padding: 8px;
            background: #0f0f1a;
            border-radius: 8px;
            font-size: 12px;
            color: #ffa502;
            text-align: center;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @media (max-width: 768px) {
            .main-menu-panel { width: 260px; right: 10px; bottom: 130px; }
            .main-menu-fab { bottom: 70px; right: 10px; width: 50px; height: 50px; }
            .command-panel { width: 300px; }
        }
    `);
    
    // ========== BANG NHAP LENH ==========
    const commandPanel = document.createElement('div');
    commandPanel.className = 'command-panel';
    commandPanel.innerHTML = `
        <div class="command-header">
            <span class="command-title">🔒 Bang Dieu Khien Lenh An</span>
            <button class="command-close" id="commandCloseBtn">✖</button>
        </div>
        <div class="command-content">
            <div class="command-input-group">
                <label>📌 Nhap lenh:</label>
                <input type="text" class="command-input" id="commandInput" placeholder="/unauto  hoac  /unSpeed  hoac  /showauto  hoac  /showSpeed">
            </div>
            <div class="command-buttons">
                <button class="command-btn execute" id="executeCmdBtn">▶ Thuc thi</button>
                <button class="command-btn clear" id="clearCmdBtn">🗑️ Xoa</button>
            </div>
            <div class="command-status" id="commandStatus">
                💡 Nhap lenh de an/hien menu
            </div>
            <div style="font-size:11px; color:#666; margin-top:10px; text-align:center;">
                ⚡ Lenh hop le: /unauto | /unSpeed | /showauto | /showSpeed
            </div>
        </div>
    `;
    document.body.appendChild(commandPanel);
    
    // ========== XU LY BANG LENH ==========
    function showCommandPanel() {
        commandPanel.classList.add('show');
        isCommandPanelOpen = true;
        document.getElementById('commandInput').focus();
    }
    
    function hideCommandPanel() {
        commandPanel.classList.remove('show');
        isCommandPanelOpen = false;
    }
    
    function executeCommand() {
        const input = document.getElementById('commandInput');
        const cmd = input.value.trim().toLowerCase();
        const statusDiv = document.getElementById('commandStatus');
        
        if (!cmd) {
            statusDiv.innerHTML = '⚠️ Vui long nhap lenh!';
            statusDiv.style.color = '#ffa502';
            return;
        }
        
        if (cmd === '/unauto') {
            // An menu auto clicker
            isAutoClickerVisible = false;
            document.querySelectorAll('.autoClick-fab, .autoClick-panel, .autoClick-menu, .coord-preview').forEach(el => {
                el.classList.add('hidden-menu');
            });
            statusDiv.innerHTML = '✅ Da an menu Auto Clicker!';
            statusDiv.style.color = '#00adb5';
            showNotification('🔒 Auto Clicker da duoc an!', '#ff4757');
        }
        else if (cmd === '/unSpeed' || cmd === '/unspeed') {
            // An menu speedhack
            isSpeedHackVisible = false;
            const speedElements = document.querySelectorAll('[class*="speed"], [id*="speed"]');
            speedElements.forEach(el => {
                el.classList.add('hidden-menu');
            });
            statusDiv.innerHTML = '✅ Da an menu SpeedHack!';
            statusDiv.style.color = '#00adb5';
            showNotification('⚡ SpeedHack da duoc an!', '#ff4757');
        }
        else if (cmd === '/showauto') {
            // Hien lai menu auto clicker
            isAutoClickerVisible = true;
            document.querySelectorAll('.autoClick-fab, .autoClick-panel, .autoClick-menu, .coord-preview').forEach(el => {
                el.classList.remove('hidden-menu');
            });
            statusDiv.innerHTML = '✅ Da hien lai menu Auto Clicker!';
            statusDiv.style.color = '#00adb5';
            showNotification('🔓 Auto Clicker da duoc hien lai!', '#00adb5');
        }
        else if (cmd === '/showSpeed' || cmd === '/showspeed') {
            // Hien lai menu speedhack
            isSpeedHackVisible = true;
            const speedElements = document.querySelectorAll('[class*="speed"], [id*="speed"]');
            speedElements.forEach(el => {
                el.classList.remove('hidden-menu');
            });
            statusDiv.innerHTML = '✅ Da hien lai menu SpeedHack!';
            statusDiv.style.color = '#00adb5';
            showNotification('⚡ SpeedHack da duoc hien lai!', '#00adb5');
        }
        else {
            statusDiv.innerHTML = `❌ Lenh "${cmd}" khong hop le! Chi chap nhan: /unauto, /unSpeed, /showauto, /showSpeed`;
            statusDiv.style.color = '#ff4757';
        }
        
        // Xoa input sau khi thuc thi (neu khong phai lenh sai)
        if (cmd === '/unauto' || cmd === '/unspeed' || cmd === '/showauto' || cmd === '/showspeed') {
            input.value = '';
            setTimeout(() => {
                statusDiv.innerHTML = '💡 Nhap lenh de an/hien menu';
                statusDiv.style.color = '#ffa502';
            }, 2000);
        }
    }
    
    function clearCommandInput() {
        document.getElementById('commandInput').value = '';
        document.getElementById('commandStatus').innerHTML = '💡 Da xoa! Nhap lenh moi.';
        document.getElementById('commandStatus').style.color = '#ffa502';
        setTimeout(() => {
            if (document.getElementById('commandStatus').innerHTML === '💡 Da xoa! Nhap lenh moi.') {
                document.getElementById('commandStatus').innerHTML = '💡 Nhap lenh de an/hien menu';
            }
        }, 2000);
    }
    
    function showNotification(message, color) {
        const noti = document.createElement('div');
        noti.textContent = message;
        noti.style.cssText = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:${color}; color:white; padding:8px 16px; border-radius:8px; z-index:10000000; font-size:12px;`;
        document.body.appendChild(noti);
        setTimeout(() => noti.remove(), 2000);
    }
    
    // ========== TAO MENU CHINH ==========
    const fab = document.createElement('div');
    fab.className = 'main-menu-fab';
    
    const avatarImg = document.createElement('img');
    avatarImg.src = 'https://i.postimg.cc/3wJFzXWv/resized-image.jpg';
    avatarImg.alt = 'Menu';
    fab.appendChild(avatarImg);
    document.body.appendChild(fab);
    
    const panel = document.createElement('div');
    panel.className = 'main-menu-panel';
    panel.innerHTML = `
        <div class="main-menu-header" id="mainMenuHeader">
            <span class="main-menu-title">Control Panel</span>
            <button class="main-menu-close" id="closeMenuBtn">✖</button>
        </div>
        <div class="main-menu-content">
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">🎯 Auto Clicker</span>
                    <span class="menu-item-desc" id="autoClickerDesc">Auto click theo toa do</span>
                </div>
                <div class="toggle-switch" id="toggleAutoClicker">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">⚡ SpeedHack</span>
                    <span class="menu-item-desc" id="speedHackDesc">Tang toc game (Coming soon)</span>
                </div>
                <div class="toggle-switch" id="toggleSpeedHack">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">🔒 Lenh An</span>
                    <span class="menu-item-desc">Bat de mo bang nhap lenh an/hien menu</span>
                </div>
                <div class="toggle-switch" id="toggleHideCommand">
                    <div class="toggle-slider"></div>
                </div>
            </div>
            <div class="menu-item">
                <div class="menu-item-left">
                    <span class="menu-item-title">📦 Tinh nang 3</span>
                    <span class="menu-item-desc">Coming soon</span>
                </div>
                <div class="toggle-switch" id="toggleComing3">
                    <div class="toggle-slider"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
    
    // ========== CAP NHAT UI ==========
    function updateToggleUI() {
        const toggleAuto = document.getElementById('toggleAutoClicker');
        const toggleSpeed = document.getElementById('toggleSpeedHack');
        const toggleHide = document.getElementById('toggleHideCommand');
        const toggle3 = document.getElementById('toggleComing3');
        
        if (toggleAuto) {
            if (toggleStates.autoClicker) toggleAuto.classList.add('active');
            else toggleAuto.classList.remove('active');
        }
        if (toggleSpeed) {
            if (toggleStates.speedHack) toggleSpeed.classList.add('active');
            else toggleSpeed.classList.remove('active');
        }
        if (toggleHide) {
            if (toggleStates.hideCommand) toggleHide.classList.add('active');
            else toggleHide.classList.remove('active');
        }
        if (toggle3) {
            if (toggleStates.coming3) toggle3.classList.add('active');
            else toggle3.classList.remove('active');
        }
        
        // Cap nhat mo ta neu dang bi an
        const autoDesc = document.getElementById('autoClickerDesc');
        const speedDesc = document.getElementById('speedHackDesc');
        
        if (autoDesc) {
            if (!isAutoClickerVisible) {
                autoDesc.innerHTML = 'Auto click theo toa do <span style="color:#ff4757;">(ĐÃ ẨN)</span>';
            } else {
                autoDesc.innerHTML = 'Auto click theo toa do';
            }
        }
        
        if (speedDesc) {
            if (!isSpeedHackVisible) {
                speedDesc.innerHTML = 'Tang toc game <span style="color:#ff4757;">(ĐÃ ẨN)</span>';
            } else {
                speedDesc.innerHTML = 'Tang toc game (Coming soon)';
            }
        }
    }
    
    // ========== LOAD SCRIPT GITHUB ==========
    function loadAutoClickerScript() {
        if (loaderScriptInjected) {
            console.log('Auto Clicker da duoc tai');
            return;
        }
        
        console.log('Dang tai Auto Clicker script tu GitHub...');
        
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                const sourceUrl = "https://raw.githubusercontent.com/Minhbeo8/autoclickGUI/refs/heads/main/autoclick.js";
                if (window._autoClickerLoaded) return;
                window._autoClickerLoaded = true;
                
                function loadScript(url, callback) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url + '?t=' + Date.now(), true);
                    xhr.onload = function() {
                        if (xhr.status === 200 && xhr.responseText) {
                            try {
                                new Function(xhr.responseText)();
                                if (callback) callback();
                            } catch(e) { console.error('Loi execute:', e); }
                        } else {
                            console.error('Khong the tai script:', xhr.status);
                        }
                    };
                    xhr.onerror = function() { console.error('Loi ket noi'); };
                    xhr.send();
                }
                
                loadScript(sourceUrl);
                console.log('Auto Clicker Loader da duoc khoi tao');
            })();
        `;
        document.head.appendChild(script);
        loaderScriptInjected = true;
        
        showNotification('Auto Clicker da duoc kich hoat!', '#00adb5');
        
        // Quet lai de tim menu va ap dung trang thai an neu can
        setTimeout(() => {
            if (!isAutoClickerVisible) {
                document.querySelectorAll('.autoClick-fab, .autoClick-panel, .autoClick-menu, .coord-preview').forEach(el => {
                    el.classList.add('hidden-menu');
                });
            }
        }, 2000);
    }
    
    // ========== UNLOAD SCRIPT ==========
    function unloadAutoClickerScript() {
        console.log('Dang tat Auto Clicker...');
        
        const elementsToRemove = [
            '.autoClick-fab',
            '.autoClick-panel',
            '.coord-preview'
        ];
        
        elementsToRemove.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });
        
        document.querySelectorAll('style').forEach(style => {
            if (style.textContent.includes('autoClick-fab') || 
                style.textContent.includes('autoClick-panel') ||
                style.textContent.includes('coord-preview')) {
                if (!style.textContent.includes('main-menu')) {
                    style.remove();
                }
            }
        });
        
        delete window._autoClickerLoaded;
        delete window.autoClickerInitialized;
        
        loaderScriptInjected = false;
        showNotification('Auto Clicker da duoc tat!', '#ff4757');
    }
    
    // ========== XU LY TOGGLE ==========
    function handleToggle(item, isOn) {
        switch(item) {
            case 'autoClicker':
                if (isOn) {
                    loadAutoClickerScript();
                } else {
                    unloadAutoClickerScript();
                }
                break;
            case 'speedHack':
                if (isOn) {
                    alert('Tinh nang SpeedHack dang duoc phat trien!');
                    setTimeout(() => {
                        toggleStates.speedHack = false;
                        GM_setValue('toggle_speedHack', false);
                        updateToggleUI();
                    }, 100);
                }
                break;
            case 'hideCommand':
                if (isOn) {
                    showCommandPanel();
                } else {
                    hideCommandPanel();
                    showNotification('Bang lenh da dong!', '#ff4757');
                }
                break;
            case 'coming3':
                if (isOn) {
                    alert('Tinh nang dang duoc phat trien! Coming soon.');
                    setTimeout(() => {
                        toggleStates.coming3 = false;
                        GM_setValue('toggle_coming3', false);
                        updateToggleUI();
                    }, 100);
                }
                break;
        }
    }
    
    // ========== KEO THA FAB ==========
    fab.addEventListener('mousedown', (e) => {
        if (e.target === fab || fab.contains(e.target)) {
            isDragging = true;
            dragStarted = false;
            dragOffsetX = e.clientX - fab.offsetLeft;
            dragOffsetY = e.clientY - fab.offsetTop;
            fab.style.cursor = 'grabbing';
            fab.style.transition = 'none';
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    fab.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDragging = true;
        dragStarted = false;
        dragOffsetX = touch.clientX - fab.offsetLeft;
        dragOffsetY = touch.clientY - fab.offsetTop;
        fab.style.cursor = 'grabbing';
        fab.style.transition = 'none';
        e.preventDefault();
        e.stopPropagation();
    });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            dragStarted = true;
            let left = e.clientX - dragOffsetX;
            let top = e.clientY - dragOffsetY;
            left = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, left));
            top = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, top));
            fab.style.left = left + 'px';
            fab.style.top = top + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
        }
    });
    
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            dragStarted = true;
            const touch = e.touches[0];
            let left = touch.clientX - dragOffsetX;
            let top = touch.clientY - dragOffsetY;
            left = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, left));
            top = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, top));
            fab.style.left = left + 'px';
            fab.style.top = top + 'px';
            fab.style.right = 'auto';
            fab.style.bottom = 'auto';
            e.preventDefault();
        }
    });
    
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            fab.style.cursor = 'grab';
            fab.style.transition = '';
            setTimeout(() => {
                if (!dragStarted) {
                    panel.classList.toggle('show');
                }
                dragStarted = false;
            }, 10);
        }
    });
    
    window.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            fab.style.cursor = 'grab';
            fab.style.transition = '';
            setTimeout(() => {
                if (!dragStarted) {
                    panel.classList.toggle('show');
                }
                dragStarted = false;
            }, 10);
        }
    });
    
    // ========== KEO THA PANEL ==========
    let panelDragging = false;
    let panelOffsetX, panelOffsetY;
    const panelHeader = document.getElementById('mainMenuHeader');
    
    panelHeader.addEventListener('mousedown', (e) => {
        if (e.target === panelHeader || e.target.classList.contains('main-menu-title')) {
            panelDragging = true;
            panelOffsetX = e.clientX - panel.offsetLeft;
            panelOffsetY = e.clientY - panel.offsetTop;
            panel.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    panelHeader.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        panelDragging = true;
        panelOffsetX = touch.clientX - panel.offsetLeft;
        panelOffsetY = touch.clientY - panel.offsetTop;
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', (e) => {
        if (panelDragging) {
            let left = e.clientX - panelOffsetX;
            let top = e.clientY - panelOffsetY;
            left = Math.min(window.innerWidth - panel.offsetWidth, Math.max(0, left));
            top = Math.min(window.innerHeight - panel.offsetHeight, Math.max(0, top));
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
    });
    
    window.addEventListener('touchmove', (e) => {
        if (panelDragging) {
            const touch = e.touches[0];
            let left = touch.clientX - panelOffsetX;
            let top = touch.clientY - panelOffsetY;
            left = Math.min(window.innerWidth - panel.offsetWidth, Math.max(0, left));
            top = Math.min(window.innerHeight - panel.offsetHeight, Math.max(0, top));
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            e.preventDefault();
        }
    });
    
    window.addEventListener('mouseup', () => { panelDragging = false; panel.style.cursor = 'default'; });
    window.addEventListener('touchend', () => { panelDragging = false; });
    
    // ========== DONG PANEL ==========
    document.getElementById('closeMenuBtn').addEventListener('click', () => {
        panel.classList.remove('show');
    });
    
    // ========== BANG LENH EVENTS ==========
    document.getElementById('commandCloseBtn').addEventListener('click', () => {
        hideCommandPanel();
        // Tat toggle khi dong bang
        toggleStates.hideCommand = false;
        GM_setValue('toggle_hideCommand', false);
        updateToggleUI();
    });
    
    document.getElementById('executeCmdBtn').addEventListener('click', executeCommand);
    document.getElementById('clearCmdBtn').addEventListener('click', clearCommandInput);
    
    // Nhan Enter de thuc thi
    document.getElementById('commandInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeCommand();
        }
    });
    
    // ========== TOGGLE EVENTS ==========
    document.getElementById('toggleAutoClicker').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates.autoClicker = !toggleStates.autoClicker;
        GM_setValue('toggle_autoClicker', toggleStates.autoClicker);
        updateToggleUI();
        handleToggle('autoClicker', toggleStates.autoClicker);
    });
    
    document.getElementById('toggleSpeedHack').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates.speedHack = !toggleStates.speedHack;
        GM_setValue('toggle_speedHack', toggleStates.speedHack);
        updateToggleUI();
        handleToggle('speedHack', toggleStates.speedHack);
    });
    
    document.getElementById('toggleHideCommand').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates.hideCommand = !toggleStates.hideCommand;
        GM_setValue('toggle_hideCommand', toggleStates.hideCommand);
        updateToggleUI();
        handleToggle('hideCommand', toggleStates.hideCommand);
    });
    
    document.getElementById('toggleComing3').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStates.coming3 = !toggleStates.coming3;
        GM_setValue('toggle_coming3', toggleStates.coming3);
        updateToggleUI();
        handleToggle('coming3', toggleStates.coming3);
    });
    
    // ========== KHOI TAO ==========
    updateToggleUI();
    
    if (toggleStates.autoClicker) {
        setTimeout(() => loadAutoClickerScript(), 1000);
    }
    
    console.log('Main menu da san sang!');
    console.log('📌 Bat toggle "Lenh An" de mo bang nhap lenh');
    console.log('   Lenh hop le:');
    console.log('   /unauto     - An menu Auto Clicker');
    console.log('   /unSpeed    - An menu SpeedHack');
    console.log('   /showauto   - Hien menu Auto Clicker');
    console.log('   /showSpeed  - Hien menu SpeedHack');
})();