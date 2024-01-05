document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCart();


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

    function displayCartItems(cart) {
        const cartContainer = document.querySelector('.cart-container');
        cartContainer.innerHTML = '';
        let allSizesSelected = true;
    
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
                <div style="display: flex; justify-content: space-between;">
                    <p data-label="Altura"></p>
                    <select class="product-size" data-product-id="${product.id}" style="margin-left: auto;">
                    </select>
                </div>
                <p data-label="Precio" class="product-price"></p>
            </div>
            <button class="remove-from-cart" data-product-id="${product.id}">Eliminar de la cesta</button>
            `;
            cartContainer.appendChild(productElement);
    
            const productSizeSelect = productElement.querySelector('.product-size');
            const productPriceElement = productElement.querySelector('.product-price');
    
            product.options.forEach((option, i) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.price;
                optionElement.text = option.height;
                if (product.selectedOptionIndex === i) {
                    optionElement.selected = true;
                    productPriceElement.textContent = option.price;
                }
                productSizeSelect.appendChild(optionElement);
            });
    
            if (product.options.length === 1) {
                productSizeSelect.style.display = 'none'; // Ocultar si solo hay una opción
                product.selectedOptionIndex = 0; // Seleccionar automáticamente la única opción
                productPriceElement.textContent = product.options[0].price;
            } else {
                productSizeSelect.style.display = 'block';
                if (product.selectedOptionIndex === undefined) {
                    allSizesSelected = false; // Si alguna opción no está seleccionada, deshabilitar el botón de compra
                }
            }
    
            productSizeSelect.addEventListener('change', function (event) {
                const selectedOptionIndex = event.target.selectedIndex;
                product.selectedOptionIndex = selectedOptionIndex;
                productPriceElement.textContent = product.options[selectedOptionIndex].price;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
    
            const removeFromCartButton = productElement.querySelector('.remove-from-cart');
            removeFromCartButton.addEventListener('click', function () {
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });
    
        document.getElementById('checkout-button-top').disabled = !allSizesSelected;
        document.getElementById('checkout-button-bottom').disabled = !allSizesSelected;
        updateTotalPrice(cart);
    }

    function updateTotalPrice(cart) {
        let totalPrice = 0;
        cart.forEach(product => {
            if (product.selectedOptionIndex !== undefined) {
                totalPrice += parseFloat(product.options[product.selectedOptionIndex].price.replace('€', ''));
            }
        });
        document.getElementById('total-price').textContent = `${totalPrice.toFixed(2)}€`;
    }

    function updateCart() {
        if (cart.length === 0) {
            window.location.href = 'index.html';
        } else {
            displayCartItems(cart);
        }
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
    
        let total = 0;
        cart.forEach(product => {   
            total += parseFloat(product.price);
        });
        console.log('Total: ' + total + '€');
    
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
    
        alert('Tu pedido ha sido recibido. Me pondré en contacto contigo en menos de 24 horas.');
        cart = [];
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    }

    function formatCartForEmail(cart) {
        let formattedCart = '';
        cart.forEach((product, index) => {
            // Asegúrate de que la opción seleccionada esté definida
            if (product.selectedOptionIndex !== undefined) {
                const selectedOption = product.options[product.selectedOptionIndex];
                formattedCart += `Producto ${index + 1}:\n`;
                formattedCart += `Nombre: ${product.name}\n`;
                formattedCart += `Altura: ${selectedOption.height}\n`;
                formattedCart += `Precio: ${selectedOption.price}\n\n`;
            }
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

