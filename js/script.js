// ===========================================================
// THE HOLLOW REALM — site interactions
// One shared file, loaded on every page.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {

    highlightActiveNavLink();
    applyLoginState();
    addPressFeedback();
    initLoginForm();
    initBuyForm();
    initMobileMenu();
    initScrollReveal();
    initGalleryLightbox();

});

function initScrollReveal() {

    const targets = document.querySelectorAll(
        'main h1, main h2, main h3, main p, main li, .about-signoff'
    );

    if (!targets.length) return;

    targets.forEach(el => el.classList.add('reveal-on-scroll'));

    if (!('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}


// ---------------------------------------------------------
// Mark the nav link for the current page as active
// ---------------------------------------------------------
function highlightActiveNavLink() {

    const current = location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a[data-nav]').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === current);
    });
}


// ---------------------------------------------------------
// Demo login state — swaps the LOGIN button for a
// "logged in" state once a demo account exists.
// This is a front-end only demo: no real accounts,
// no passwords are checked or stored anywhere.
// ---------------------------------------------------------
function applyLoginState() {

    const loginBtn = document.querySelector('[data-login-btn]');
    if (!loginBtn) return;

    const user = localStorage.getItem('hollowrealm_demo_user');
    if (!user) return;

    loginBtn.innerHTML = `<i class="fa-solid fa-user-check" aria-hidden="true"></i> ${escapeHtml(user)}`;
    loginBtn.setAttribute('href', '#');
    loginBtn.setAttribute('aria-label', 'Log out of your demo account');

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Log out of your Hollow Realm account?')) {
            localStorage.removeItem('hollowrealm_demo_user');
            window.location.reload();
        }
    });
}


// ---------------------------------------------------------
// A tiny press effect so buttons/cards feel responsive,
// without blocking their real navigation.
// ---------------------------------------------------------
function addPressFeedback() {

    document.querySelectorAll('.card, .primary-btn, .secondary-btn, .format-option').forEach(el => {
        el.addEventListener('mousedown', () => { el.style.transform = 'scale(0.98)'; });
        el.addEventListener('mouseup', () => { el.style.transform = ''; });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}


// ---------------------------------------------------------
// Demo login form (login.html)
// Any email + password combination "works" — this is a
// front-end demo only, there is no real authentication.
// ---------------------------------------------------------
function initLoginForm() {

    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailField = document.getElementById('login-email');
        const message = document.getElementById('login-message');
        const email = emailField.value.trim();

        if (!email) {
            message.textContent = 'Enter an email to continue.';
            message.style.color = '#ff9d9d';
            message.classList.add('show');
            return;
        }

        const name = email.split('@')[0] || 'Traveler';
        localStorage.setItem('hollowrealm_demo_user', name);

        message.style.color = '#7bd4a0';
        message.textContent = `Welcome back, ${name}. Redirecting...`;
        message.classList.add('show');

        form.querySelector('button[type="submit"]').disabled = true;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1100);
    });
}


// ---------------------------------------------------------
// Demo checkout form (buy.html)
// No payment is ever processed — this only simulates the
// flow so the page has something to click through.
// ---------------------------------------------------------
function initBuyForm() {

    const form = document.getElementById('buy-form');
    if (!form) return;

    const prices = { ebook: 9.99, paperback: 18.99, bundle: 24.99 };
    const totalEl = document.getElementById('order-total-amount');

    function updateTotal() {
        const checked = form.querySelector('input[name="format"]:checked');
        const price = checked ? prices[checked.value] : 0;
        totalEl.textContent = `$${price.toFixed(2)}`;
    }

    form.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', updateTotal);
    });
    updateTotal();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = document.getElementById('buy-message');
        message.textContent = 'Demo purchase complete — thank you! No real payment was taken.';
        message.classList.add('show');

        form.querySelector('button[type="submit"]').disabled = true;
    });
}


// ---------------------------------------------------------
// Small helper to keep user-entered text safe when
// inserted back into the page (login display name).
// ---------------------------------------------------------
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initMobileMenu() {

    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-links');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {

        const isOpen = menu.classList.toggle('open');

        toggle.setAttribute('aria-expanded', isOpen);

        toggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

    });

    menu.querySelectorAll('a').forEach(link => {

        link.addEventListener('click', () => {

            menu.classList.remove('open');

            toggle.setAttribute('aria-expanded', 'false');

            toggle.innerHTML =
                '<i class="fa-solid fa-bars" aria-hidden="true"></i>';

        });

    });

}

// ---------------------------------------------------------
// Gallery lightbox (gallery.html)
// The clicked map grows out of its thumbnail into the centre
// of the screen, and shrinks back into the same spot on close.
// ---------------------------------------------------------
function initGalleryLightbox() {

    const items = document.querySelectorAll('.gallery-item');
    const box = document.getElementById('lightbox');

    if (!items.length || !box) return;

    const boxImg = document.getElementById('lightbox-img');
    const boxCap = document.getElementById('lightbox-caption');
    const closeBtn = box.querySelector('.lightbox-close');
    const THUMB_RADIUS = 18;

    let activeItem = null;
    let closing = false;
    let closeTimer = null;

    // Where the enlarged image sits WITHOUT any transform applied
    // (offset* ignores transforms, so this is safe mid-animation).
    function layoutRect(el) {
        return {
            left: el.offsetLeft,
            top: el.offsetTop,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    }

    // Transform that makes the enlarged image look exactly like its thumbnail.
    function shrinkTo(from, to) {
        const scale = from.width / to.width;
        const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
        const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
        return {
            transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
            radius: `${THUMB_RADIUS / scale}px`
        };
    }

    function animationMs() {
        const durations = getComputedStyle(boxImg).transitionDuration.split(',');
        return Math.max(...durations.map(d => parseFloat(d) * (d.includes('ms') ? 1 : 1000))) || 0;
    }

    function openBox(item) {

        if (closing || box.classList.contains('open')) return;

        activeItem = item;

        const thumb = item.querySelector('img');
        boxImg.alt = thumb.alt;
        boxCap.textContent = item.dataset.caption || '';
        boxImg.src = thumb.currentSrc || thumb.src;

        const start = () => {

            box.classList.add('open');
            document.body.style.overflow = 'hidden';

            const shrunk = shrinkTo(item.getBoundingClientRect(), layoutRect(boxImg));

            // start exactly on top of the thumbnail...
            boxImg.style.transition = 'none';
            boxImg.style.transform = shrunk.transform;
            boxImg.style.borderRadius = shrunk.radius;
            item.classList.add('is-lifted');
            void boxImg.offsetWidth;                 // force a reflow
            boxImg.style.transition = '';

            // ...then let it grow to full size
            requestAnimationFrame(() => {
                box.classList.add('show');
                boxImg.style.transform = '';
                boxImg.style.borderRadius = '';
            });

            closeBtn.focus({ preventScroll: true });
        };

        if (boxImg.complete && boxImg.naturalWidth) {
            start();
        } else {
            boxImg.addEventListener('load', start, { once: true });
        }
    }

    function closeBox() {

        if (closing || !box.classList.contains('open')) return;
        closing = true;

        const shrunk = shrinkTo(activeItem.getBoundingClientRect(), layoutRect(boxImg));

        box.classList.remove('show');
        boxImg.style.transform = shrunk.transform;
        boxImg.style.borderRadius = shrunk.radius;

        closeTimer = setTimeout(finishClose, animationMs() + 80);
    }

    function finishClose() {

        clearTimeout(closeTimer);

        box.classList.remove('open');
        boxImg.style.transition = 'none';
        boxImg.style.transform = '';
        boxImg.style.borderRadius = '';
        void boxImg.offsetWidth;
        boxImg.style.transition = '';

        document.body.style.overflow = '';

        if (activeItem) {
            activeItem.classList.remove('is-lifted');
            activeItem.focus({ preventScroll: true });
        }

        closing = false;
    }

    items.forEach(item => {
        item.addEventListener('click', () => openBox(item));
    });

    box.addEventListener('click', closeBox);

    document.addEventListener('keydown', (e) => {

        if (!box.classList.contains('open')) return;

        if (e.key === 'Escape') closeBox();

        // keep keyboard focus inside the lightbox
        if (e.key === 'Tab') {
            e.preventDefault();
            closeBtn.focus({ preventScroll: true });
        }
    });
}


/* =========================================================
   INTERACTIVE CHARACTER ARCHIVE
========================================================= */

const characterCards = document.querySelectorAll('.character-card');
const characterDetail = document.getElementById('character-detail');
const characterClose = document.getElementById('character-close');

const characterName = document.getElementById('character-name');
const characterRole = document.getElementById('character-role');
const characterDescription = document.getElementById('character-description');
const characterOrigin = document.getElementById('character-origin');
const characterBook = document.getElementById('character-book');
const characterImage = document.getElementById('character-image');

const characterData = {

    eric: {
        name: 'ERIC',
        role: 'THE OBSERVER',
        image: 'assets/eric.png',
        description: 'A curious and adventurous boy who often finds himself at the heart of trouble. Eric’s courage and determination make him one of the story’s central figures.',
        origin: 'Varindel',
        book: 'Book One'
    },

    jacob: {
        name: 'JACOB',
        role: 'THE CURIOUS ONE',
        image: 'assets/jacob.png',
        description: 'Eric’s closest friend and partner in nearly every adventure. Playful, loyal, and sometimes reckless, Jacob brings energy wherever he goes.',
        origin: 'Varindel',
        book: 'Book One'
    },

    alice: {
        name: 'ALICE VIREMONT',
        role: 'THE KINDHARTED',
        image: 'assets/alice.png',
        description: 'Kind-hearted yet strong-willed, Alice brings a different perspective to those around her. Beneath her calm nature lies a determination that shouldn’t be underestimated.',
        origin: 'Varindel',
        book: 'Book One'
    },

    reena: {
        name: 'MISS REENA',
        role: 'THE FAMILIAR FACE',
        image: 'assets/reena.png',
        description: 'A caring and responsible figure who has watched over the children of Varendel for years. Her patience and wisdom make her someone they can turn to when they need guidance',
        origin: 'Varindel',
        book: 'Book One'
    },

    nick: {
        name: 'NICK',
        role: 'THE FISHERMAN',
        image: 'assets/nick.png',
        description: 'A strong and experienced fisherman who makes his living on the waters around Varendel. Practical and straightforward, Nick is someone the islanders can rely on.',
        origin: 'Varindel',
        book: 'Book One'
    },

    goodman: {
        name: 'MRS. GOODMAN',
        role: 'A FAMILIAR PRESENCE',
        image: 'assets/goodman.png',
        description: 'A warm but firm figure whose presence brings a sense of order. She cares deeply for those around her, even when she doesn’t always show it.',
        origin: 'Varindel',
        book: 'Book One'
    },

    gerald: {
        name: 'GERALD',
        role: 'THE FISHERMAN',
        image: 'assets/gerald.png',
        description: 'A hardworking fisherman of Varendel Island, known for his strength and dependable nature. He is one of the islanders who knows the surrounding seas better than most.',
        origin: 'Varindel',
        book: 'Book One'
    },

    lucien: {
        name: 'LUCIEN VIREMONT',
        role: 'THE MAYOR',
        image: 'assets/lucien.png',
        description: 'The mayor of Varendel Island and a respected figure among its people. As Alice’s father, Lucius carries both the responsibilities of leadership and the burden of protecting his island.',
        origin: 'Varindel',
        book: 'Book One'
    }

};


/* OPEN CHARACTER */

characterCards.forEach(card => {

    card.addEventListener('click', () => {

        const id = card.dataset.character;
        const character = characterData[id];

        if (!character) return;

        characterName.textContent = character.name;
        characterRole.textContent = character.role;
        characterDescription.textContent = character.description;
        characterOrigin.textContent = character.origin;
        characterBook.textContent = character.book;
        characterImage.src = character.image;

        characterCards.forEach(item => {
            item.classList.remove('active');
        });

        card.classList.add('active');

        characterDetail.classList.add('open');

        characterDetail.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

    });

});


/* CLOSE CHARACTER */

if (characterClose) characterClose.addEventListener('click', () => {

    characterDetail.classList.remove('open');

    characterCards.forEach(card => {
        card.classList.remove('active');
    });

});