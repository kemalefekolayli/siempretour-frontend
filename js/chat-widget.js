// Siempre Tour Chat Widget
(function () {
    var CHATBOT_API = 'http://localhost:8081/api/chat';
    var isOpen = false;
    var sending = false;

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
            var data = sessionStorage.getItem('siempre_chat');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(messages) {
        try {
            // Keep last 20 messages to avoid token overflow
            var trimmed = messages.slice(-20);
            sessionStorage.setItem('siempre_chat', JSON.stringify(trimmed));
        } catch (e) { /* ignore */ }
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
            var el = document.createElement('div');
            el.className = 'chat-msg ' + msg.role;
            el.textContent = msg.content;
            container.appendChild(el);
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

    function sendMessage() {
        if (sending) return;

        var input = document.getElementById('chatInput');
        var msg = input.value.trim();
        if (!msg) return;

        input.value = '';
        sending = true;

        var sendBtn = document.getElementById('chatSend');
        if (sendBtn) sendBtn.disabled = true;

        // Add user message
        var history = getHistory();
        history.push({ role: 'user', content: msg });
        saveHistory(history);
        renderMessages();

        // Show typing
        showTyping(true);

        // Send to chatbot API
        fetch(CHATBOT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                language: getLang(),
                history: history.slice(-10) // Send last 10 messages for context
            })
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            showTyping(false);
            if (data && data.message) {
                history.push({ role: 'assistant', content: data.message });
                saveHistory(history);
                renderMessages();
            }
        })
        .catch(function (err) {
            showTyping(false);
            var errMsg = getLang() === 'en'
                ? 'Sorry, I could not connect. Please try again.'
                : 'Bağlantı kurulamadı. Lütfen tekrar deneyin.';
            history.push({ role: 'assistant', content: errMsg });
            saveHistory(history);
            renderMessages();
        })
        .finally(function () {
            sending = false;
            if (sendBtn) sendBtn.disabled = false;
            input.focus();
        });
    }

    function toggleChat() {
        var win = document.getElementById('chatWindow');
        if (!win) return;
        isOpen = !isOpen;
        win.className = 'chat-window' + (isOpen ? ' open' : '');
        if (isOpen) {
            renderMessages();
            var input = document.getElementById('chatInput');
            if (input) setTimeout(function () { input.focus(); }, 100);
        }
    }

    function injectWidget() {
        var lang = getLang();
        var placeholder = lang === 'en' ? 'Type your message...' : 'Mesajınızı yazın...';
        var sendText = lang === 'en' ? 'Send' : 'Gönder';
        var typingText = lang === 'en' ? 'Assistant is typing...' : 'Asistan yazıyor...';

        var html = '' +
            '<button class="chat-bubble" id="chatBubble" aria-label="Chat">' +
                '<i class="fa fa-comment"></i>' +
            '</button>' +
            '<div class="chat-window" id="chatWindow">' +
                '<div class="chat-header">' +
                    '<span class="chat-header-title">Siempre Tour Asistan</span>' +
                    '<button class="chat-header-close" id="chatClose">&times;</button>' +
                '</div>' +
                '<div class="chat-messages" id="chatMessages"></div>' +
                '<div class="chat-typing" id="chatTyping">' + typingText + '</div>' +
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
