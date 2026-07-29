// Gatorade Blue Landing Page Scroll Animation Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const mainContent = document.getElementById('main-content');
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  
  // Animation config
  const frameCount = 210;
  const images = [];
  let loadedCount = 0;
  
  // Create image paths
  const currentFrameUrl = (index) => {
    const paddedIndex = String(index).padStart(3, '0');
    return `assets/frames/ezgif-frame-${paddedIndex}.jpg`;
  };

  // Preload Images
  function preloadImages() {
    return new Promise((resolve) => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrameUrl(i);
        img.onload = () => {
          loadedCount++;
          const percentage = Math.round((loadedCount / frameCount) * 100);
          progressBar.style.width = `${percentage}%`;
          progressText.innerText = `${percentage}%`;
          
          if (loadedCount === frameCount) {
            resolve();
          }
        };
        img.onerror = () => {
          console.error(`Error loading image at index: ${i}`);
          loadedCount++; // Count it anyway to avoid locking the loader
          if (loadedCount === frameCount) {
            resolve();
          }
        };
        images.push(img);
      }
    });
  }

  // Handle Loading Completion
  preloadImages().then(() => {
    // Fade out preloader
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
      mainContent.classList.remove('hidden');
      
      // Initialize Canvas size and draw first frame
      resizeCanvas();
      renderFrame(0);
      
      // Start scroll listening
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      // Initialize UI interactive behaviors
      initUI();
    }, 800); // Allow preloader fade-out animation to finish
  });

  // Canvas Drawing Logic
  let currentFrameIndex = 0;
  
  function renderFrame(index) {
    if (!images[index]) return;
    
    const img = images[index];
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate aspect ratio scaling (cover fit)
    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, x, y;
    
    if (canvasRatio > imgRatio) {
      // Canvas is wider than image aspect ratio
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    } else {
      // Canvas is taller than image aspect ratio
      drawWidth = canvasHeight * imgRatio;
      drawHeight = canvasHeight;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    }
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    currentFrameIndex = index;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrameIndex);
  }

  // Scroll Processing
  let isTicking = false;

  function handleScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateAnimation();
        isTicking = false;
      });
      isTicking = true;
    }
  }

  function handleResize() {
    resizeCanvas();
  }

  function updateAnimation() {
    const scrollContainer = document.getElementById('animation-section');
    const rect = scrollContainer.getBoundingClientRect();
    
    // We compute relative progress through the scrollContainer
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const containerTop = rect.top + scrollTop;
    const containerHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Calculate progress fraction
    let scrollFraction = (scrollTop - containerTop) / (containerHeight - windowHeight);
    
    // Clamp fraction between 0 and 1
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    
    // Map fraction to frame index
    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(scrollFraction * frameCount)
    );
    
    // Redraw on canvas
    renderFrame(frameIndex);
    
    // Handle overlay text changes based on scroll progression
    updateOverlays(scrollFraction);
  }

  // Overlay Switcher with hysteresis/boundaries
  const overlays = [
    document.getElementById('text-overlay-1'),
    document.getElementById('text-overlay-2'),
    document.getElementById('text-overlay-3'),
    document.getElementById('text-overlay-4')
  ];

  function updateOverlays(fraction) {
    let activeIndex = 0;
    
    if (fraction < 0.2) {
      activeIndex = 0;
    } else if (fraction >= 0.2 && fraction < 0.5) {
      activeIndex = 1;
    } else if (fraction >= 0.5 && fraction < 0.8) {
      activeIndex = 2;
    } else {
      activeIndex = 3;
    }
    
    overlays.forEach((overlay, i) => {
      if (i === activeIndex) {
        overlay.classList.add('active');
      } else {
        overlay.classList.remove('active');
      }
    });
  }

  // UI Interactive Features Setup
  function initUI() {
    // Spec tabs switcher
    const tabButtons = document.querySelectorAll('.spec-tab');
    const tabContents = document.querySelectorAll('.spec-tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });

    // Quantity selector in buy card
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');
    const qtyValEl = document.getElementById('qty-val');
    
    let quantity = 1;
    
    qtyMinusBtn.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyValEl.innerText = quantity;
      }
    });
    
    qtyPlusBtn.addEventListener('click', () => {
      if (quantity < 10) {
        quantity++;
        qtyValEl.innerText = quantity;
      }
    });

    // --- CART LOGIC ---
    let cart = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartTrigger = document.getElementById('cart-trigger');
    const cartClose = document.getElementById('cart-close');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    // Open Cart Drawer
    function openCart() {
      cartSidebar.classList.add('active');
      cartOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Close Cart Drawer
    function closeCart() {
      cartSidebar.classList.remove('active');
      cartOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    cartTrigger.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Save/Load Cart state
    function saveCart() {
      localStorage.setItem('gatorade_cart', JSON.stringify(cart));
      renderCart();
    }

    function loadCart() {
      const saved = localStorage.getItem('gatorade_cart');
      if (saved) {
        try {
          cart = JSON.parse(saved);
        } catch(e) {
          cart = [];
        }
      }
      renderCart();
    }

    // Render Cart DOM elements
    function renderCart() {
      // Update badge
      const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
      cartBadge.innerText = totalItemsCount;
      
      if (cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
        cartTotalEl.innerText = '$0.00';
        return;
      }
      
      let html = '';
      let subtotal = 0;
      
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        let icon = '⚡';
        if (item.id === 'orange-burst') icon = '🍊';
        if (item.id === 'gx-shaker') icon = '🥤';
        if (item.id === 'blue-storm') icon = '🌀';
        
        html += `
          <div class="cart-item">
            <div class="cart-item-img">${icon}</div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-qty-actions">
                <button class="qty-btn cart-qty-minus" data-id="${item.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn cart-qty-plus" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">Remove</button>
          </div>
        `;
      });
      
      cartItemsEl.innerHTML = html;
      cartTotalEl.innerText = `$${subtotal.toFixed(2)}`;
      
      // Wire up cart dynamic action listeners
      document.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const idx = cart.findIndex(item => item.id === id);
          if (idx > -1) {
            if (cart[idx].quantity > 1) {
              cart[idx].quantity--;
            } else {
              cart.splice(idx, 1);
            }
            saveCart();
          }
        });
      });
      
      document.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const idx = cart.findIndex(item => item.id === id);
          if (idx > -1) {
            cart[idx].quantity++;
            saveCart();
          }
        });
      });
      
      document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          cart = cart.filter(item => item.id !== id);
          saveCart();
        });
      });
    }

    // Add product to cart helper
    function addProductToCart(id, name, price, qty = 1) {
      const idx = cart.findIndex(item => item.id === id);
      if (idx > -1) {
        cart[idx].quantity += qty;
      } else {
        cart.push({ id, name, price: parseFloat(price), quantity: qty });
      }
      saveCart();
      openCart();
    }

    // Event listener: Main Blue Storm Add to Cart
    const addMainBtn = document.getElementById('add-to-cart-main-btn');
    if (addMainBtn) {
      addMainBtn.addEventListener('click', () => {
        addProductToCart('blue-storm', 'Blue Storm (12-Pack)', 24.99, quantity);
      });
    }

    // Event listeners: Shop cards Add to Cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        addProductToCart(id, name, price, 1);
      });
    });

    // Checkout alert
    cartCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
      }
      const totalCost = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      alert(`⚡ Order Placed! Total checkout amount: $${totalCost.toFixed(2)}. Hydration is on its way! ⚡`);
      cart = [];
      saveCart();
      closeCart();
    });

    // Load initial cart state
    loadCart();
  }
});
