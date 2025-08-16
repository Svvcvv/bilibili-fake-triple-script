// ==UserScript==
// @name         B站视频一键伪装三连
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  当某人要求你三连B站视频时帮你让他以为你已经三连了
// @author       Svvcvv
// @match        *://*.bilibili.com/video/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        if (document.querySelector('.fake-triple-btn')) return;

        // 创建按钮
        const fakeTripleBtn = document.createElement('div');
        fakeTripleBtn.className = 'fake-triple-btn video-toolbar-left-item';
        fakeTripleBtn.title = '伪装三连 (R) | 右键隐藏';
        fakeTripleBtn.innerHTML = `
            <span class="btn-text">伪装三连</span>
            <span class="hide-icon" style="margin-left:5px;display:none;">ⓧ</span>
        `;
        fakeTripleBtn.style.cssText = `
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 4px;
            padding: 0 12px;
            height: 36px;
            background-color: #FB7299;
            color: white;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            border: none;
            z-index: 999;
            transition: all 0.2s;
            vertical-align: middle;
            float: none;
            position: relative;
        `;

        // 鼠标悬停效果
        fakeTripleBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f95a8c';
            this.querySelector('.hide-icon').style.display = 'inline';
        });

        fakeTripleBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#FB7299';
            this.querySelector('.hide-icon').style.display = 'none';
        });

        // 完成动画
        const createSuccessAnimation = (button) => {
            const animation = document.createElement('div');
            animation.innerHTML = '✓ 已完成';
            animation.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #4CAF50;
                color: white;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s ease;
                z-index: 1;
            `;

            button.appendChild(animation);
            setTimeout(() => {
                animation.style.opacity = '1';
                animation.style.transform = 'scale(1)';
            }, 10);

            setTimeout(() => {
                animation.style.opacity = '0';
                animation.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (button.contains(animation)) button.removeChild(animation);
                }, 300);
            }, 1500);
        };

        // 点击触发伪装
        fakeTripleBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            const likeBtn = document.querySelector('.video-like') || document.querySelector('[title="点赞（Q）"]');
            if (likeBtn && !likeBtn.classList.contains('on')) likeBtn.classList.add('on');

            const coinBtn = document.querySelector('.video-coin') || document.querySelector('[title="投币（W）"]');
            if (coinBtn && !coinBtn.classList.contains('on')) coinBtn.classList.add('on');

            const favBtn = document.querySelector('.video-fav') || document.querySelector('[title="收藏（E）"]');
            if (favBtn && !favBtn.classList.contains('on')) favBtn.classList.add('on');

            createSuccessAnimation(this);
        });

        // 隐藏/显示按钮
        let isHidden = false;
        const hideButton = () => {
            fakeTripleBtn.style.display = 'none';
            isHidden = true;

            const tip = document.createElement('div');
            tip.textContent = '已隐藏按钮，按Shift+R重新显示';
            tip.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0,0,0,0.7);
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(tip);
            setTimeout(() => tip.style.opacity = '1', 10);
            setTimeout(() => {
                tip.style.opacity = '0';
                setTimeout(() => document.body.removeChild(tip), 300);
            }, 3000);
        };

        const showButton = () => {
            fakeTripleBtn.style.display = 'inline-flex';
            isHidden = false;
        };

        // 隐藏图标点击
        fakeTripleBtn.querySelector('.hide-icon').addEventListener('click', function(e) {
            e.stopPropagation();
            hideButton();
        });

        // 右键隐藏
        fakeTripleBtn.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            hideButton();
        });

        // 快捷键
        document.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey &&
                e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                fakeTripleBtn.click();
            }

            if (e.key.toLowerCase() === 'r' && e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                isHidden ? showButton() : hideButton();
            }
        });

        // 定位转发按钮并插入
        const findShareButton = () => {
            const selectors = [
                '.video-share.video-toolbar-left-item',
                '[class*="share"].video-toolbar-left-item',
                '[title="分享"].video-toolbar-left-item',
                '.toolbar-left [class*="share"]',
                '.ops [title*="分享"]'
            ];

            for (const selector of selectors) {
                const btn = document.querySelector(selector);
                if (btn) return btn;
            }

            const favBtn = document.querySelector('.video-fav.video-toolbar-left-item');
            if (favBtn && favBtn.nextSibling) {
                return favBtn.nextSibling.nodeType === 1 ? favBtn.nextSibling : favBtn.nextElementSibling;
            }

            return null;
        };

        const shareBtn = findShareButton();

        if (shareBtn) {
            const parent = shareBtn.parentNode;
            if (parent) {
                parent.style.display = 'flex';
                parent.style.alignItems = 'center';
            }
            shareBtn.parentNode.insertBefore(fakeTripleBtn, shareBtn.nextSibling);
        } else {
            const toolbars = [
                document.querySelector('.video-toolbar-left'),
                document.querySelector('.toolbar-left'),
                document.querySelector('.ops')
            ];

            let toolbar = toolbars.find(t => t);

            if (toolbar) {
                toolbar.appendChild(fakeTripleBtn);
            } else {
                document.body.appendChild(fakeTripleBtn);
                fakeTripleBtn.style.position = 'fixed';
                fakeTripleBtn.style.top = '20px';
                fakeTripleBtn.style.right = '20px';
            }
        }

    }, 3000);
})();

