/**
 * Twinkle Wishlist - localStorage tabanlı favori listesi
 * Ürün kartları ve ürün sayfasındaki wishlist butonları ile senkron çalışır.
 */
(function () {
  const STORAGE_KEY = 'twinkle_wishlist';
  const BADGE_SELECTOR = '#twinkle-wishlist-badge';

  function getStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setStorage(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateBadge() {
    const badge = document.querySelector(BADGE_SELECTOR);
    if (!badge) return;
    const count = getStorage().length;
    badge.textContent = count > 0 ? String(count) : '0';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function dispatchChange() {
    window.dispatchEvent(new CustomEvent('twinkle-wishlist-change', { detail: { items: getStorage() } }));
  }

  function syncButtons(productId) {
    document.querySelectorAll('.twinkle-wishlist-btn[data-product-id="' + productId + '"]').forEach(function (btn) {
      const isIn = window.TwinkleWishlist.has(productId);
      btn.classList.toggle('twinkle-active', isIn);
      btn.classList.toggle('active', isIn);
      btn.setAttribute('aria-label', isIn ? 'Favorilerden çıkar' : 'Favorilere ekle');
    });
  }

  window.TwinkleWishlist = {
    getAll: function () {
      return getStorage();
    },

    has: function (productId) {
      const id = String(productId);
      return getStorage().some(function (item) { return String(item.id) === id; });
    },

    add: function (item) {
      const id = String(item.id);
      let list = getStorage();
      if (list.some(function (i) { return String(i.id) === id; })) return false;
      list.push({
        id: id,
        handle: item.handle || '',
        title: item.title || '',
        price: item.price || 0,
        compare_at_price: item.compare_at_price || 0,
        image: item.image || '',
        variant_id: item.variant_id || '',
        url: item.url || '/products/' + (item.handle || '')
      });
      setStorage(list);
      updateBadge();
      syncButtons(id);
      dispatchChange();
      return true;
    },

    remove: function (productId) {
      const id = String(productId);
      let list = getStorage().filter(function (i) { return String(i.id) !== id; });
      if (list.length === getStorage().length) return false;
      setStorage(list);
      updateBadge();
      syncButtons(id);
      dispatchChange();
      return true;
    },

    toggle: function (item) {
      if (this.has(item.id)) {
        this.remove(item.id);
        return false;
      }
      this.add(item);
      return true;
    },

    updateBadge: updateBadge
  };

  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();
    document.querySelectorAll('.twinkle-wishlist-btn[data-product-id]').forEach(function (btn) {
      const id = btn.getAttribute('data-product-id');
      const isIn = window.TwinkleWishlist.has(id);
      btn.classList.toggle('twinkle-active', isIn);
      btn.classList.toggle('active', isIn);
      btn.setAttribute('aria-label', isIn ? 'Favorilerden çıkar' : 'Favorilere ekle');
    });

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.twinkle-wishlist-btn');
      if (!btn || !btn.dataset.productId) return;
      e.preventDefault();
      const added = window.TwinkleWishlist.toggle({
        id: btn.dataset.productId,
        handle: btn.dataset.productHandle || '',
        title: btn.dataset.productTitle || '',
        price: btn.dataset.productPrice || '',
        compare_at_price: btn.dataset.productComparePrice || '',
        image: btn.dataset.productImage || '',
        variant_id: btn.dataset.variantId || '',
        url: btn.dataset.productUrl || ''
      });
      btn.classList.toggle('twinkle-active', added);
      btn.classList.toggle('active', added);
      btn.setAttribute('aria-label', added ? 'Favorilerden çıkar' : 'Favorilere ekle');
    });

    window.addEventListener('twinkle-wishlist-change', updateBadge);
  });
})();
