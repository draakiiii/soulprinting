const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('./'));

// Endpoint to save discount configuration
app.put('/discount-config.json', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(path.join(__dirname, 'discount-config.json'), data);
    res.status(200).send({ message: 'Configuración guardada correctamente' });
  } catch (error) {
    console.error('Error saving discount configuration:', error);
    res.status(500).send({ message: 'Error saving configuration', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 