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
        const addressInput = document.getElementById('address-input');
        const postalInput = document.getElementById('postal-input');
        const notesInput = document.getElementById('notes-input'); // Assuming notes are optional and do not require validation

        if (nameInput.value.trim() === '') {
            showNotification('Por favor, introduce tu nombre', 'red');
            return false;
        }

        if (emailInput.value.trim() === '') {
            showNotification('Por favor, introduce tu email', 'red');
            return false;
        }

        if (addressInput.value.trim() === '') {
            showNotification('Por favor, introduce tu dirección completa', 'red');
            return false;
        }

        if (postalInput.value.trim() === '') {
            showNotification('Por favor, introduce tu código postal', 'red');
            return false;
        }

        // No need to validate notesInput as it's optional

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
                    ${product.options.length > 1 ? `<select class="product-size" data-product-id="${product.id}" style="margin-left: auto;">` : `<p>${product.options[0].height}</p>`}
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
                if (productSizeSelect) {
                    productSizeSelect.appendChild(optionElement);
                }
            });
    
            if (productSizeSelect) {
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
            }
            
            
    
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
        let priceWithoutShipping = 0;
        cart.forEach(product => {
            if (product.selectedOptionIndex !== undefined) {
                totalPrice += parseFloat(product.options[product.selectedOptionIndex].price.replace('€', ''));
            }
        });
    
        // Añadir costos de envío si el precio total es menor a 50€
        const shippingCost = totalPrice > 0 && totalPrice < 50 ? 6 : 0;
        priceWithoutShipping = totalPrice;
        totalPrice += shippingCost;

        // Aplicar descuento si hay más de dos productos
        let discount = 0;
        if (cart.length >= 2) {
            discount = 0.1 * totalPrice; // 10% de descuento por dos productos
            let extraDiscount = Math.min(cart.length - 2, 2) * 0.05; // 5% extra por cada producto adicional, hasta un máximo del 20%
            discount += extraDiscount * totalPrice;
        }
        totalPrice -= discount;
    
        // Actualizar el DOM con el precio total, el descuento y los costos de envío
        document.getElementById('subtotal-price').textContent = `${priceWithoutShipping.toFixed(2)}€`;
        document.getElementById('total-price').textContent = `${totalPrice.toFixed(2)}€`;
        document.getElementById('discount').textContent = discount > 0 ? `- ${discount.toFixed(2)}€ (Descuento)` : '';
        document.getElementById('shipping-cost').textContent = shippingCost > 0 ? `+ ${shippingCost.toFixed(2)}€ (Envío)` : 'Envío gratuito';
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
    
        const formattedCart = formatCartForEmail(cart);
        const templateParams = {
            nombre: document.getElementById('name-input').value,
            cesta: formattedCart,
            email: document.getElementById('email-input').value,
            precio: document.getElementById('total-price').textContent,
            observaciones: document.getElementById('notes-input').value,
            codigo_postal: document.getElementById('postal-input').value,
            direccion: document.getElementById('address-input').value
        };
    
        emailjs.send('service_wg7uw2n', 'template_1lrf8gi', templateParams)
            .then(function (response) {
            }, function (error) {
            });
    
        alert('Tu pedido ha sido recibido. Si en 48 horas no me he puesto en contacto contigo, por favor, contacta conmigo a través del email o la cuenta de Twitter que aparece en la sección de "Preguntas frecuentes"');
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

