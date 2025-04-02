document.addEventListener('DOMContentLoaded', function () {
  let products = [];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let collections = new Set();

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
    const discountedPrice = originalPrice - (originalPrice * 0.10);
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

      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
      <div class="product-image">
        <img src="placeholder.jpg" data-src="${product.defaultImage}" alt="${product.name}" class="default-image lazy">
        <img src="placeholder.jpg" data-src="${product.hoverImage}" alt="${product.name}" class="hover-image lazy">
        <div class="discount-badge">-20%</div>
      </div>
      <div class="product-details">
        <div class="name">${product.name}</div>
        <div class="description">
          <p data-label="Altura">${heights}</p>
          <p data-label="Precio" class="original-price"><s>${prices}</s></p>
          <p data-label="Precio Oferta" class="discounted-price">${discountedPrices}</p>
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