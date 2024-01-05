document.addEventListener('DOMContentLoaded', function () {

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.getElementById('confirm-purchase').addEventListener('click', function () {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length === 0) {
      showNotification('Tu cesta de la compra está vacía.', "red");
      return;
    } else window.location.href = 'cart.html';
  });

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
