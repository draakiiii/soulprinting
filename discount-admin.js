document.addEventListener('DOMContentLoaded', function() {
  const fixedDiscountRadio = document.getElementById('fixed-discount');
  const quantityDiscountRadio = document.getElementById('quantity-discount');
  const fixedDiscountOptions = document.getElementById('fixed-discount-options');
  const quantityDiscountOptions = document.getElementById('quantity-discount-options');
  const saveButton = document.getElementById('save-config');
  const statusMessage = document.getElementById('status-message');

  // Function to toggle between fixed and quantity discount options
  function toggleDiscountOptions() {
    if (fixedDiscountRadio.checked) {
      fixedDiscountOptions.style.display = 'block';
      quantityDiscountOptions.style.display = 'none';
    } else {
      fixedDiscountOptions.style.display = 'none';
      quantityDiscountOptions.style.display = 'block';
    }
  }

  // Add event listeners for the radio buttons
  fixedDiscountRadio.addEventListener('change', toggleDiscountOptions);
  quantityDiscountRadio.addEventListener('change', toggleDiscountOptions);

  // Load current configuration when page loads
  loadCurrentConfig();

  // Save configuration when button is clicked
  saveButton.addEventListener('click', saveConfig);

  // Function to load current configuration from discount-config.json
  function loadCurrentConfig() {
    fetch('discount-config.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(config => {
        // Set discount type radio
        if (config.discountType === 'fixed') {
          fixedDiscountRadio.checked = true;
        } else {
          quantityDiscountRadio.checked = true;
        }
        
        // Set fixed discount values
        document.getElementById('fixed-percentage').value = config.fixedDiscount.percentage;
        document.getElementById('shipping-threshold').value = config.fixedDiscount.shippingThreshold;
        
        // Set quantity discount tiers
        if (config.quantityDiscount && config.quantityDiscount.tiers) {
          const tiers = config.quantityDiscount.tiers;
          for (let i = 0; i < tiers.length && i < 3; i++) {
            document.getElementById(`tier-quantity-${i}`).value = tiers[i].quantity;
            document.getElementById(`tier-percentage-${i}`).value = tiers[i].percentage;
          }
        }
        
        // Toggle options display based on selected discount type
        toggleDiscountOptions();
      })
      .catch(error => {
        console.error('Error loading discount configuration:', error);
        statusMessage.textContent = 'Error al cargar la configuración: ' + error.message;
        statusMessage.style.color = 'red';
      });
  }

  // Function to save configuration to discount-config.json
  function saveConfig() {
    const config = {
      discountType: fixedDiscountRadio.checked ? 'fixed' : 'quantity',
      fixedDiscount: {
        percentage: parseInt(document.getElementById('fixed-percentage').value, 10),
        shippingThreshold: parseInt(document.getElementById('shipping-threshold').value, 10)
      },
      quantityDiscount: {
        enabled: quantityDiscountRadio.checked,
        tiers: [
          {
            quantity: parseInt(document.getElementById('tier-quantity-0').value, 10),
            percentage: parseInt(document.getElementById('tier-percentage-0').value, 10)
          },
          {
            quantity: parseInt(document.getElementById('tier-quantity-1').value, 10),
            percentage: parseInt(document.getElementById('tier-percentage-1').value, 10)
          },
          {
            quantity: parseInt(document.getElementById('tier-quantity-2').value, 10),
            percentage: parseInt(document.getElementById('tier-percentage-2').value, 10)
          }
        ]
      }
    };

    // Sort quantity tiers by quantity (ascending)
    config.quantityDiscount.tiers.sort((a, b) => a.quantity - b.quantity);

    // Save to discount-config.json through our server endpoint
    fetch('discount-config.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      statusMessage.textContent = 'Configuración guardada correctamente';
      statusMessage.style.color = 'green';
      
      // Refresh the page after 1 second to see the changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
    .catch(error => {
      console.error('Error saving discount configuration:', error);
      statusMessage.textContent = 'Error al guardar la configuración: ' + error.message;
      statusMessage.style.color = 'red';
    });
  }
}); 