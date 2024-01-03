document.addEventListener('DOMContentLoaded', function() {
  fetch('products.json')
    .then(response => response.json())
    .then(products => {
      const productContainer = document.querySelector('.product-container');

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
    })
    .catch(error => console.error('Error loading products:', error));
}); 