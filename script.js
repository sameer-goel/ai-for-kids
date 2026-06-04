document.addEventListener('DOMContentLoaded', () => {
    initModal();
    initForm();
    initChatDemo();
});

function initModal() {
    const modal = document.getElementById('signupModal');
    const closeBtn = document.getElementById('modalClose');
    const triggers = [
        document.getElementById('heroCta'),
        document.getElementById('navCta'),
        document.getElementById('finalCta'),
        document.getElementById('ngoCta')
    ];

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    triggers.forEach(btn => {
        if (btn) btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function initForm() {
    const form = document.getElementById('signupForm');
    const formContainer = document.getElementById('modalForm');
    const successContainer = document.getElementById('modalSuccess');
    const addChildBtn = document.getElementById('addChildBtn');
    const childrenFields = document.getElementById('childrenFields');

    addChildBtn.addEventListener('click', () => {
        const entry = document.createElement('div');
        entry.className = 'child-entry';
        entry.innerHTML = `
            <div class="form-group">
                <label>Child's first name</label>
                <input type="text" class="child-name" placeholder="Name" required>
            </div>
            <div class="form-group">
                <label>Child's age</label>
                <select class="child-age" required>
                    <option value="8" selected>8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                </select>
            </div>
            <button type="button" class="btn-remove-child" onclick="this.parentElement.remove()">Remove</button>
        `;
        childrenFields.appendChild(entry);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const children = [];
        childrenFields.querySelectorAll('.child-entry').forEach(entry => {
            children.push({
                name: entry.querySelector('.child-name').value,
                age: entry.querySelector('.child-age').value
            });
        });

        const data = {
            email: document.getElementById('parentEmail').value,
            children: children
        };

        fetch('/api/signup', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).then(result => {
            if (result.success) {
                formContainer.style.display = 'none';
                successContainer.style.display = 'block';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join the Waitlist';
                alert('Something went wrong. Please try again.');
            }
        }).catch(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join the Waitlist';
            alert('Network error. Please try again.');
        });
    });
}

function initChatDemo() {
    const chatBad = document.getElementById('chatBad');
    const chatGood = document.getElementById('chatGood');
    const replayBtn = document.getElementById('replayBtn');
    if (!chatBad || !chatGood) return;

    let hasPlayed = false;
    let timeouts = [];

    function showTyping(container) {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return typing;
    }

    function typeText(element, text, callback) {
        element.textContent = '';
        element.classList.add('visible');
        let i = 0;
        const speed = 30 + Math.random() * 20;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                const container = element.closest('.chat-body');
                if (container) container.scrollTop = container.scrollHeight;
                const t = setTimeout(type, speed + (Math.random() * 15));
                timeouts.push(t);
            } else if (callback) {
                callback();
            }
        }
        type();
    }

    function animateChat(container) {
        const messages = container.querySelectorAll('.chat-msg, .chat-outcome');
        messages.forEach(msg => {
            msg.classList.remove('visible');
            const span = msg.querySelector('span');
            if (span && !span.dataset.original) {
                span.dataset.original = span.textContent;
            }
        });

        messages.forEach(msg => {
            const delay = parseInt(msg.dataset.delay) || 0;
            const isAi = msg.classList.contains('ai');
            const isUser = msg.classList.contains('user');
            const span = msg.querySelector('span');
            const originalText = span ? span.dataset.original : '';

            if (isUser) {
                const t = setTimeout(() => {
                    const inputIndicator = document.createElement('div');
                    inputIndicator.className = 'user-typing-indicator';
                    inputIndicator.innerHTML = '<span class="cursor-blink"></span>';
                    container.appendChild(inputIndicator);
                    container.scrollTop = container.scrollHeight;

                    const t2 = setTimeout(() => {
                        inputIndicator.remove();
                        msg.classList.add('visible');
                        if (span) span.textContent = '';
                        typeText(span, originalText);
                        container.scrollTop = container.scrollHeight;
                    }, 600);
                    timeouts.push(t2);
                }, delay);
                timeouts.push(t);
            } else if (isAi) {
                const typingTimeout = setTimeout(() => {
                    const typing = showTyping(container);
                    const revealTimeout = setTimeout(() => {
                        typing.remove();
                        msg.classList.add('visible');
                        if (span) span.textContent = '';
                        typeText(span, originalText);
                        container.scrollTop = container.scrollHeight;
                    }, 900);
                    timeouts.push(revealTimeout);
                }, delay);
                timeouts.push(typingTimeout);
            } else {
                const t = setTimeout(() => {
                    msg.classList.add('visible');
                    container.scrollTop = container.scrollHeight;
                }, delay);
                timeouts.push(t);
            }
        });
    }

    function startDemo() {
        timeouts.forEach(t => clearTimeout(t));
        timeouts = [];
        animateChat(chatBad);
        animateChat(chatGood);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                hasPlayed = true;
                startDemo();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(document.querySelector('.chat-demo-section'));

    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            hasPlayed = true;
            startDemo();
        });
    }
}
