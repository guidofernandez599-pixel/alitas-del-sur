// ── 1. SELECCIÓN DE ELEMENTOS DEL DOM ──────────────────────────────────
const buscador = document.querySelector("#buscador");
const filtros = document.querySelector("#filtros");
const formulario = document.querySelector("form");
const contenedorProductos = document.querySelector("#lista-productos");
const selectProductos = document.querySelector("#Productos");
const inputCantidad = document.querySelector("#cantidad");
const displayTotal = document.querySelector("#total-monto");
const resumenPedidoTexto = document.querySelector("#resumen-pedido-texto");
const btnAgregarSelectBandeja = document.querySelector("#btn-agregar-select-bandeja");
const inputFecha = document.querySelector("#fecha");
const resultadoTexto = document.querySelector("#resultado");

let categoriaActiva = "todos";
let textoBuscado = "";

// ── 2. UTILIDAD: OBTENER FECHA LOCAL EN FORMATO YYYY-MM-DD ──────────────
function obtenerFechaLocal() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Configurar fecha mínima y valor por defecto hoy
if (inputFecha) {
  const hoyLocal = obtenerFechaLocal();
  inputFecha.min = hoyLocal;
  if (!inputFecha.value) {
    inputFecha.value = hoyLocal;
  }
}

// ── 3. FUNCIÓN DE FILTRADO Y ACTUALIZACIÓN ──────────────────────────────
function actualizar() {
  if (typeof productos === "undefined") return;

  const normalizar = (txt) =>
    (txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const terminoNorm = normalizar(textoBuscado);

  const visibles = productos
    .filter(p => categoriaActiva === "todos" || p.categoria === categoriaActiva)
    .filter(p => {
      if (!terminoNorm) return true;
      const nombreNorm = normalizar(p.nombre);
      const catNorm = normalizar(p.categoria);
      const descNorm = normalizar(p.descripcion);
      return nombreNorm.includes(terminoNorm) || catNorm.includes(terminoNorm) || descNorm.includes(terminoNorm);
    });

  // Ordenar según preferencia activa si existe el selector #orden
  const selectOrden = document.querySelector("#orden");
  const criterioOrden = selectOrden ? selectOrden.value : "nombre";
  visibles.sort((a, b) => {
    if (criterioOrden === "precio") return a.precio - b.precio;
    return a.nombre.localeCompare(b.nombre, "es");
  });

  // Llama a la función renderMenu que definimos en render.js
  if (typeof renderMenu === "function") {
    renderMenu(visibles);
  }

  // Actualiza el indicador accesible de resultados
  if (resultadoTexto) {
    if (visibles.length === 0) {
      resultadoTexto.textContent = `No se encontraron platos para "${textoBuscado.trim()}".`;
    } else if (terminoNorm !== "" || categoriaActiva !== "todos") {
      resultadoTexto.textContent = `Mostrando ${visibles.length} plato(s) disponible(s).`;
    } else {
      resultadoTexto.textContent = `Mostrando todos los platos (${visibles.length}).`;
    }
  }
}

// ── 4. EVENTO DE BÚSQUEDA EN TIEMPO REAL ────────────────────────────────
if (buscador) {
  buscador.addEventListener("input", (event) => {
    textoBuscado = event.target.value;
    actualizar();
  });
}

// ── 5. DELEGACIÓN DE EVENTOS PARA FILTROS POR CATEGORÍA ─────────────────
if (filtros) {
  filtros.addEventListener("click", (event) => {
    const boton = event.target.closest("button");
    if (!boton) return;

    categoriaActiva = boton.dataset.categoria;

    filtros.querySelectorAll("button").forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");

    actualizar();
  });
}

// ── 6. SELECCIONAR PLATO DESDE LA TARJETA DEL MENÚ ──────────────────────
if (contenedorProductos) {
  contenedorProductos.addEventListener("click", (event) => {
    const boton = event.target.closest(".btn-pedir");
    if (!boton || boton.disabled) return;

    const nombrePlato = boton.dataset.plato;
    const platoObj = typeof productos !== "undefined"
      ? productos.find(p => p.nombre === nombrePlato)
      : null;

    // Si existe la bandeja interactiva, agrega el plato a la bandeja
    if (typeof window.agregarPlatoABandeja === "function" && platoObj) {
      window.agregarPlatoABandeja(platoObj, 1);
    }

    if (selectProductos) {
      const opciones = Array.from(selectProductos.options);
      const coincidencia = opciones.find(opt => opt.value === nombrePlato);
      if (coincidencia) {
        selectProductos.value = nombrePlato;
      }
      actualizarTotalPedido();
    }

    const seccionPedidos = document.querySelector("#Pedidos");
    if (seccionPedidos) {
      seccionPedidos.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// ── 7. CÁLCULO EN VIVO DEL TOTAL DEL PEDIDO (BANDEJA + SELECTOR) ────────
function actualizarTotalPedido() {
  if (!displayTotal) return;

  const itemsBandeja = Array.isArray(window.bandejaPedido) ? window.bandejaPedido : [];
  const totalBandeja = itemsBandeja.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  if (itemsBandeja.length > 0) {
    // Si hay platos en la bandeja, el selector individual no es obligatorio
    if (selectProductos) selectProductos.required = false;
    displayTotal.textContent = `Bs ${totalBandeja.toFixed(2)}`;

    if (resumenPedidoTexto) {
      const detalle = itemsBandeja.map(i => `${i.cantidad}x ${i.nombre}`).join(", ");
      resumenPedidoTexto.textContent = `🧾 Platos en tu bandeja: ${detalle}`;
    }
    return;
  }

  // Si la bandeja está vacía, usar el selector clásico
  if (selectProductos) selectProductos.required = true;
  const opcion = selectProductos ? selectProductos.selectedOptions[0] : null;
  const precio = opcion ? parseFloat(opcion.dataset.precio) || 0 : 0;
  const cantidad = inputCantidad ? parseInt(inputCantidad.value, 10) || 1 : 1;
  const total = typeof calcularTotal === "function" ? calcularTotal(precio, cantidad) : precio * cantidad;

  displayTotal.textContent = `Bs ${total.toFixed(2)}`;

  if (resumenPedidoTexto) {
    if (opcion && opcion.value) {
      resumenPedidoTexto.textContent = `🧾 Selección rápida: ${cantidad}x ${opcion.value} (puedes arrastrar más platos a la bandeja arriba).`;
    } else {
      resumenPedidoTexto.textContent = "Ningún plato seleccionado todavía. Arrastra platos a la bandeja o elige uno arriba.";
    }
  }
}

if (selectProductos) {
  selectProductos.addEventListener("change", actualizarTotalPedido);
}
if (inputCantidad) {
  inputCantidad.addEventListener("input", actualizarTotalPedido);
}

// Botón para pasar lo elegido en el <select> directamente a la bandeja
if (btnAgregarSelectBandeja) {
  btnAgregarSelectBandeja.addEventListener("click", () => {
    if (!selectProductos || !selectProductos.value) {
      selectProductos?.focus();
      return;
    }
    const nombre = selectProductos.value;
    const opcion = selectProductos.selectedOptions[0];
    const precio = opcion ? parseFloat(opcion.dataset.precio) || 20 : 20;
    const cantidad = inputCantidad ? parseInt(inputCantidad.value, 10) || 1 : 1;
    const platoCatalogo = typeof productos !== "undefined"
      ? productos.find(p => p.nombre === nombre)
      : null;

    if (typeof window.agregarPlatoABandeja === "function") {
      window.agregarPlatoABandeja({
        nombre,
        precio,
        imagen: platoCatalogo ? platoCatalogo.imagen : "platos.jpg",
      }, cantidad);
    }
  });
}

// ── 8. EXPRESIONES REGULARES PARA VALIDACIÓN (TELÉFONO BOLIVIANO Y CORREO) ─
const PATRONES = {
  telefono: /^[0-9]{7,8}$/,
  correo: /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i,
};

// ── 9. MANEJO Y VALIDACIÓN DEL FORMULARIO DE PEDIDOS ────────────────────
if (formulario) {
  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    actualizarTotalPedido();

    if (!formulario.reportValidity()) {
      return;
    }

    // Validación de fecha (usando la fecha local, no UTC)
    const hoy = obtenerFechaLocal();
    if (inputFecha && inputFecha.value < hoy) {
      inputFecha.setCustomValidity("La fecha de entrega no puede ser anterior a hoy.");
      inputFecha.reportValidity();
      inputFecha.addEventListener("input", () => inputFecha.setCustomValidity(""), { once: true });
      return;
    }

    // Validación con expresiones regulares
    const telefono = formulario.querySelector("#telefono");
    if (telefono && !PATRONES.telefono.test(telefono.value.trim())) {
      telefono.setCustomValidity("Ingresa un número telefónico boliviano válido (7 u 8 dígitos).");
      telefono.reportValidity();
      telefono.addEventListener("input", () => telefono.setCustomValidity(""), { once: true });
      return;
    }

    const email = formulario.querySelector("#email");
    if (email && !PATRONES.correo.test(email.value.trim())) {
      email.setCustomValidity("Ingresa un correo electrónico válido.");
      email.reportValidity();
      email.addEventListener("input", () => email.setCustomValidity(""), { once: true });
      return;
    }

    // Capturar datos del formulario y de la bandeja
    const datos = Object.fromEntries(new FormData(formulario));
    const itemsBandeja = Array.isArray(window.bandejaPedido) ? window.bandejaPedido : [];

    let resumenPlatos = "";
    let montoTotal = 0;

    if (itemsBandeja.length > 0) {
      resumenPlatos = itemsBandeja
        .map(i => `• ${i.cantidad} x ${i.nombre} (Bs ${(i.precio * i.cantidad).toFixed(2)})`)
        .join("\n");
      montoTotal = itemsBandeja.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
      datos.platosBandeja = itemsBandeja;
      datos.totalBs = montoTotal;
    } else {
      const opcion = selectProductos ? selectProductos.selectedOptions[0] : null;
      const precio = opcion ? parseFloat(opcion.dataset.precio) || 0 : 0;
      const cant = parseInt(datos.cantidad, 10) || 1;
      montoTotal = precio * cant;
      resumenPlatos = `• ${cant} x ${datos.Productos} (Bs ${montoTotal.toFixed(2)})`;
      datos.totalBs = montoTotal;
    }

    console.log("Pedido recibido en Alitas del Sur:", datos);

    // Confirmación al cliente
    alert(
      `¡Gracias por tu pedido, ${datos.nombre}!\n\nDetalle de tu bandeja:\n${resumenPlatos}\n\nTotal a pagar: Bs ${montoTotal.toFixed(2)}\nNos pondremos en contacto al ${datos.telefono} para confirmar.`
    );

    formulario.reset();
    if (typeof window.vaciarBandeja === "function") {
      window.vaciarBandeja();
    }
    if (inputFecha) inputFecha.value = hoy;
    actualizarTotalPedido();
  });
}

// Inicializar estado del menú y total en pantalla
actualizar();
actualizarTotalPedido();
