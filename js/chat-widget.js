// Siempre Tour Chat Widget
(function () {
    var CHATBOT_API = 'http://localhost:8081/api/chat';
    var SEND_TIMEOUT = 20000; // 20 saniye
    var RATE_LIMIT_COUNT = 5; // max mesaj
    var RATE_LIMIT_WINDOW = 60000; // 60 saniye icinde
    var isOpen = false;
    var sending = false;
    var unreadCount = 0;
    var sendTimestamps = [];

    var SYSTEM_PROMPT = 'Sen Siempre Tour seyahat acentesinin asistanısın. SADECE seyahat, ' +
        'tur, tatil, destinasyon, otel, uçuş, vize, pasaport ve Siempre Tour hizmetleri ' +
        'hakkında soruları cevapla. Bunların dışındaki konularda (programlama, matematik, ' +
        'tarih, siyaset, oyun, eğlence vb.) kibarca "Ben sadece seyahat ve tur konularında ' +
        'yardımcı olabilirim. Başka bir seyahat sorunuz varsa memnuniyetle yardımcı olurum!" ' +
        'de ve konuyu seyahate yönlendir. Türkçe veya İngilizce cevap ver, kullanıcının diline göre.';

    function getLang() {
        return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
    }

    function getWelcomeMessage() {
        var lang = getLang();
        if (lang === 'en') {
            return 'Hello! How can I help you? I can help you find tours, recommend destinations, or answer your travel questions.';
        }
        return 'Merhaba! Size nasıl yardımcı olabilirim? Tur aramanızda, destinasyon önerilerinde veya seyahat sorularınızda yardımcı olabilirim.';
    }

    function getHistory() {
        try {
            var data = localStorage.getItem('siempre_chat');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(messages) {
        try {
            var trimmed = messages.slice(-20);
            localStorage.setItem('siempre_chat', JSON.stringify(trimmed));
        } catch (e) { /* ignore */ }
    }

    function clearHistory() {
        localStorage.removeItem('siempre_chat');
        renderMessages();
    }

    function updateBadge() {
        var badge = document.getElementById('chatBadge');
        if (!badge) return;
        if (unreadCount > 0 && !isOpen) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.className = 'chat-badge show';
        } else {
            badge.className = 'chat-badge';
            unreadCount = 0;
        }
    }

    function copyText(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
    }

    function createMsgEl(msg) {
        var el = document.createElement('div');
        el.className = 'chat-msg ' + msg.role;
        el.textContent = msg.content;

        var copyBtn = document.createElement('button');
        copyBtn.className = 'chat-copy-btn';
        copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
        copyBtn.title = getLang() === 'en' ? 'Copy' : 'Kopyala';
        copyBtn.addEventListener('click', function () {
            copyText(msg.content);
            copyBtn.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(function () {
                copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
            }, 1500);
        });
        el.appendChild(copyBtn);

        return el;
    }

    function renderMessages() {
        var container = document.getElementById('chatMessages');
        if (!container) return;

        var messages = getHistory();
        container.innerHTML = '';

        // Welcome message
        var welcome = document.createElement('div');
        welcome.className = 'chat-msg assistant';
        welcome.textContent = getWelcomeMessage();
        container.appendChild(welcome);

        messages.forEach(function (msg) {
            container.appendChild(createMsgEl(msg));
        });

        container.scrollTop = container.scrollHeight;
    }

    function showTyping(show) {
        var el = document.getElementById('chatTyping');
        if (el) {
            el.className = 'chat-typing' + (show ? ' show' : '');
            if (show) {
                var container = document.getElementById('chatMessages');
                if (container) container.scrollTop = container.scrollHeight;
            }
        }
    }

    function isRateLimited() {
        var now = Date.now();
        sendTimestamps = sendTimestamps.filter(function (t) { return now - t < RATE_LIMIT_WINDOW; });
        return sendTimestamps.length >= RATE_LIMIT_COUNT;
    }

    function addErrorMsg(errMsg, msg) {
        var history = getHistory();
        history.push({ role: 'assistant', content: errMsg, failed: !!msg });
        saveHistory(history);
        renderMessages();

        if (msg) {
            var container = document.getElementById('chatMessages');
            if (container && container.lastChild) {
                var retryBtn = document.createElement('button');
                retryBtn.className = 'chat-retry-btn';
                retryBtn.textContent = getLang() === 'en' ? 'Retry' : 'Tekrar Dene';
                retryBtn.addEventListener('click', function () {
                    var h = getHistory();
                    h.pop();
                    saveHistory(h);
                    renderMessages();
                    doSend(msg);
                });
                container.lastChild.appendChild(retryBtn);
            }
        }
    }

    function doSend(msg) {
        sending = true;
        var sendBtn = document.getElementById('chatSend');
        if (sendBtn) sendBtn.disabled = true;

        var history = getHistory();
        var abortController = new AbortController();
        var timeoutId = setTimeout(function () { abortController.abort(); }, SEND_TIMEOUT);

        showTyping(true);

        fetch(CHATBOT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                language: getLang(),
                history: history.slice(-10),
                systemPrompt: SYSTEM_PROMPT
            }),
            signal: abortController.signal
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            showTyping(false);
            if (data && data.message) {
                history = getHistory();
                history.push({ role: 'assistant', content: data.message });
                saveHistory(history);
                renderMessages();
                if (!isOpen) {
                    unreadCount++;
                    updateBadge();
                }
            }
        })
        .catch(function (err) {
            showTyping(false);
            var errMsg;
            if (err && err.name === 'AbortError') {
                errMsg = getLang() === 'en'
                    ? 'Response timed out. Please try again.'
                    : 'Yanıt zaman aşımına uğradı. Lütfen tekrar deneyin.';
            } else {
                errMsg = getLang() === 'en'
                    ? 'Sorry, I could not connect. Please try again.'
                    : 'Bağlantı kurulamadı. Lütfen tekrar deneyin.';
            }
            addErrorMsg(errMsg, msg);
        })
        .finally(function () {
            clearTimeout(timeoutId);
            sending = false;
            if (sendBtn) sendBtn.disabled = false;
            var input = document.getElementById('chatInput');
            if (input) input.focus();
        });
    }

    function sendMessage() {
        if (sending) return;

        var input = document.getElementById('chatInput');
        var msg = input.value.trim();
        if (!msg) return;

        // Rate limit check
        if (isRateLimited()) {
            var rlMsg = getLang() === 'en'
                ? 'You are sending messages too fast. Please wait a moment.'
                : 'Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.';
            addErrorMsg(rlMsg, null);
            return;
        }
        sendTimestamps.push(Date.now());

        input.value = '';

        var history = getHistory();
        history.push({ role: 'user', content: msg });
        saveHistory(history);
        renderMessages();

        doSend(msg);
    }

    function toggleChat() {
        var win = document.getElementById('chatWindow');
        if (!win) return;
        isOpen = !isOpen;
        win.className = 'chat-window' + (isOpen ? ' open' : '');
        if (isOpen) {
            unreadCount = 0;
            updateBadge();
            renderMessages();
            var input = document.getElementById('chatInput');
            if (input) setTimeout(function () { input.focus(); }, 100);
        }
    }

    function injectWidget() {
        var lang = getLang();
        var placeholder = lang === 'en' ? 'Type your message...' : 'Mesajınızı yazın...';
        var sendText = lang === 'en' ? 'Send' : 'Gönder';
        var clearTitle = lang === 'en' ? 'Clear chat' : 'Sohbeti temizle';

        var html = '' +
            '<button class="chat-bubble" id="chatBubble" aria-label="Chat">' +
                '<i class="fa fa-comment"></i>' +
                '<span class="chat-badge" id="chatBadge"></span>' +
            '</button>' +
            '<div class="chat-window" id="chatWindow">' +
                '<div class="chat-header">' +
                    '<span class="chat-header-title">Siempre Tour Asistan</span>' +
                    '<div class="chat-header-actions">' +
                        '<button class="chat-header-clear" id="chatClear" title="' + clearTitle + '">' +
                            '<i class="fa fa-trash"></i>' +
                        '</button>' +
                        '<button class="chat-header-close" id="chatClose">&times;</button>' +
                    '</div>' +
                '</div>' +
                '<div class="chat-messages" id="chatMessages"></div>' +
                '<div class="chat-typing" id="chatTyping">' +
                    '<div class="chat-typing-dots"><span></span><span></span><span></span></div>' +
                '</div>' +
                '<div class="chat-input-area">' +
                    '<input type="text" class="chat-input" id="chatInput" placeholder="' + placeholder + '">' +
                    '<button class="chat-send" id="chatSend">' + sendText + '</button>' +
                '</div>' +
            '</div>';

        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        while (wrapper.firstChild) {
            document.body.appendChild(wrapper.firstChild);
        }

        // Events
        document.getElementById('chatBubble').addEventListener('click', toggleChat);
        document.getElementById('chatClose').addEventListener('click', toggleChat);
        document.getElementById('chatClear').addEventListener('click', function () {
            var confirmMsg = lang === 'en' ? 'Clear chat history?' : 'Sohbet geçmişi silinsin mi?';
            if (confirm(confirmMsg)) {
                clearHistory();
            }
        });
        document.getElementById('chatSend').addEventListener('click', sendMessage);
        document.getElementById('chatInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWidget);
    } else {
        injectWidget();
    }
})();
