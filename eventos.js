// ── 1. SELECCIÓN DE ELEMENTOS DEL DOM ──────────────────────────────────
const buscador = document.querySelector("#buscador");
const filtros = document.querySelector("#filtros");
const formulario = document.querySelector("form");
const contenedorProductos = document.querySelector("#lista-productos");
const selectProductos = document.querySelector("#Productos");
const inputCantidad = document.querySelector("#cantidad");
const displayTotal = document.querySelector("#total-monto");
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

// ── 7. CÁLCULO EN VIVO DEL TOTAL DEL PEDIDO ─────────────────────────────
function actualizarTotalPedido() {
  if (!selectProductos || !displayTotal) return;
  const opcion = selectProductos.selectedOptions[0];
  const precio = opcion ? parseFloat(opcion.dataset.precio) || 0 : 0;
  const cantidad = inputCantidad ? parseInt(inputCantidad.value, 10) || 1 : 1;
  const total = typeof calcularTotal === "function" ? calcularTotal(precio, cantidad) : precio * cantidad;
  displayTotal.textContent = `Bs ${total.toFixed(2)}`;
}

if (selectProductos) {
  selectProductos.addEventListener("change", actualizarTotalPedido);
}
if (inputCantidad) {
  inputCantidad.addEventListener("input", actualizarTotalPedido);
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

    // Capturar datos del formulario
    const datos = Object.fromEntries(new FormData(formulario));
    console.log("Pedido recibido en Alitas del Sur:", datos);

    // Confirmación al cliente
    alert(`¡Gracias por tu pedido, ${datos.nombre}!\nHas solicitado: ${datos.cantidad} x ${datos.Productos}.\nNos pondremos en contacto al ${datos.telefono} para confirmar.`);
    formulario.reset();
    if (inputFecha) inputFecha.value = hoy;
    actualizarTotalPedido();
  });
}

// Inicializar estado del menú y total en pantalla
actualizar();
actualizarTotalPedido();