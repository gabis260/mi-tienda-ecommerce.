// Variables globales
const carrito = [];
const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadProductos = document.getElementById("cantidad");
const paypalContainer = document.getElementById("paypal-button-container");

// Función para mostrar productos en la página
function mostrarProductos(productosAMostrar) {
  contenedorProductos.innerHTML = "";
  productosAMostrar.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${formatearPrecio(prod.precio)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

// Formatea el precio con separadores de miles
function formatearPrecio(precio) {
  return precio.toLocaleString('es-CO');
}

// Agregar un producto al carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const itemExistente = carrito.find(p => p.id === id);
  if (itemExistente) {
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
  // Esconder PayPal si estaba visible
  paypalContainer.style.display = "none";
}

// Actualiza el contenido del carrito en la página
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.nombre} x${item.cantidad} - $${formatearPrecio(item.precio * item.cantidad)}`;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = formatearPrecio(total);
  cantidadProductos.textContent = cantidadTotal;
}

// Vaciar completamente el carrito
function vaciarCarrito() {
  if (carrito.length === 0) {
    alert("El carrito ya está vacío.");
    return;
  }
  if (confirm("¿Estás seguro que deseas vaciar el carrito?")) {
    carrito.length = 0;
    actualizarCarrito();
    alert("🧼 ¡Carrito vaciado exitosamente!");
    // Esconder PayPal
    paypalContainer.style.display = "none";
  }
}

// Filtrar productos por categoría
function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados = seleccion === "todos"
    ? productos
    : productos.filter(p => p.categoria === seleccion);

  mostrarProductos(productosFiltrados);
}

// Proceder al checkout y mostrar opciones de pago
function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío. ¡Agrega productos primero!");
    return;
  }
  
  // Mostrar botón de PayPal
  paypalContainer.style.display = "block";
}

// Configurar PayPal
if (window.paypal) {
  paypal.Buttons({
    createOrder: function(data, actions) {
      const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: (total / 4000).toFixed(2) // Simulación en dólares (asume tasa COP/USD = 4000)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert(`¡Gracias ${details.payer.name.given_name || "por tu compra"}, tu pago fue exitoso! 🎀`);
        carrito.length = 0;
        actualizarCarrito();
        paypalContainer.style.display = "none";
      });
    },
    onError: function(err) {
      console.error(err);
      alert("Hubo un problema con el pago.");
    }
  }).render("#paypal-button-container");
}

// Iniciar la página mostrando todos los productos
document.addEventListener("DOMContentLoaded", function() {
  mostrarProductos(productos);
});
