document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let appliedPromoCode = null;
    let promoCodeDiscount = 0;
    let isProcessingOrder = false;

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

    // Añade este evento al botón de checkout
    document.getElementById('checkout-button').addEventListener('click', function(event) {
        event.preventDefault();
        checkout();
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
                <p data-label="Precio" class="original-price"><s class="product-original-price"></s></p>
                <p data-label="Precio Black Friday" class="discounted-price product-price"></p>
            </div>
            <button class="remove-from-cart" data-product-id="${product.id}">Eliminar de la cesta</button>
            `;


            cartContainer.appendChild(productElement);
    
            const productSizeSelect = productElement.querySelector('.product-size');
            const productPriceElement = productElement.querySelector('.product-price');
            const productOriginalPriceElement = productElement.querySelector('.product-original-price');
    
            product.options.forEach((option, i) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.price;
                optionElement.text = option.height;
                if (product.selectedOptionIndex === i) {
                    optionElement.selected = true;
                    productOriginalPriceElement.textContent = option.price;
                    productPriceElement.textContent = calculateDiscountedPrice(option.price);
                }
                if (productSizeSelect) {
                    productSizeSelect.appendChild(optionElement);
                }
            });
    
            if (productSizeSelect) {
                if (product.options.length === 1) {
                    productSizeSelect.style.display = 'none';
                    product.selectedOptionIndex = 0;
                    productOriginalPriceElement.textContent = product.options[0].price;
                    productPriceElement.textContent = calculateDiscountedPrice(product.options[0].price);
                } else {
                    productSizeSelect.style.display = 'block';
                    if (product.selectedOptionIndex === undefined) {
                        allSizesSelected = false;
                    }
                }
        
                productSizeSelect.addEventListener('change', function (event) {
                    const selectedOptionIndex = event.target.selectedIndex;
                    product.selectedOptionIndex = selectedOptionIndex;
                    const originalPrice = product.options[selectedOptionIndex].price;
                    productOriginalPriceElement.textContent = originalPrice;
                    productPriceElement.textContent = calculateDiscountedPrice(originalPrice);
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

    function calculateDiscountedPrice(price) {
        const originalPrice = parseFloat(price.replace('€', ''));
        const discountedPrice = originalPrice - (originalPrice * 0.20);
        return `${discountedPrice.toFixed(2)}€`;
    }

    function updateTotalPrice(cart) {
        let originalTotal = 0;
        let discountedTotal = 0;
        const blackFridayDiscount = 0.20; // 20% Black Friday

        // Calcular total original
        cart.forEach(product => {
            if (product.selectedOptionIndex !== undefined) {
                const originalPrice = parseFloat(product.options[product.selectedOptionIndex].price.replace('€', ''));
                originalTotal += originalPrice;
            }
        });

        // Determinar qué descuento aplicar
        let finalDiscountPercentage = blackFridayDiscount;
        let discountSource = 'Black Friday';
        
        if (promoCodeDiscount > 0) {
            const promoDiscountDecimal = promoCodeDiscount / 100;
            if (promoDiscountDecimal > blackFridayDiscount) {
                finalDiscountPercentage = promoDiscountDecimal;
                discountSource = `Código ${appliedPromoCode}`;
            } else {
                showNotification('El código de descuento es igual o inferior al descuento actual y no se aplicará', 'red');
                promoCodeDiscount = 0;
                appliedPromoCode = null;
            }
        }

        // Aplicar el descuento final
        discountedTotal = originalTotal - (originalTotal * finalDiscountPercentage);

        // Añadir costos de envío si el precio con descuento es menor a 35€
        const shippingCost = discountedTotal > 0 && discountedTotal < 35 ? 6 : 0;
        const finalTotal = discountedTotal + shippingCost;

        // Actualizar el DOM con el desglose
        document.getElementById('subtotal-price').textContent = `${originalTotal.toFixed(2)}€`;
        
        // Mostrar el descuento aplicado
        const discountAmount = originalTotal * finalDiscountPercentage;
        const discountHTML = `
            <div class="discount-line">
                - ${discountAmount.toFixed(2)}€ (${discountSource} -${(finalDiscountPercentage * 100).toFixed(0)}%)
            </div>
        `;
        
        document.getElementById('discount').innerHTML = discountHTML;
        
        document.getElementById('shipping-cost').textContent = 
            shippingCost > 0 ? 
            `+ ${shippingCost.toFixed(2)}€ (Envío)` : 
            'Envío gratuito';
        document.getElementById('total-price').textContent = `${finalTotal.toFixed(2)}€`;

        // Añadir estilos para el descuento
        const discountElement = document.getElementById('discount');
        discountElement.style.color = '#e60000';
        discountElement.style.fontWeight = 'bold';
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
        // Si ya se está procesando un pedido, no hacer nada
        if (isProcessingOrder) {
            return;
        }
    
        if (cart.length === 0) {
            showNotification('Tu cesta de la compra está vacía.', "red");
            return;
        }
    
        if (!validateForm()) {
            return;
        }
    
        // Marcar que se está procesando un pedido
        isProcessingOrder = true;
    
        // Deshabilitar el botón de checkout
        const checkoutButton = document.getElementById('checkout-button');
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Procesando...';
    
        const formattedCart = formatCartForEmail(cart);
        const totalPrice = document.getElementById('total-price').textContent;
        const templateParams = {
            nombre: document.getElementById('name-input').value,
            cesta: formattedCart,
            email: document.getElementById('email-input').value,
            precio: totalPrice,
            observaciones: document.getElementById('notes-input').value || "No hay observaciones",
            codigo_postal: document.getElementById('postal-input').value,
            direccion: document.getElementById('address-input').value
        };
    
        // Enviar email al administrador
        emailjs.send('service_wg7uw2n', 'template_1lrf8gi', templateParams)
            .then(function (response) {
                // Si el email al administrador se envía con éxito, enviar email al cliente
                return emailjs.send("service_wg7uw2n", "template_kvlfl9b", templateParams);
            })
            .then(function (response) {
                showNotification('Tu pedido ha sido recibido. Te hemos enviado un email de confirmación.', 'green');
                cart = [];
                localStorage.removeItem('cart');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            })
            .catch(function (error) {
                showNotification('Hubo un error al enviar tu pedido. Por favor, inténtalo de nuevo.', 'red');
                console.error('Error:', error);
            })
            .finally(function () {
                // Restablecer el estado del botón y la bandera de procesamiento solo si el carrito no está vacío
                if (cart.length > 0) {
                    isProcessingOrder = false;
                    checkoutButton.disabled = false;
                    checkoutButton.textContent = 'Enviar pedido';
                }
            });
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
                formattedCart += `Precio: ${selectedOption.price}\n\n`;  // Added an extra \n for a blank line between products
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

    // Nuevo código para manejar los códigos promocionales
    document.getElementById('apply-promo-code').addEventListener('click', function() {
        const promoCodeInput = document.getElementById('promo-code-input');
        const promoCode = promoCodeInput.value.trim().toUpperCase();

        fetch('promo-codes.json')
            .then(response => response.json())
            .then(promoCodes => {
                if (promoCodes.hasOwnProperty(promoCode)) {
                    const cupon = promoCodes[promoCode];
                    const fechaActual = new Date();
                    const fechaCaducidad = cupon.caducidad ? new Date(cupon.caducidad) : null;

                    if (!fechaCaducidad || fechaActual <= fechaCaducidad) {
                        appliedPromoCode = promoCode;
                        promoCodeDiscount = cupon.descuento;
                        showNotification(`Código promocional aplicado: ${promoCodeDiscount}% de descuento`, 'green');
                        updateCart();
                    } else {
                        showNotification('El código promocional ha caducado', 'red');
                    }
                } else {
                    showNotification('Código promocional inválido', 'red');
                }
            })
            .catch(error => {
                console.error('Error al cargar los códigos promocionales:', error);
                showNotification('Error al aplicar el código promocional', 'red');
            });

        promoCodeInput.value = '';
    });
});