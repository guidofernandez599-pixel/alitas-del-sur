// ── 1. SELECCIONAR ELEMENTOS DEL DOM ───────────────────────────────────
const contenedor = document.querySelector("#lista-productos");
const titulos = document.querySelectorAll("h2");

console.log("El contenedor de menú existe:", contenedor !== null);
console.log("Hay", titulos.length, "secciones secundarias h2 en la página");

// ── 2. PLANTILLA PARA CREAR PLATOS EN EL MENÚ ───────────────────────────
function crearTarjetaPlato(producto) {
  const articulo = document.createElement("article");

  articulo.classList.add("tarjeta");
  if (!producto.disponible) {
    articulo.classList.add("agotado");
  }

  articulo.dataset.nombre = producto.nombre;

  // Si no hay imagen o falla, carga una por defecto
  const imagenUrl = producto.imagen || "platos.jpg";
  const descripcionHtml = producto.descripcion ? `<p class="descripcion">${producto.descripcion}</p>` : "";
  const botonHtml = producto.disponible
    ? `<button type="button" class="btn-pedir" data-plato="${producto.nombre}" data-precio="${producto.precio}">Pedir este plato</button>`
    : `<button type="button" class="btn-pedir" disabled>Agotado</button>`;

  articulo.innerHTML = `
    <img src="${imagenUrl}" alt="${producto.nombre}" onerror="this.src='platos.jpg'">
    <h3>${producto.nombre}</h3>
    ${descripcionHtml}
    <p class="precio">Bs ${producto.precio.toFixed(2)}</p>
    <p class="categoria"><strong>Categoría:</strong> ${producto.categoria}</p>
    <p class="stock">${producto.disponible ? `Quedan ${producto.stock} porciones` : "❌ Agotado por hoy"}</p>
    ${botonHtml}
  `;

  return articulo;
}

// ── 3. FUNCIÓN DE RENDERIZADO EN EL DOM ─────────────────────────────────
function renderMenu(lista) {
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    const vacio = document.createElement("div");
    vacio.className = "mensaje-vacio";
    vacio.style.gridColumn = "1 / -1";
    vacio.style.textAlign = "center";
    vacio.style.padding = "2.5rem 1rem";
    vacio.style.color = "var(--color-suave)";
    vacio.innerHTML = `
      <p style="font-size: 1.3rem; margin-bottom: 0.5rem; font-weight: 600;">🍽️ No se encontraron platos</p>
      <p>Prueba buscando con otra palabra o selecciona otra categoría arriba.</p>
    `;
    contenedor.append(vacio);
    return;
  }

  lista.forEach(producto => {
    contenedor.append(crearTarjetaPlato(producto));
  });
}

// ── 4. EJECUTAR RENDERIZADO ─────────────────────────────────────────────
// Usa el arreglo 'productos' definido previamente en datos.js
if (typeof productos !== "undefined") {
  renderMenu(productos);
}

// ── 5. RECORRIDO DEL DOM ────────────────────────────────────────────────
const primeraTarjeta = document.querySelector(".tarjeta");
if (primeraTarjeta) {
  console.log("Contenedor padre:", primeraTarjeta.parentElement.id);
  console.log("Plato destacado:", primeraTarjeta.dataset.nombre);
}
