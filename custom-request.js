document.addEventListener('DOMContentLoaded', function () {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let isProcessingRequest = false;

    document.getElementById('confirm-purchase').addEventListener('click', function () {
        localStorage.setItem('cart', JSON.stringify(cart));
        if (cart.length === 0) {
            showNotification('Tu cesta de la compra está vacía.', "red");
            return;
        } else window.location.href = 'cart.html';
    });

    document.getElementById('submit-request').addEventListener('click', function(event) {
        event.preventDefault();
        submitRequest();
    });

    function validateForm() {
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const figureNameInput = document.getElementById('figure-name-input');
        const figureDescription = document.getElementById('figure-description');

        if (nameInput.value.trim() === '') {
            showNotification('Por favor, introduce tu nombre', 'red');
            return false;
        }

        if (emailInput.value.trim() === '') {
            showNotification('Por favor, introduce tu email', 'red');
            return false;
        }

        if (figureNameInput.value.trim() === '') {
            showNotification('Por favor, introduce el nombre de la figura', 'red');
            return false;
        }

        if (figureDescription.value.trim() === '') {
            showNotification('Por favor, introduce una descripción de la figura', 'red');
            return false;
        }

        return true;
    }

    function submitRequest() {
        if (isProcessingRequest) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        isProcessingRequest = true;
        const submitButton = document.getElementById('submit-request');
        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        const templateParams = {
            nombre: document.getElementById('name-input').value,
            email: document.getElementById('email-input').value,
            figura_nombre: document.getElementById('figure-name-input').value,
            figura_descripcion: document.getElementById('figure-description').value,
            notas_adicionales: document.getElementById('additional-notes').value || "No hay notas adicionales"
        };

        emailjs.send('service_wg7uw2n', 'template_2', templateParams)
            .then(function(response) {
                showNotification('Tu solicitud ha sido enviada. Te hemos enviado un email de confirmación.', 'green');
                clearForm();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            })
            .catch(function(error) {
                showNotification('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.', 'red');
                console.error('Error:', error);
            })
            .finally(function() {
                isProcessingRequest = false;
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar solicitud';
            });
    }

    function clearForm() {
        document.getElementById('name-input').value = '';
        document.getElementById('email-input').value = '';
        document.getElementById('figure-name-input').value = '';
        document.getElementById('figure-description').value = '';
        document.getElementById('additional-notes').value = '';
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

        setTimeout(() => {
            notification.style.opacity = 1;
        }, 100);

        setTimeout(() => {
            notification.style.opacity = 0;
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000);
    }
}); 