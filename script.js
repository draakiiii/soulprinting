document.addEventListener('DOMContentLoaded', function () {
  let products = [];
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      displayProducts(products);
    })
    .catch(error => console.error('Error loading products:', error));

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', function () {
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    displayProducts(filteredProducts);
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
  let sortedProducts;
  if (sortOptions.value === 'price-asc') {
    sortedProducts = [...products].sort((a, b) => extractLowestPrice(a) - extractLowestPrice(b));
  } else if (sortOptions.value === 'price-desc') {
    sortedProducts = [...products].sort((a, b) => extractHighestPrice(b) - extractHighestPrice(a));
  } else if (sortOptions.value === 'recently-added') {
    sortedProducts = [...products].reverse();
  } else {
    sortedProducts = products;
  }
  displayProducts(sortedProducts);
});

function extractHighestPrice(product) {
  const prices = product.options.map(option => parseFloat(option.price.replace('€', '')));
  return Math.max(...prices);
}

function calculateDiscountedPrice(price) {
  const originalPrice = parseFloat(price.replace('€', ''));
  const discountedPrice = originalPrice - (originalPrice * 0.20);
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
        <img src="${product.defaultImage}" alt="${product.name}" class="default-image">
        <img src="${product.hoverImage}" alt="${product.name}" class="hover-image">
      </div>
      <div class="product-details">
        <div class="name">${product.name}</div>
        <div class="description">
          <p data-label="Altura">${heights}</p>
          <p data-label="Precio Original">${prices}</p>
        </div>
        <button class="add-to-cart" data-product-id="${product.id}">Agregar a la cesta</button>
      </div>
    `;

    // productElement.innerHTML = `
    //   <div class="product-image">
    //     <img src="${product.defaultImage}" alt="${product.name}" class="default-image">
    //     <img src="${product.hoverImage}" alt="${product.name}" class="hover-image">
    //   </div>
    //   <div class="product-details">
    //     <div class="name">${product.name}</div>
    //     <div class="description">
    //       <p data-label="Altura">${heights}</p>
    //       <p data-label="Precio Original">${prices}</p>
    //       <p data-label="Precio con Descuento" style="color: red;">${discountedPrices}</p>
    //     </div>
    //     <button class="add-to-cart" data-product-id="${product.id}">Agregar a la cesta</button>
    //   </div>
    // `;
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

});