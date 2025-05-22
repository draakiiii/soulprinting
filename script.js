document.addEventListener('DOMContentLoaded', function () {
  let products = [];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let collections = new Set();
  let discountConfig = null;

  // Load discount configuration
  fetch('discount-config.json')
    .then(response => response.json())
    .then(config => {
      discountConfig = config;
      updateDiscountBanner();
    })
    .catch(error => console.error('Error loading discount configuration:', error));

  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      products.forEach(product => {
        // Asignar "Otros" si no hay colección específica
        const collection = product.name.split(' - ')[1] || "Otros";
        collections.add(collection);
      });
      displayProducts(products);
      populateFilterDropdown(collections);
    })
    .catch(error => console.error('Error loading products:', error));

  // Function to update the discount banner based on config
  function updateDiscountBanner() {
    const promoBanner = document.querySelector('.promo-banner');
    const discountsSection = document.querySelector('.discounts');
    
    if (!discountConfig) return;

    if (discountConfig.discountType === 'fixed') {
      const percentage = discountConfig.fixedDiscount.percentage;
      const threshold = discountConfig.fixedDiscount.shippingThreshold;
      promoBanner.textContent = `${percentage}% DE DESCUENTO EN TODO EL CATÁLOGO Y ENVÍO GRATUITO A ESPAÑA PARA PEDIDOS SUPERIORES A ${threshold}€`;
      discountsSection.hidden = true;
      
      // Update discount badges on products
      document.querySelectorAll('.discount-badge').forEach(badge => {
        badge.textContent = `-${percentage}%`;
      });
    } else {
      // Quantity-based discount
      promoBanner.textContent = 'DESCUENTOS POR CANTIDAD EN TODO EL CATÁLOGO';
      
      // Generate the tiers text
      const tiersHTML = discountConfig.quantityDiscount.tiers.map(tier => 
        `<p>${tier.quantity} productos: ${tier.percentage}%</p>`
      ).join('');
      
      discountsSection.innerHTML = `
        <p>Descuentos por cantidad (no acumulables con otras promociones):</p>
        ${tiersHTML}
      `;
      discountsSection.hidden = false;
    }
  }

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', function () {
    filterAndDisplayProducts();
  });

  document.getElementById('confirm-purchase').addEventListener('click', function () {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length === 0) {
      showNotification('Tu cesta de la compra está vacía.', "red");
      return;
    } else window.location.href = 'cart.html';
  });

  const sortOptions = document.getElementById('sort-options');
  sortOptions.addEventListener('change', function () {
    filterAndDisplayProducts();
  });

  const filterButton = document.getElementById('filter-button');
  const filterDropdown = document.getElementById('filter-dropdown');
  filterButton.addEventListener('click', function () {
    filterDropdown.hidden = !filterDropdown.hidden;
  });

  function populateFilterDropdown(collections) {
    collections.forEach(collection => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" class="collection-filter" value="${collection}">
        ${collection}
      `;
      filterDropdown.appendChild(label);
    });

    const checkboxes = document.querySelectorAll('.collection-filter');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function () {
        filterAndDisplayProducts();
      });
    });
  }

  function filterAndDisplayProducts() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCollections = Array.from(document.querySelectorAll('.collection-filter:checked')).map(cb => cb.value);
    let filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchValue));

    if (selectedCollections.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const collection = product.name.split(' - ')[1] || "Otros";
        return collection && selectedCollections.includes(collection);
      });
    }

    const sortValue = sortOptions.value;
    if (sortValue === 'price-asc') {
      filteredProducts.sort((a, b) => extractLowestPrice(a) - extractLowestPrice(b));
    } else if (sortValue === 'price-desc') {
      filteredProducts.sort((a, b) => extractHighestPrice(b) - extractHighestPrice(a));
    } else if (sortValue === 'recently-added') {
      filteredProducts.reverse();
    }

    displayProducts(filteredProducts);
  }

  function extractHighestPrice(product) {
    const prices = product.options.map(option => parseFloat(option.price.replace('€', '')));
    return Math.max(...prices);
  }

  function calculateDiscountedPrice(price) {
    const originalPrice = parseFloat(price.replace('€', ''));
    let discountPercentage = 0;
    
    if (!discountConfig) {
      // Si no hay configuración, usar descuento fijo por defecto de 20%
      discountPercentage = 0.20;
    } else if (discountConfig.discountType === 'fixed') {
      discountPercentage = discountConfig.fixedDiscount.percentage / 100;
    } else {
      // For quantity discounts, we'll show the fixed discount in catalog
      // The actual quantity discount will be applied in cart
      discountPercentage = 0; // No discount shown in product listing for quantity-based
    }
    
    const discountedPrice = originalPrice - (originalPrice * discountPercentage);
    return `${discountedPrice.toFixed(2)}€`;
  }

  function extractLowestPrice(product) {
    const prices = product.options.map(option => parseFloat(option.price.replace('€', '')));
    return Math.min(...prices);
  }

  function displayProducts(products) {
    const productContainer = document.querySelector('.product-container');
    productContainer.innerHTML = '';

    products.forEach((product, index) => {
      const heights = product.options.map(option => option.height).join(' / ');
      const prices = product.options.map(option => option.price).join(' / ');
      const discountedPrices = product.options.map(option => calculateDiscountedPrice(option.price)).join(' / ');

      // Determine if we should show discount badges and prices
      const showDiscounts = discountConfig ? 
        (discountConfig.discountType === 'fixed' || 
         (discountConfig.discountType === 'quantity' && discountConfig.quantityDiscount.enabled)) : true;
      
      const discountPercentage = discountConfig && discountConfig.discountType === 'fixed' ? 
        discountConfig.fixedDiscount.percentage : 20; // Default to 20% if config not loaded
      
      const discountBadgeHTML = showDiscounts ? 
        `<div class="discount-badge">${discountConfig && discountConfig.discountType === 'fixed' ? `-${discountPercentage}%` : '-20%'}</div>` : '';
      
      const priceHTML = showDiscounts ? 
        `<p data-label="Precio" class="original-price"><s>${prices}</s></p>
         <p data-label="Precio Oferta" class="discounted-price">${discountConfig && discountConfig.discountType === 'fixed' ? discountedPrices : prices}</p>` :
        `<p data-label="Precio">${prices}</p>`;

      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
      <div class="product-image">
        <img src="placeholder.jpg" data-src="${product.defaultImage}" alt="${product.name}" class="default-image lazy">
        <img src="placeholder.jpg" data-src="${product.hoverImage}" alt="${product.name}" class="hover-image lazy">
        ${discountBadgeHTML}
      </div>
      <div class="product-details">
        <div class="name">${product.name}</div>
        <div class="description">
          <p data-label="Altura">${heights}</p>
          ${priceHTML}
        </div>
        <button class="add-to-cart" data-product-id="${product.id}">Agregar a la cesta</button>
      </div>
    `;

      productContainer.appendChild(productElement);

      const addToCartButton = productElement.querySelector('.add-to-cart');
      addToCartButton.addEventListener('click', function () {
        // Suponiendo que siempre se agrega la primera opción por defecto
        const selectedProduct = { ...product, selectedOptionIndex: 0 };
        cart.push(selectedProduct);
        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`Ha añadido ${product.name} a la cesta`);
      });
    });

    lazyLoadImages();
  }

  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img.lazy');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }

  function showNotification(message, color = 'default') {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    if (color !== 'default') {
      notification.style.backgroundColor = color;
    }

    const container = document.getElementById('notification-container');
    container.appendChild(notification);

    // Hacer que la notificación sea visible
    setTimeout(() => {
      notification.style.opacity = 1;
    }, 100);

    // Ocultar y eliminar la notificación después de 3 segundos
    setTimeout(() => {
      notification.style.opacity = 0;
      notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
  }

  document.addEventListener('click', function(event) {
    const filterDropdown = document.getElementById('filter-dropdown');
    const filterButton = document.getElementById('filter-button');
    // Verificar si el clic fue fuera del desplegable y del botón de filtro
    if (!filterDropdown.contains(event.target) && !filterButton.contains(event.target)) {
      filterDropdown.hidden = true;
    }
  });

});