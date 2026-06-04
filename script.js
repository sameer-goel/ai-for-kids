document.addEventListener('DOMContentLoaded', () => {
    initModal();
    initForm();
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
