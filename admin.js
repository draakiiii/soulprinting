document.addEventListener('DOMContentLoaded', function() {
    let productos = [];
    let cupones = {};

    // Cargar datos iniciales
    cargarDatos();

    // Event listeners
    document.getElementById('cupon-form').addEventListener('submit', crearCupon);
    document.getElementById('producto-form').addEventListener('submit', crearProducto);
    document.getElementById('agregar-opcion').addEventListener('click', agregarOpcion);
    document.getElementById('actualizar-productos').addEventListener('click', actualizarProductos);
    document.getElementById('actualizar-cupones').addEventListener('click', actualizarCupones);

    function cargarDatos() {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                productos = data;
                document.getElementById('productos-json').value = JSON.stringify(productos, null, 2);
                cargarProductos();
            })
            .catch(error => console.error('Error al cargar productos:', error));

        fetch('promo-codes.json')
            .then(response => response.json())
            .then(data => {
                cupones = data;
                document.getElementById('cupones-json').value = JSON.stringify(cupones, null, 2);
                cargarCupones();
            })
            .catch(error => console.error('Error al cargar cupones:', error));
    }

    function cargarProductos() {
        const productosLista = document.getElementById('productos-lista');
        productosLista.innerHTML = '';
        productos.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.textContent = producto.name;
            productosLista.appendChild(productoElement);
        });
    }

    function cargarCupones() {
        const cuponesLista = document.getElementById('cupones-lista');
        cuponesLista.innerHTML = '';
        for (const [codigo, datos] of Object.entries(cupones)) {
            const cuponElement = document.createElement('div');
            cuponElement.textContent = `${codigo}: ${datos.descuento}% - Caduca: ${datos.caducidad || 'No caduca'}`;
            cuponesLista.appendChild(cuponElement);
        }
    }

    function crearCupon(event) {
        event.preventDefault();
        const codigo = document.getElementById('cupon-codigo').value;
        const descuento = document.getElementById('cupon-descuento').value;
        const caducidad = document.getElementById('cupon-caducidad').value || null;

        cupones[codigo] = { descuento: parseInt(descuento), caducidad };
        
        document.getElementById('cupones-json').value = JSON.stringify(cupones, null, 2);
        cargarCupones();
        document.getElementById('cupon-form').reset();
    }

    function crearProducto(event) {
        event.preventDefault();
        const nombre = document.getElementById('producto-nombre').value;
        const imagenDefault = document.getElementById('producto-imagen-default').value;
        const imagenHover = document.getElementById('producto-imagen-hover').value;
        const opciones = Array.from(document.querySelectorAll('.opcion')).map(opcion => ({
            height: opcion.querySelector('.opcion-altura').value,
            price: opcion.querySelector('.opcion-precio').value
        }));

        const nuevoProducto = {
            defaultImage: imagenDefault,
            hoverImage: imagenHover,
            name: nombre,
            options: opciones
        };

        productos.push(nuevoProducto);
        document.getElementById('productos-json').value = JSON.stringify(productos, null, 2);
        cargarProductos();
        document.getElementById('producto-form').reset();
        document.getElementById('opciones-container').innerHTML = `
            <div class="opcion">
                <input type="text" class="opcion-altura" placeholder="Altura" required>
                <input type="text" class="opcion-precio" placeholder="Precio" required>
            </div>
        `;
    }

    function agregarOpcion() {
        const opcionesContainer = document.getElementById('opciones-container');
        const nuevaOpcion = document.createElement('div');
        nuevaOpcion.className = 'opcion';
        nuevaOpcion.innerHTML = `
            <input type="text" class="opcion-altura" placeholder="Altura" required>
            <input type="text" class="opcion-precio" placeholder="Precio" required>
        `;
        opcionesContainer.appendChild(nuevaOpcion);
    }

    function actualizarProductos() {
        try {
            productos = JSON.parse(document.getElementById('productos-json').value);
            cargarProductos();
            alert('Productos actualizados correctamente');
        } catch (error) {
            alert('Error al actualizar productos: JSON inválido');
        }
    }

    function actualizarCupones() {
        try {
            cupones = JSON.parse(document.getElementById('cupones-json').value);
            cargarCupones();
            alert('Cupones actualizados correctamente');
        } catch (error) {
            alert('Error al actualizar cupones: JSON inválido');
        }
    }
});