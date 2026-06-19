/* =========================================
   STITCH STUDIO — script.js
   Cart · Contact Form · Search · Hamburger · Categories
   ========================================= */

const DELIVERY = 180;
let cart = JSON.parse(localStorage.getItem('ss_cart') || '[]');

/* =========================================
   DETECT CURRENT PAGE
   ========================================= */
const PAGE = {
  isProducts: document.title.toLowerCase().includes('product'),
  isContact:  document.title.toLowerCase().includes('contact'),
  isFaq:      document.title.toLowerCase().includes('faq') || document.title.toLowerCase().includes('frequently'),
  isHome:     document.title.toLowerCase().includes('home') || document.title.toLowerCase() === 'home',
  isAbout:    document.title.toLowerCase().includes('about'),
};

/* =========================================
   HELPERS
   ========================================= */
function saveCart() {
  localStorage.setItem('ss_cart', JSON.stringify(cart));
}

function getProductInfo(button) {
  const td        = button.closest('td');
  const name      = td.querySelector('b')?.innerText.trim() || 'Item';
  const priceText = td.innerText.match(/R[\d\s,]+\.?\d*/);
  const price     = priceText ? parseFloat(priceText[0].replace(/R|\s|,/g, '')) : 0;
  const select    = td.querySelector('select');
  const size      = select ? select.value : 'One Size';
  const img       = td.querySelector('img')?.src || '';
  return { name, price, size, img };
}

/* =========================================
   HAMBURGER MENU — ALL PAGES
   ========================================= */
function initHamburger() {
  const navbar = document.querySelector('.navbar, nav.navbar');
  if (!navbar) return;

  /* Get existing ul and logo */
  const ul   = navbar.querySelector('ul');
  const logo = navbar.querySelector('.logo');

  /* Build hamburger wrapper */
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-inner';

  /* Logo side */
  const logoEl = document.createElement('div');
  logoEl.className = 'nav-logo';
  if (logo) {
    logoEl.appendChild(logo);
  } else {
    logoEl.innerHTML = '<strong>Stitch Studio</strong>';
  }

  /* Hamburger button */
  const burger = document.createElement('button');
  burger.className = 'hamburger';
  burger.setAttribute('aria-label', 'Toggle menu');
  burger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>`;

  /* Dropdown menu */
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';
  if (ul) {
    const links = Array.from(ul.querySelectorAll('a'));
    dropdown.innerHTML = links.map(a =>
      `<a href="${a.href}">${a.textContent}</a>`
    ).join('');
    ul.remove();
  }

  /* Toggle open/close */
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    burger.classList.toggle('open');
    dropdown.classList.toggle('open');
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      burger.classList.remove('open');
      dropdown.classList.remove('open');
    }
  });

  /* Close on link click */
  dropdown.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      dropdown.classList.remove('open');
    });
  });

  wrapper.appendChild(logoEl);
  wrapper.appendChild(burger);
  navbar.innerHTML = '';
  navbar.appendChild(wrapper);
  navbar.appendChild(dropdown);
}

/* =========================================
   SEARCH — only on Home, About, Products
   ========================================= */
function initSearch() {
  /* Skip search on contact and faq pages */
  if (PAGE.isContact || PAGE.isFaq) return;

  const navbar = document.querySelector('.navbar, nav.navbar');
  if (!navbar) return;

  const searchWrapper  = document.createElement('div');
  searchWrapper.id     = 'search-wrapper';
  searchWrapper.innerHTML = `
    <button id="search-toggle" title="Search products" aria-label="Search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </button>
    <div id="search-box-wrap">
      <input type="text" id="search-input" placeholder="Search products…" autocomplete="off">
      <button id="search-clear" title="Clear">✕</button>
    </div>`;

  /* Insert search inside nav-inner if hamburger was built */
  const navInner = navbar.querySelector('.nav-inner');
  if (navInner) navInner.appendChild(searchWrapper);
  else navbar.appendChild(searchWrapper);

  const toggle   = document.getElementById('search-toggle');
  const boxWrap  = document.getElementById('search-box-wrap');
  const input    = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = boxWrap.classList.toggle('open');
    if (open) input.focus();
    else { input.value = ''; clearBtn.style.display = 'none'; showAllProducts(); }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    input.focus();
    showAllProducts();
  });

  document.addEventListener('click', e => {
    if (!searchWrapper.contains(e.target)) {
      boxWrap.classList.remove('open');
      input.value = '';
      clearBtn.style.display = 'none';
      showAllProducts();
    }
  });

  function getProductCells() {
    return Array.from(document.querySelectorAll('td[width="33%"], td[align="center"]'))
      .filter(td => td.querySelector('img'));
  }

  function showAllProducts() {
    getProductCells().forEach(td => td.style.display = '');
    document.querySelectorAll('table tr').forEach(tr => tr.style.display = '');
    hideNoResults();
  }

  function filterProducts(query) {
    if (!query) { showAllProducts(); return; }
    const q = query.toLowerCase();
    let found = 0;
    getProductCells().forEach(td => {
      const match = td.innerText.toLowerCase().includes(q);
      td.style.display = match ? '' : 'none';
      if (match) found++;
    });
    document.querySelectorAll('table tr').forEach(tr => {
      const visible = Array.from(tr.querySelectorAll('td[width="33%"], td[align="center"]'))
        .filter(td => td.style.display !== 'none');
      tr.style.display = visible.length === 0 ? 'none' : '';
    });
    found === 0 ? showNoResults(query) : hideNoResults();
  }

  function showNoResults(query) {
    let el = document.getElementById('no-results');
    if (!el) {
      el = document.createElement('div');
      el.id = 'no-results';
      const table = document.querySelector('table');
      if (table) table.parentNode.insertBefore(el, table.nextSibling);
      else document.body.appendChild(el);
    }
    el.innerHTML = `<span>🔍</span><p>No results for "<strong>${query}</strong>"</p><small>Try another name or size</small>`;
    el.style.display = 'block';
  }

  function hideNoResults() {
    const el = document.getElementById('no-results');
    if (el) el.style.display = 'none';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'inline-flex' : 'none';
    if (PAGE.isProducts) {
      filterProducts(q);
    } else if (q.length > 1) {
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  });

  if (PAGE.isProducts) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) {
      boxWrap.classList.add('open');
      input.value = q;
      clearBtn.style.display = 'inline-flex';
      setTimeout(() => filterProducts(q), 150);
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      boxWrap.classList.remove('open');
      input.value = '';
      clearBtn.style.display = 'none';
      showAllProducts();
    }
  });
}

/* =========================================
   PRODUCT CATEGORY TABS
   ========================================= */
function initCategoryTabs() {
  if (!PAGE.isProducts) return;

  const table = document.querySelector('table');
  if (!table) return;

  /* Tag each product cell with a category based on keywords in its text */
  const cells = Array.from(document.querySelectorAll('td[width="33%"], td[align="center"]'))
    .filter(td => td.querySelector('img'));

  cells.forEach(td => {
    const text = td.innerText.toLowerCase();
    if (text.includes('dress') || text.includes('maxi') || text.includes('gown') || text.includes('mini') || text.includes('skirt') || text.includes('co-ord')) {
      td.dataset.category = 'dresses';
    } else if (text.includes('sweater') || text.includes('knit') || text.includes('brushstroke') || text.includes('glacial') || text.includes('charcoal') || text.includes('distressed')) {
      td.dataset.category = 'sweaters';
    } else if (text.includes('bag') || text.includes('tote') || text.includes('shell') || text.includes('ribbon') || text.includes('classic')) {
      td.dataset.category = 'bags';
    } else {
      td.dataset.category = 'other';
    }
  });

  /* Build tabs UI */
  const tabsWrapper = document.createElement('div');
  tabsWrapper.id = 'category-tabs';
  tabsWrapper.innerHTML = `
    <button class="cat-tab active" data-cat="all">✦ All</button>
    <button class="cat-tab" data-cat="dresses">👗 Dresses</button>
    <button class="cat-tab" data-cat="sweaters">🧶 Sweaters</button>
    <button class="cat-tab" data-cat="bags">👜 Bags</button>`;

  table.parentNode.insertBefore(tabsWrapper, table);

  /* Filter function */
  function filterByCategory(cat) {
    cells.forEach(td => {
      const row = td.closest('tr');
      td.style.display = (cat === 'all' || td.dataset.category === cat) ? '' : 'none';
    });

    /* Hide empty rows */
    document.querySelectorAll('table tr').forEach(tr => {
      const visible = Array.from(tr.querySelectorAll('td[width="33%"], td[align="center"]'))
        .filter(td => td.style.display !== 'none' && td.querySelector('img'));
      tr.style.display = visible.length === 0 ? 'none' : '';
    });
  }

  /* Wire tab clicks */
  tabsWrapper.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsWrapper.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterByCategory(btn.dataset.cat);
    });
  });
}

/* =========================================
   CART — FLOATING BUBBLE
   ========================================= */
function createBubble() {
  if (document.getElementById('cart-bubble')) return;
  const bubble   = document.createElement('div');
  bubble.id      = 'cart-bubble';
  bubble.innerHTML = `🛒 <span id="bubble-count">0</span>`;
  bubble.title   = 'View Cart';
  bubble.onclick = openCartModal;
  document.body.appendChild(bubble);
  updateBubble();
}

function updateBubble() {
  const total  = cart.reduce((s, i) => s + i.qty, 0);
  const el     = document.getElementById('bubble-count');
  if (el) el.textContent = total;
  const bubble = document.getElementById('cart-bubble');
  if (bubble) bubble.classList.toggle('has-items', total > 0);
}

/* =========================================
   CART — TOAST
   ========================================= */
function showAddedToast(name) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast    = document.createElement('div');
    toast.id = 'cart-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = `✦ ${name} added to cart!`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* =========================================
   CART — ADD TO CART
   ========================================= */
function addToCart(button) {
  const { name, price, size, img } = getProductInfo(button);
  if (!price) return;
  const key      = name + '|' + size;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty += 1;
  else cart.push({ key, name, price, size, img, qty: 1 });
  saveCart();
  updateBubble();
  showAddedToast(name);
}

function wireCartButtons() {
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', function () { addToCart(this); });
  });
  document.querySelectorAll('button').forEach(btn => {
    if (btn.classList.contains('cart-btn')) return;
    if (btn.innerText.toLowerCase().includes('add to cart')) {
      btn.classList.add('cart-btn');
      btn.addEventListener('click', function () { addToCart(this); });
    }
  });
}

/* =========================================
   CART — MODAL
   ========================================= */
function openCartModal() {
  let overlay = document.getElementById('cart-overlay');
  if (!overlay) {
    overlay         = document.createElement('div');
    overlay.id      = 'cart-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeCartModal(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="cart-modal">
      <div class="cart-modal-header">
        <h2>✦ Your Cart</h2>
        <button class="cart-close" onclick="closeCartModal()">✕</button>
      </div>
      <div class="cart-items" id="cart-items-list"></div>
      <div class="cart-summary" id="cart-summary"></div>
    </div>`;
  renderCartItems();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  const overlay = document.getElementById('cart-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function renderCartItems() {
  const list    = document.getElementById('cart-items-list');
  const summary = document.getElementById('cart-summary');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        <p>Your cart is empty</p>
        <small>Add some gorgeous pieces!</small>
      </div>`;
    summary.innerHTML = '';
    return;
  }

  list.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ''}
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span class="cart-item-size">Size: ${item.size}</span>
        <span class="cart-item-price">R${item.price.toFixed(2)}</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${i})">🗑</button>
      </div>
    </div>`).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + DELIVERY;

  summary.innerHTML = `
    <div class="cart-totals">
      <div class="cart-row"><span>Subtotal</span><span>R${subtotal.toFixed(2)}</span></div>
      <div class="cart-row delivery"><span>🚚 Delivery (SA)</span><span>R${DELIVERY.toFixed(2)}</span></div>
      <div class="cart-row total"><span>Total</span><span>R${total.toFixed(2)}</span></div>
    </div>
    <p class="delivery-note">✦ We deliver across South Africa only</p>
    <button class="checkout-btn" onclick="checkout()">Proceed to Checkout ✦</button>
    <button class="clear-cart-btn" onclick="clearCart()">Clear Cart</button>`;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(); updateBubble(); renderCartItems();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart(); updateBubble(); renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart(); updateBubble(); renderCartItems();
}

function checkout() {
  alert('Thank you for shopping with Stitch Studio! 🛒✨\nWe will be in touch to confirm your order and payment details.\n\nEmail us at: maluleke.paballo@yahoo.com');
}

/* =========================================
   CONTACT FORM — updated email
   ========================================= */
function initContactForm() {
  const form = document.querySelector('form');
  if (!form) return;

  const getField = (...ids) => {
    for (const id of ids) {
      const el = form.querySelector(`#${id}, [name="${id}"]`);
      if (el) return el;
    }
    return null;
  };

  const surnameField = getField('surname');
  const nameField    = getField('name');
  const emailField   = getField('email');
  const messageField = getField('message');

  function showSuccess(customerName) {
    let banner = document.getElementById('form-success');
    if (!banner) {
      banner    = document.createElement('div');
      banner.id = 'form-success';
      form.parentNode.insertBefore(banner, form.nextSibling);
    }
    banner.innerHTML = `
      <span class="success-icon">✦</span>
      <div>
        <strong>Thank you, ${customerName}!</strong>
        <p>Your inquiry has been sent. We'll get back to you soon 💚</p>
      </div>`;
    banner.classList.add('show');
    form.reset();
    setTimeout(() => banner.classList.remove('show'), 7000);
  }

  function showError(msg) {
    let banner = document.getElementById('form-error');
    if (!banner) {
      banner    = document.createElement('div');
      banner.id = 'form-error';
      form.parentNode.insertBefore(banner, form);
    }
    banner.textContent = msg;
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 5000);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const surname  = surnameField?.value.trim() || '';
    const name     = nameField?.value.trim()    || '';
    const email    = emailField?.value.trim()   || '';
    const message  = messageField?.value.trim() || '';
    const fullName = `${name} ${surname}`.trim();

    if (!name || !email || !message) { showError('Please fill in all required fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { showError('Please enter a valid email address.'); return; }

    const subject = encodeURIComponent('Inquiry');
    const body    = encodeURIComponent(
      `Customer Name: ${fullName}\n` +
      `Customer Email: ${email}\n\n` +
      `Message:\n${message}\n\n` +
      `---\nSent via Stitch Studio Contact Form`
    );

    const link        = document.createElement('a');
    link.href         = `mailto:maluleke.paballo@yahoo.com?subject=${subject}&body=${body}`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess(fullName || name);
  });

  if (messageField) {
    const counter       = document.createElement('small');
    counter.className   = 'char-count';
    counter.textContent = '0 / 500 characters';
    messageField.parentNode.appendChild(counter);
    messageField.maxLength = 500;
    messageField.addEventListener('input', () => {
      const len           = messageField.value.length;
      counter.textContent = `${len} / 500 characters`;
      counter.style.color = len > 450 ? '#e57373' : 'var(--clr-muted)';
    });
  }
}

/* =========================================
   INIT
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();       /* hamburger on ALL pages */
  initSearch();          /* search only on home, about, products */
  initCategoryTabs();    /* category tabs only on products */
  createBubble();        /* cart bubble on all pages */
  wireCartButtons();     /* cart buttons on products */
  initContactForm();     /* contact form only if form exists */
  updateBubble();        /* sync cart count */
});