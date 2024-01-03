document.addEventListener('DOMContentLoaded', function() {
  let products = [];

  fetch('products.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      displayProducts(products);
    })
    .catch(error => console.error('Error loading products:', error));

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', function() {
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    displayProducts(filteredProducts);
  });

  const sortOptions = document.getElementById('sort-options');
  sortOptions.addEventListener('change', function() {
    let sortedProducts;
    if (sortOptions.value === 'price-asc') {
      sortedProducts = [...products].sort((a, b) => extractHighestPrice(a.price) - extractHighestPrice(b.price));
    } else if (sortOptions.value === 'price-desc') {
      sortedProducts = [...products].sort((a, b) => extractHighestPrice(b.price) - extractHighestPrice(a.price));
    } else {
      // Aquí puedes implementar la lógica para "Lanzamientos recientes"
      sortedProducts = [...products]; // Esto es solo un placeholder
    }
    displayProducts(sortedProducts);
  });

  function extractHighestPrice(priceString) {
    const prices = priceString.split(' / ').map(price => parseFloat(price));
    return Math.max(...prices);
  }

  function displayProducts(products) {
    const productContainer = document.querySelector('.product-container');
    productContainer.innerHTML = '';

    products.forEach(product => {
      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
        <div class="product-image">
          <img src="${product.defaultImage}" alt="${product.name}" class="default-image">
          <img src="${product.hoverImage}" alt="${product.name}" class="hover-image">
        </div>
        <div class="name">${product.name}</div>
        <div class="description">
          <p data-label="Altura">${product.height}</p>
          <p data-label="Precio">${product.price}</p>
        </div>
      `;
      productContainer.appendChild(productElement);

      const productImage = productElement.querySelector('.product-image');
      const defaultImage = productImage.querySelector('.default-image');
      const hoverImage = productImage.querySelector('.hover-image');

      productImage.addEventListener('touchstart', function() {
        defaultImage.style.opacity = '0';
        hoverImage.style.opacity = '1';
      });

      productImage.addEventListener('touchend', function() {
        defaultImage.style.opacity = '1';
        hoverImage.style.opacity = '0';
      });
    });
  }
});