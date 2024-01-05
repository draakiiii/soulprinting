document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        window.location.href = 'index.html';
      }

    document.getElementById('checkout-button-top').addEventListener('click', function () {
        document.getElementById('checkout-dialog').style.display = 'block';
    });

    document.getElementById('checkout-button-bottom').addEventListener('click', function () {
        document.getElementById('checkout-dialog').style.display = 'block';
    });

    document.getElementById('close-button').addEventListener('click', function () {
        document.getElementById('checkout-dialog').style.display = 'none';
    });

    function displayCartItems(cart) {
        if (cart.length === 0) {
            window.location.href = 'index.html';
          }

        const cartContainer = document.querySelector('.cart-container');
        cartContainer.innerHTML = '';

        cart.forEach((product, index) => {
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
          <button class="remove-from-cart" data-product-id="${product.id}">Eliminar de la cesta</button>
        `;
            cartContainer.appendChild(productElement);

            const removeFromCartButton = productElement.querySelector('.remove-from-cart');
            removeFromCartButton.addEventListener('click', function () {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCartItems(cart);
            });
        });
    }
    // Función para validar el formulario
    function validateForm() {
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');

        if (nameInput.value === '') {
            showNotification('Por favor, introduce tu nombre', 'red');
            return false;
        }

        if (emailInput.value === '') {
            showNotification('Por favor, introduce tu email o tu cuenta de Twitter.', "red");
            return false;
        }

        return true;
    }

    // Función para finalizar la compra
    function checkout() {
        if (cart.length === 0) {
            showNotification('Tu cesta de la compra está vacía.', "red");
            return;
        }

        if (!validateForm()) {
            return;
        }

        const formattedCart = formatCartForEmail(cart);
        const templateParams = {
            nombre: document.getElementById('name-input').value,
            cesta: formattedCart,
            email: document.getElementById('email-input').value,
            observaciones: document.getElementById('notes-input').value
        };

        emailjs.send('service_wg7uw2n', 'template_1lrf8gi', templateParams)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function (error) {
                console.log('FAILED...', error);
            });

        // Aquí puedes implementar la lógica para enviar el pedido
        alert('Tu pedido ha sido recibido. Me pondré en contacto contigo en menos de 24 horas.');
        cart = [];
        // Limpia el carrito en el navegador
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    }

    function formatCartForEmail(cart) {
        let formattedCart = '';
        cart.forEach((product, index) => {
            formattedCart += `Producto ${index + 1}:\n`;
            formattedCart += `Nombre: ${product.name}\n`;
            formattedCart += `Altura: ${product.height}\n`;
            formattedCart += `Precio: ${product.price}\n\n`;
        });
        return formattedCart;
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

    document.getElementById('checkout-button').addEventListener('click', checkout);
    displayCartItems(cart);
});

