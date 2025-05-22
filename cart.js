document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let appliedPromoCode = null;
    let promoCodeDiscount = 0;
    let isProcessingOrder = false;
    let discountConfig = null;

    // Load discount configuration
    fetch('discount-config.json')
      .then(response => response.json())
      .then(config => {
        discountConfig = config;
        updateCart();
      })
      .catch(error => {
        console.error('Error loading discount configuration:', error);
        updateCart();
      });

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
                <div class="price-row" style="display: flex; justify-content: space-between;">
                    <p data-label="Precio"></p>
                    <p class="original-price"><span class="product-original-price"></span></p>
                </div>
                <div class="discount-row" style="display: flex; justify-content: space-between;">
                    <p data-label="Precio Oferta"></p>
                    <p class="discounted-price product-price"></p>
                </div>
            </div>
            <button class="remove-from-cart" data-product-id="${product.id}">Eliminar de la cesta</button>
            `;

            cartContainer.appendChild(productElement);
    
            const productSizeSelect = productElement.querySelector('.product-size');
            const productPriceElement = productElement.querySelector('.product-price');
            const productOriginalPriceElement = productElement.querySelector('.product-original-price');
            const discountedPriceRow = productElement.querySelector('.discount-row');
            const originalPriceRow = productElement.querySelector('.price-row');
            
            // Only show product-price and original-price elements when a discount applies
            function updateProductPriceVisibility(originalPrice, discountedPrice) {
                const hasDiscount = originalPrice !== discountedPrice;
                
                if (!hasDiscount) {
                    // Si no hay descuento aplicable, mostrar solo el precio original sin tachar
                    productOriginalPriceElement.textContent = originalPrice;
                    discountedPriceRow.style.display = 'none';
                } else {
                    // Si hay descuento, mostrar ambos precios con el original tachado
                    productOriginalPriceElement.innerHTML = `<s>${originalPrice}</s>`;
                    productPriceElement.textContent = discountedPrice;
                    discountedPriceRow.style.display = 'flex';
                }
            }
    
            product.options.forEach((option, i) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.price;
                optionElement.text = option.height;
                if (product.selectedOptionIndex === i) {
                    optionElement.selected = true;
                    const originalPrice = option.price;
                    const discountedPrice = calculateDiscountedPrice(option.price, cart.length);
                    updateProductPriceVisibility(originalPrice, discountedPrice);
                }
                if (productSizeSelect) {
                    productSizeSelect.appendChild(optionElement);
                }
            });
    
            if (productSizeSelect) {
                if (product.options.length === 1) {
                    productSizeSelect.style.display = 'none';
                    product.selectedOptionIndex = 0;
                    const originalPrice = product.options[0].price;
                    const discountedPrice = calculateDiscountedPrice(originalPrice, cart.length);
                    updateProductPriceVisibility(originalPrice, discountedPrice);
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
                    const discountedPrice = calculateDiscountedPrice(originalPrice, cart.length);
                    updateProductPriceVisibility(originalPrice, discountedPrice);
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

    function calculateDiscountedPrice(price, cartItemCount) {
        const originalPrice = parseFloat(price.replace('€', ''));
        let discountPercentage = 0;
        
        if (!discountConfig) {
            // Si no hay configuración, usar descuento fijo por defecto de 20%
            discountPercentage = 0.20;
        } else if (discountConfig.discountType === 'fixed') {
            // Fixed discount applies to all items
            discountPercentage = discountConfig.fixedDiscount.percentage / 100;
        } else if (discountConfig.discountType === 'quantity') {
            // Quantity-based discount
            // Find the highest applicable tier based on cart item count
            const applicableTiers = discountConfig.quantityDiscount.tiers
                .filter(tier => cartItemCount >= tier.quantity)
                .sort((a, b) => b.percentage - a.percentage);
                
            if (applicableTiers.length > 0) {
                discountPercentage = applicableTiers[0].percentage / 100;
            } else {
                // No applicable tier found, return original price
                return price;
            }
        }
        
        // Apply discount if applicable
        if (discountPercentage > 0) {
            const discountedPrice = originalPrice - (originalPrice * discountPercentage);
            return `${discountedPrice.toFixed(2)}€`;
        }
        
        return price; // Return original price if no discount applies
    }

    function updateTotalPrice(cart) {
        let originalTotal = 0;
        let discountedTotal = 0;
        let finalDiscountPercentage = 0;
        let discountSource = '';
        
        // Calculate original total
        cart.forEach(product => {
            if (product.selectedOptionIndex !== undefined) {
                const originalPrice = parseFloat(product.options[product.selectedOptionIndex].price.replace('€', ''));
                originalTotal += originalPrice;
            }
        });

        // Determine which discount to apply
        if (!discountConfig) {
            // Si no hay configuración, usar descuento fijo por defecto
            finalDiscountPercentage = 0.20; // 20%
            discountSource = 'Descuento fijo';
        } else if (discountConfig.discountType === 'fixed') {
            // Fixed discount
            finalDiscountPercentage = discountConfig.fixedDiscount.percentage / 100;
            discountSource = 'Descuento fijo';
        } else if (discountConfig.discountType === 'quantity') {
            // Quantity-based discount
            const cartItemCount = cart.length;
            const applicableTiers = discountConfig.quantityDiscount.tiers
                .filter(tier => cartItemCount >= tier.quantity)
                .sort((a, b) => b.percentage - a.percentage);
                
            if (applicableTiers.length > 0) {
                finalDiscountPercentage = applicableTiers[0].percentage / 100;
                discountSource = `Descuento por cantidad (${cartItemCount} productos)`;
            }
        }
        
        // Check if promo code offers a better discount
        if (promoCodeDiscount > 0) {
            const promoDiscountDecimal = promoCodeDiscount / 100;
            if (promoDiscountDecimal > finalDiscountPercentage) {
                finalDiscountPercentage = promoDiscountDecimal;
                discountSource = `Código ${appliedPromoCode}`;
            } else {
                showNotification('El código de descuento es igual o inferior al descuento actual y no se aplicará', 'red');
                promoCodeDiscount = 0;
                appliedPromoCode = null;
            }
        }

        // Apply the final discount
        discountedTotal = originalTotal - (originalTotal * finalDiscountPercentage);

        // Add shipping costs if the discounted price is less than the threshold
        const shippingThreshold = discountConfig && discountConfig.discountType === 'fixed' 
            ? discountConfig.fixedDiscount.shippingThreshold 
            : 65; // Default threshold
            
        const shippingCost = discountedTotal > 0 && discountedTotal < shippingThreshold ? 6 : 0;
        const finalTotal = discountedTotal + shippingCost;

        // Update the DOM with the breakdown
        document.getElementById('subtotal-price').textContent = `${originalTotal.toFixed(2)}€`;
        
        // Show the applied discount
        const discountElement = document.getElementById('discount');
        
        if (finalDiscountPercentage > 0) {
            const discountAmount = originalTotal * finalDiscountPercentage;
            const discountHTML = `
                <div class="discount-line">
                    - ${discountAmount.toFixed(2)}€ (${discountSource} -${(finalDiscountPercentage * 100).toFixed(0)}%)
                </div>
            `;
            
            discountElement.innerHTML = discountHTML;
            discountElement.style.color = '#e60000';
            discountElement.style.fontWeight = 'bold';
        } else {
            discountElement.innerHTML = '';
        }
        
        document.getElementById('shipping-cost').textContent = 
            shippingCost > 0 ? 
            `+ ${shippingCost.toFixed(2)}€ (Envío)` : 
            'Envío gratuito';
        document.getElementById('total-price').textContent = `${finalTotal.toFixed(2)}€`;
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
        if (isProcessingOrder) {
            showNotification('El pedido ya está siendo procesado, por favor espere...', 'orange');
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const shippingInfo = document.getElementById('shipping-info').value.trim();
        
        if (!name || !email || !phone || !address) {
            showNotification('Por favor, complete todos los campos obligatorios.', 'red');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Por favor, introduzca un correo electrónico válido.', 'red');
            return;
        }
        
        isProcessingOrder = true;
        document.getElementById('checkout-button').disabled = true;
        document.getElementById('checkout-button').textContent = 'Procesando...';
        
        // Prepare the order details
        const totalPrice = document.getElementById('total-price').textContent;
        const orderDetails = cart.map(product => {
            const selectedOption = product.options[product.selectedOptionIndex];
            return `${product.name} - ${selectedOption.height} - ${selectedOption.price}`;
        }).join('\n');
        
        // Prepare the email template
        const templateParams = {
            nombre: name,
            email: email,
            phone: phone,
            direccion: address,
            codigo_postal: document.getElementById('postal-input') ? document.getElementById('postal-input').value.trim() : "No especificado",
            observaciones: shippingInfo || 'No proporcionada',
            cesta: orderDetails,
            precio: totalPrice,
            promo_code: appliedPromoCode || 'Ninguno'
        };
        
        // Send the email using EmailJS
        emailjs.send('service_wg7uw2n', 'template_1lrf8gi', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                showNotification('¡Pedido realizado con éxito! Te contactaremos pronto.', 'green');
                
                // Clear the cart and redirect to home page
                localStorage.removeItem('cart');
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 3000);
            }, function(error) {
                console.log('FAILED...', error);
                showNotification('Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.', 'red');
                isProcessingOrder = false;
                document.getElementById('checkout-button').disabled = false;
                document.getElementById('checkout-button').textContent = 'Realizar pedido';
            });
    }

    function showNotification(message, color = 'green') {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        
        notification.style.backgroundColor = color;

        document.body.appendChild(notification);

        setTimeout(function() {
            notification.style.opacity = '1';
        }, 10);

        setTimeout(function() {
            notification.style.opacity = '0';
            setTimeout(function() {
                notification.remove();
            }, 500);
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