/* ═════════════════════════════════════════════════════════════════════════
   DEMO DEL DÍA 14 - Canvas y Drag & Drop (Alitas del Sur)

   1. Tablero de planificación diaria de cocina (Drag & Drop entre columnas +
      gráfico de barras en Canvas).
   2. Bandeja interactiva de pedidos (Arrastrar platos con sus pequeñas
      imágenes al cuadro de bandeja + renderizado visual en Canvas).
   ═════════════════════════════════════════════════════════════════════════ */

// ── PARTE A: TABLERO DE PLANIFICACIÓN DEL DÍA ─────────────────────────────
const COLUMNAS = ["hornear", "reponer", "pausa"];
const ETIQUETAS_COLUMNAS = {
  hornear: "Preparar hoy",
  reponer: "Reponer stock",
  pausa: "En pausa",
};

let tablero = {
  hornear: [
    { nombre: "Sajta de Pollo", cantidad: 20, imagen: "sajta.jpg" },
    { nombre: "Porción de Alitas", cantidad: 30, imagen: "alitas.jpg" },
    { nombre: "Silpancho", cantidad: 15, imagen: "silpancho.jpg" },
  ],
  reponer: [
    { nombre: "Plato Paceño", cantidad: 10, imagen: "platopaceno.jpg" },
    { nombre: "Trucha Frita", cantidad: 8, imagen: "trucha.jpg" },
  ],
  pausa: [
    { nombre: "Chicharron", cantidad: 5, imagen: "chicharron.jpg" },
    { nombre: "Combo Familiar", cantidad: 5, imagen: "platos.jpg" },
  ],
};

// ── 1. PINTAR EL TABLERO ────────────────────────────────────────────────
function renderTablero() {
  COLUMNAS.forEach((nombreColumna) => {
    const columna = document.querySelector(`[data-columna="${nombreColumna}"]`);
    if (!columna) return;

    const lista = columna.querySelector(".lista-columna");
    if (!lista) return;
    lista.innerHTML = "";

    tablero[nombreColumna].forEach((item, indice) => {
      const li = document.createElement("li");
      li.className = "ficha";
      li.draggable = true;
      li.dataset.columna = nombreColumna;
      li.dataset.indice = String(indice);

      const imgUrl = item.imagen || "platos.jpg";
      const siguienteColumna = COLUMNAS[(COLUMNAS.indexOf(nombreColumna) + 1) % COLUMNAS.length];

      li.innerHTML = `
        <div class="ficha-contenido">
          <img src="${imgUrl}" alt="${item.nombre}" onerror="this.src='platos.jpg'">
          <span class="ficha-texto">${item.nombre} (${item.cantidad})</span>
        </div>
        <button type="button" class="btn-mover-ficha" title="Mover a ${ETIQUETAS_COLUMNAS[siguienteColumna]}" aria-label="Mover ${item.nombre} a ${ETIQUETAS_COLUMNAS[siguienteColumna]}">↪</button>
      `;

      lista.append(li);
    });

    const total = tablero[nombreColumna].reduce((suma, i) => suma + i.cantidad, 0);
    const n = tablero[nombreColumna].length;
    const elTotal = columna.querySelector(".total");
    if (elTotal) {
      elTotal.textContent = `${n} ${n === 1 ? "plato" : "platos"} · ${total} raciones`;
    }
  });

  dibujarGrafico();
}

// ── 2. DRAG & DROP EN EL TABLERO ────────────────────────────────────────
const elTablero = document.querySelector("#tablero");

if (elTablero) {
  elTablero.addEventListener("dragstart", (event) => {
    const ficha = event.target.closest(".ficha");
    if (!ficha) return;

    event.dataTransfer.setData("text/plain", JSON.stringify({
      tipo: "ficha-tablero",
      columna: ficha.dataset.columna,
      indice: Number(ficha.dataset.indice),
    }));

    event.dataTransfer.effectAllowed = "move";
    ficha.classList.add("arrastrando");
  });

  elTablero.addEventListener("dragend", (event) => {
    const ficha = event.target.closest(".ficha");
    if (ficha) ficha.classList.remove("arrastrando");
    document.querySelectorAll(".columna").forEach(c => c.classList.remove("encima"));
  });

  elTablero.addEventListener("dragover", (event) => {
    const columna = event.target.closest(".columna");
    if (!columna) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    columna.classList.add("encima");
  });

  elTablero.addEventListener("dragleave", (event) => {
    const columna = event.target.closest(".columna");
    if (columna && !columna.contains(event.relatedTarget)) {
      columna.classList.remove("encima");
    }
  });

  elTablero.addEventListener("drop", (event) => {
    const columna = event.target.closest(".columna");
    if (!columna) return;

    event.preventDefault();
    columna.classList.remove("encima");

    const destino = columna.dataset.columna;
    if (!destino || !tablero[destino]) return;

    try {
      const origen = JSON.parse(event.dataTransfer.getData("text/plain"));

      // Si se arrastró una ficha del propio tablero
      if (origen && origen.columna && tablero[origen.columna]) {
        if (origen.columna === destino) return;
        const [item] = tablero[origen.columna].splice(origen.indice, 1);
        if (item) {
          tablero[destino].push(item);
          renderTablero();
        }
      } else if (origen && origen.tipo === "plato-bandeja") {
        // Si alguien suelta un plato del catálogo en el tablero, también lo suma o agrega
        const existente = tablero[destino].find(i => i.nombre === origen.nombre);
        if (existente) {
          existente.cantidad += 5;
        } else {
          tablero[destino].push({
            nombre: origen.nombre,
            cantidad: 10,
            imagen: origen.imagen || "platos.jpg",
          });
        }
        renderTablero();
      }
    } catch (err) {
      console.warn("Dato de arrastre no válido en el tablero:", err);
    }
  });

  // Alternativa accesible / móvil con el botón ↪ de cada ficha
  elTablero.addEventListener("click", (event) => {
    const btnMover = event.target.closest(".btn-mover-ficha");
    if (!btnMover) return;

    const ficha = btnMover.closest(".ficha");
    if (!ficha) return;

    const colOrigen = ficha.dataset.columna;
    const indice = Number(ficha.dataset.indice);
    const idxActual = COLUMNAS.indexOf(colOrigen);
    if (idxActual === -1) return;

    const colDestino = COLUMNAS[(idxActual + 1) % COLUMNAS.length];
    const [item] = tablero[colOrigen].splice(indice, 1);
    if (item) {
      tablero[colDestino].push(item);
      renderTablero();
    }
  });
}

// ── 3. CANVAS DEL TABLERO (#grafico) ────────────────────────────────────
const canvas = document.querySelector("#grafico");
const ctx = canvas ? canvas.getContext("2d") : null;

function dibujarGrafico() {
  if (!canvas || !ctx) return;

  const totales = COLUMNAS.map(c =>
    tablero[c].reduce((suma, i) => suma + i.cantidad, 0)
  );
  const maximo = Math.max(...totales, 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const margen = 44;
  const anchoBarra = 115;
  const separacion = 65;
  const alturaUtil = canvas.height - margen * 2;

  const estilo = getComputedStyle(document.body);
  const colorBarra = estilo.getPropertyValue("--color-principal").trim() || "#d35400";
  const colorSecundario = estilo.getPropertyValue("--color-secundario").trim() || "#e67e22";
  const colorTexto = estilo.getPropertyValue("--color-texto").trim() || "#2c3e50";
  const colorBorde = estilo.getPropertyValue("--color-borde").trim() || "#dcdde1";

  // Líneas guía horizontales suaves
  ctx.save();
  ctx.strokeStyle = colorBorde;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  for (let paso = 0.25; paso <= 1; paso += 0.25) {
    const yGuia = canvas.height - margen - alturaUtil * paso;
    ctx.beginPath();
    ctx.moveTo(margen - 10, yGuia);
    ctx.lineTo(canvas.width - margen + 10, yGuia);
    ctx.stroke();
  }
  ctx.restore();

  COLUMNAS.forEach((nombre, i) => {
    const x = margen + 15 + i * (anchoBarra + separacion);
    const alto = (totales[i] / maximo) * alturaUtil;
    const y = canvas.height - margen - alto;

    // Gradiente para la barra
    const grad = ctx.createLinearGradient(x, y, x, canvas.height - margen);
    grad.addColorStop(0, colorSecundario);
    grad.addColorStop(1, colorBarra);

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, anchoBarra, alto);

    ctx.fillStyle = colorTexto;
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ETIQUETAS_COLUMNAS[nombre] || nombre, x + anchoBarra / 2, canvas.height - margen + 22);
    ctx.fillText(`${totales[i]} uds`, x + anchoBarra / 2, Math.max(18, y - 8));
  });

  // Línea de base
  ctx.beginPath();
  ctx.moveTo(margen - 10, canvas.height - margen);
  ctx.lineTo(canvas.width - margen + 10, canvas.height - margen);
  ctx.strokeStyle = colorTexto;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════════
// ── PARTE B: BANDEJA DE PEDIDOS CON DRAG & DROP, IMÁGENES Y CANVAS ───────
// ═════════════════════════════════════════════════════════════════════════

const catalogoBandeja = document.querySelector("#catalogo-bandeja");
const cuadroBandeja = document.querySelector("#cuadro-bandeja");
const listaBandeja = document.querySelector("#lista-bandeja");
const btnVaciarBandeja = document.querySelector("#vaciar-bandeja");
const bandejaContador = document.querySelector("#bandeja-contador");
const bandejaSubtotal = document.querySelector("#bandeja-subtotal");
const canvasBandeja = document.querySelector("#canvas-bandeja");
const ctxBandeja = canvasBandeja ? canvasBandeja.getContext("2d") : null;

// Estado de los platos agregados a la bandeja de pedido
window.bandejaPedido = [];

// Coordenadas de cada plato dibujado en el Canvas (para permitir clic sobre ellos)
let posicionesPlatosCanvas = [];

// Caché de objetos Image para dibujar las fotos de los platos en el Canvas
const cacheImagenesPlatos = {};

function obtenerPlatosCatalogo() {
  if (typeof productos !== "undefined" && Array.isArray(productos)) {
    return productos;
  }
  return [
    { nombre: "Sajta de Pollo", precio: 20, imagen: "sajta.jpg", disponible: true },
    { nombre: "Silpancho", precio: 22, imagen: "silpancho.jpg", disponible: true },
    { nombre: "Plato Paceño", precio: 25, imagen: "platopaceno.jpg", disponible: true },
    { nombre: "Trucha Frita", precio: 30, imagen: "trucha.jpg", disponible: true },
    { nombre: "Porción de Alitas", precio: 20, imagen: "alitas.jpg", disponible: true },
    { nombre: "Combo Familiar", precio: 85, imagen: "platos.jpg", disponible: true },
  ];
}

function precargarImagenesBandeja() {
  const lista = obtenerPlatosCatalogo();
  lista.forEach((plato) => {
    const src = plato.imagen || "platos.jpg";
    if (!cacheImagenesPlatos[src]) {
      const img = new Image();
      img.src = src;
      img.onload = () => dibujarCanvasBandeja();
      img.onerror = () => {
        if (src !== "platos.jpg") {
          img.src = "platos.jpg";
        }
      };
      cacheImagenesPlatos[src] = img;
    }
  });
}

// ── 1. RENDERIZAR CATÁLOGO LATERAL DE PLATOS CON PEQUEÑAS IMÁGENES ──────
function renderCatalogoBandeja() {
  if (!catalogoBandeja) return;
  catalogoBandeja.innerHTML = "";

  const platos = obtenerPlatosCatalogo();
  platos.forEach((plato) => {
    const li = document.createElement("li");
    li.className = "plato-arrastrable";
    li.draggable = true;
    li.dataset.nombre = plato.nombre;
    li.dataset.precio = String(plato.precio);
    li.dataset.imagen = plato.imagen || "platos.jpg";

    li.innerHTML = `
      <div class="plato-arrastrable-info">
        <img src="${plato.imagen || "platos.jpg"}" alt="${plato.nombre}" onerror="this.src='platos.jpg'">
        <div class="plato-arrastrable-texto">
          <span class="plato-arrastrable-nombre">${plato.nombre}</span>
          <span class="plato-arrastrable-precio">Bs ${Number(plato.precio).toFixed(2)}</span>
        </div>
      </div>
      <button type="button" class="btn-agregar-mini" title="Agregar ${plato.nombre} a la bandeja" aria-label="Agregar ${plato.nombre} a la bandeja">+</button>
    `;

    catalogoBandeja.append(li);
  });
}

// ── 2. FUNCIONES DE ESTADO DE LA BANDEJA ────────────────────────────────
function agregarPlatoABandeja(plato, cantidad = 1) {
  if (!plato || !plato.nombre) return;
  const cant = Math.max(1, Number(cantidad) || 1);
  const existente = window.bandejaPedido.find(item => item.nombre === plato.nombre);

  if (existente) {
    existente.cantidad += cant;
  } else {
    window.bandejaPedido.push({
      nombre: plato.nombre,
      precio: Number(plato.precio) || 0,
      imagen: plato.imagen || "platos.jpg",
      cantidad: cant,
    });
  }

  renderBandeja();
}

function cambiarCantidadBandeja(nombrePlato, delta) {
  const idx = window.bandejaPedido.findIndex(item => item.nombre === nombrePlato);
  if (idx === -1) return;

  window.bandejaPedido[idx].cantidad += delta;
  if (window.bandejaPedido[idx].cantidad <= 0) {
    window.bandejaPedido.splice(idx, 1);
  }

  renderBandeja();
}

function eliminarPlatoDeBandeja(nombrePlato) {
  window.bandejaPedido = window.bandejaPedido.filter(item => item.nombre !== nombrePlato);
  renderBandeja();
}

function vaciarBandeja() {
  window.bandejaPedido = [];
  renderBandeja();
}

// Expone funciones para que eventos.js también pueda usarlas al pedir desde el menú
window.agregarPlatoABandeja = agregarPlatoABandeja;
window.vaciarBandeja = vaciarBandeja;

// ── 3. RENDERIZAR LA LISTA Y LOS DOS LIENZOS CANVAS DE LA BANDEJA ───────
function renderBandeja() {
  if (listaBandeja) {
    listaBandeja.innerHTML = "";

    window.bandejaPedido.forEach((item) => {
      const li = document.createElement("li");
      li.className = "item-bandeja";
      const subtotalItem = item.precio * item.cantidad;

      li.innerHTML = `
        <div class="item-bandeja-info">
          <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='platos.jpg'">
          <div>
            <strong>${item.nombre}</strong>
            <div style="font-size: 0.82rem; color: var(--color-suave);">
              Bs ${item.precio.toFixed(2)} c/u · Subtotal: <strong>Bs ${subtotalItem.toFixed(2)}</strong>
            </div>
          </div>
        </div>
        <div class="item-bandeja-controles">
          <button type="button" class="btn-cant-bandeja" data-accion="restar" data-nombre="${item.nombre}" aria-label="Restar uno de ${item.nombre}">−</button>
          <span style="min-width: 1.5rem; text-align: center; font-weight: 700;">${item.cantidad}</span>
          <button type="button" class="btn-cant-bandeja" data-accion="sumar" data-nombre="${item.nombre}" aria-label="Sumar uno de ${item.nombre}">+</button>
          <button type="button" class="btn-quitar-bandeja" data-accion="eliminar" data-nombre="${item.nombre}" title="Quitar plato" aria-label="Quitar ${item.nombre}">🗑️</button>
        </div>
      `;

      listaBandeja.append(li);
    });
  }

  const totalUnidades = window.bandejaPedido.reduce((acc, i) => acc + i.cantidad, 0);
  const totalMonto = window.bandejaPedido.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  if (bandejaContador) {
    bandejaContador.textContent = `${totalUnidades} ${totalUnidades === 1 ? "plato" : "platos"} en la bandeja`;
  }
  if (bandejaSubtotal) {
    bandejaSubtotal.textContent = `Subtotal bandeja: Bs ${totalMonto.toFixed(2)}`;
  }

  dibujarCanvasBandeja(false);

  if (typeof actualizarTotalPedido === "function") {
    actualizarTotalPedido();
  }
}

// ── 4. FUNCIONES DE CANVAS PARA DIBUJAR LA BANDEJA Y SUS PLATOS ─────────
function dibujarRectanguloRedondeado(contexto, x, y, ancho, alto, radio) {
  contexto.beginPath();
  contexto.moveTo(x + radio, y);
  contexto.lineTo(x + ancho - radio, y);
  contexto.quadraticCurveTo(x + ancho, y, x + ancho, y + radio);
  contexto.lineTo(x + ancho, y + alto - radio);
  contexto.quadraticCurveTo(x + ancho, y + alto, x + ancho - radio, y + alto);
  contexto.lineTo(x + radio, y + alto);
  contexto.quadraticCurveTo(x, y + alto, x, y + alto - radio);
  contexto.lineTo(x, y + radio);
  contexto.quadraticCurveTo(x, y, x + radio, y);
  contexto.closePath();
}

function dibujarCanvasBandeja(resaltadoArrastre = false) {
  if (!canvasBandeja || !ctxBandeja) return;

  const w = canvasBandeja.width;
  const h = canvasBandeja.height;
  ctxBandeja.clearRect(0, 0, w, h);
  posicionesPlatosCanvas = [];

  const estilo = getComputedStyle(document.body);
  const colorPrincipal = estilo.getPropertyValue("--color-principal").trim() || "#d35400";
  const colorSecundario = estilo.getPropertyValue("--color-secundario").trim() || "#e67e22";
  const colorTexto = estilo.getPropertyValue("--color-texto").trim() || "#2c3e50";
  const colorSuave = estilo.getPropertyValue("--color-suave").trim() || "#7f8c8d";
  const colorFondoTarjeta = estilo.getPropertyValue("--color-fondo-tarjeta").trim() || "#ffffff";
  const esOscuro = document.body.classList.contains("tema-oscuro");

  // 1. Dibujar asas laterales de la bandeja
  ctxBandeja.save();
  ctxBandeja.strokeStyle = colorPrincipal;
  ctxBandeja.lineWidth = 5;
  dibujarRectanguloRedondeado(ctxBandeja, 6, h / 2 - 36, 16, 72, 8);
  ctxBandeja.stroke();
  dibujarRectanguloRedondeado(ctxBandeja, w - 22, h / 2 - 36, 16, 72, 8);
  ctxBandeja.stroke();

  // 2. Cuerpo exterior de la bandeja
  dibujarRectanguloRedondeado(ctxBandeja, 18, 12, w - 36, h - 24, 18);
  ctxBandeja.fillStyle = esOscuro ? "#2c221e" : "#f3e5d8";
  ctxBandeja.fill();
  ctxBandeja.lineWidth = resaltadoArrastre ? 4 : 2.5;
  ctxBandeja.strokeStyle = resaltadoArrastre ? colorSecundario : colorPrincipal;
  ctxBandeja.stroke();

  // 3. Superficie interior de la bandeja
  dibujarRectanguloRedondeado(ctxBandeja, 30, 42, w - 60, h - 88, 12);
  ctxBandeja.fillStyle = esOscuro ? "#1f1916" : "#fffaf5";
  ctxBandeja.fill();
  ctxBandeja.strokeStyle = esOscuro ? "#44362f" : "#e2cbb5";
  ctxBandeja.lineWidth = 1.5;
  ctxBandeja.stroke();

  // 4. Encabezado dentro del Canvas
  ctxBandeja.fillStyle = colorPrincipal;
  ctxBandeja.font = "bold 13px system-ui, sans-serif";
  ctxBandeja.textAlign = "center";
  ctxBandeja.fillText("BANDEJA DE PEDIDO · ALITAS DEL SUR", w / 2, 31);

  // 5. Si la bandeja está vacía, mostrar mensaje guía
  if (window.bandejaPedido.length === 0) {
    ctxBandeja.fillStyle = resaltadoArrastre ? colorPrincipal : colorSuave;
    ctxBandeja.font = "bold 15px system-ui, sans-serif";
    ctxBandeja.fillText(
      resaltadoArrastre ? "¡Suelta el plato aquí para agregarlo!" : "Tu bandeja está vacía",
      w / 2,
      h / 2 - 6
    );
    ctxBandeja.font = "13px system-ui, sans-serif";
    ctxBandeja.fillText(
      "Arrastra los platos con sus imágenes desde la lista de la izquierda",
      w / 2,
      h / 2 + 18
    );
    ctxBandeja.restore();
    return;
  }

  // 6. Dibujar cada plato en la bandeja con su imagen circular, etiqueta y cantidad
  const items = window.bandejaPedido;
  const cols = Math.min(items.length, 4);
  const filas = Math.ceil(items.length / 4);
  const areaX = 36;
  const areaY = 46;
  const areaAncho = w - 72;
  const areaAlto = h - 96;

  const pasoX = areaAncho / cols;
  const pasoY = areaAlto / filas;
  const radioPlato = filas === 1 ? 34 : 25;

  items.forEach((item, index) => {
    const fila = Math.floor(index / 4);
    const col = index % 4;
    const colsEnEstaFila = fila === filas - 1 ? items.length - fila * 4 : cols;
    const pasoFilaX = areaAncho / colsEnEstaFila;

    const cx = areaX + pasoFilaX * (col + 0.5);
    const cy = areaY + pasoY * (fila + 0.43);

    posicionesPlatosCanvas.push({
      nombre: item.nombre,
      x: cx,
      y: cy,
      radio: radioPlato + 6,
    });

    // Borde del plato (cerámica)
    ctxBandeja.beginPath();
    ctxBandeja.arc(cx, cy, radioPlato + 5, 0, Math.PI * 2);
    ctxBandeja.fillStyle = colorFondoTarjeta;
    ctxBandeja.fill();
    ctxBandeja.lineWidth = 2;
    ctxBandeja.strokeStyle = colorPrincipal;
    ctxBandeja.stroke();

    // Imagen del plato recortada en círculo
    const imgObj = cacheImagenesPlatos[item.imagen];
    ctxBandeja.save();
    ctxBandeja.beginPath();
    ctxBandeja.arc(cx, cy, radioPlato, 0, Math.PI * 2);
    ctxBandeja.clip();

    if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
      ctxBandeja.drawImage(
        imgObj,
        cx - radioPlato,
        cy - radioPlato,
        radioPlato * 2,
        radioPlato * 2
      );
    } else {
      ctxBandeja.fillStyle = colorSecundario;
      ctxBandeja.fillRect(cx - radioPlato, cy - radioPlato, radioPlato * 2, radioPlato * 2);
    }
    ctxBandeja.restore();

    // Insignia con la cantidad (ej. x2)
    const badgeX = cx + radioPlato * 0.72;
    const badgeY = cy - radioPlato * 0.72;
    ctxBandeja.beginPath();
    ctxBandeja.arc(badgeX, badgeY, 12, 0, Math.PI * 2);
    ctxBandeja.fillStyle = colorPrincipal;
    ctxBandeja.fill();
    ctxBandeja.lineWidth = 1.5;
    ctxBandeja.strokeStyle = "#ffffff";
    ctxBandeja.stroke();

    ctxBandeja.fillStyle = "#ffffff";
    ctxBandeja.font = "bold 11px system-ui, sans-serif";
    ctxBandeja.textAlign = "center";
    ctxBandeja.textBaseline = "middle";
    ctxBandeja.fillText(`x${item.cantidad}`, badgeX, badgeY);

    // Nombre abreviado y subtotal debajo del plato
    ctxBandeja.textBaseline = "alphabetic";
    ctxBandeja.fillStyle = colorTexto;
    ctxBandeja.font = "bold 11px system-ui, sans-serif";
    const nombreCorto = item.nombre.length > 15 ? item.nombre.slice(0, 14) + "…" : item.nombre;
    ctxBandeja.fillText(nombreCorto, cx, cy + radioPlato + 16);

    ctxBandeja.fillStyle = colorPrincipal;
    ctxBandeja.font = "11px system-ui, sans-serif";
    ctxBandeja.fillText(`Bs ${(item.precio * item.cantidad).toFixed(0)}`, cx, cy + radioPlato + 29);
  });

  // 7. Barra inferior de resumen en el Canvas
  const totalUnidades = items.reduce((s, i) => s + i.cantidad, 0);
  const totalBs = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  ctxBandeja.fillStyle = colorTexto;
  ctxBandeja.font = "bold 12px system-ui, sans-serif";
  ctxBandeja.textAlign = "center";
  ctxBandeja.fillText(
    `Total en bandeja: ${totalUnidades} ${totalUnidades === 1 ? "plato" : "platos"} · Bs ${totalBs.toFixed(2)}`,
    w / 2,
    h - 21
  );

  ctxBandeja.restore();
}

// ── 5. EVENTOS DRAG & DROP Y CLICS DE LA BANDEJA ────────────────────────
if (catalogoBandeja) {
  catalogoBandeja.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".plato-arrastrable");
    if (!item) return;

    event.dataTransfer.setData("text/plain", JSON.stringify({
      tipo: "plato-bandeja",
      nombre: item.dataset.nombre,
      precio: Number(item.dataset.precio),
      imagen: item.dataset.imagen,
    }));

    event.dataTransfer.effectAllowed = "copyMove";
    item.classList.add("arrastrando");
  });

  catalogoBandeja.addEventListener("dragend", (event) => {
    const item = event.target.closest(".plato-arrastrable");
    if (item) item.classList.remove("arrastrando");
    if (cuadroBandeja) cuadroBandeja.classList.remove("encima");
    dibujarCanvasBandeja(false);
  });

  // Botón "+" para agregar haciendo clic (accesible y táctil)
  catalogoBandeja.addEventListener("click", (event) => {
    const boton = event.target.closest(".btn-agregar-mini");
    if (!boton) return;

    const item = boton.closest(".plato-arrastrable");
    if (!item) return;

    agregarPlatoABandeja({
      nombre: item.dataset.nombre,
      precio: Number(item.dataset.precio),
      imagen: item.dataset.imagen,
    }, 1);
  });
}

if (cuadroBandeja) {
  cuadroBandeja.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (!cuadroBandeja.classList.contains("encima")) {
      cuadroBandeja.classList.add("encima");
      dibujarCanvasBandeja(true);
    }
  });

  cuadroBandeja.addEventListener("dragleave", (event) => {
    if (!cuadroBandeja.contains(event.relatedTarget)) {
      cuadroBandeja.classList.remove("encima");
      dibujarCanvasBandeja(false);
    }
  });

  cuadroBandeja.addEventListener("drop", (event) => {
    event.preventDefault();
    cuadroBandeja.classList.remove("encima");

    try {
      const datos = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (datos && datos.nombre) {
        // Si proviene del catálogo de platos o incluso de una ficha del tablero
        const catalogo = obtenerPlatosCatalogo();
        const coincidencia = catalogo.find(p => p.nombre === datos.nombre);
        agregarPlatoABandeja({
          nombre: datos.nombre,
          precio: datos.precio || (coincidencia ? coincidencia.precio : 20),
          imagen: datos.imagen || (coincidencia ? coincidencia.imagen : "platos.jpg"),
        }, 1);
      }
    } catch (err) {
      console.warn("No se pudo interpretar el plato soltado en la bandeja:", err);
      dibujarCanvasBandeja(false);
    }
  });
}

if (listaBandeja) {
  listaBandeja.addEventListener("click", (event) => {
    const boton = event.target.closest("button[data-accion]");
    if (!boton) return;

    const { accion, nombre } = boton.dataset;
    if (accion === "sumar") cambiarCantidadBandeja(nombre, 1);
    if (accion === "restar") cambiarCantidadBandeja(nombre, -1);
    if (accion === "eliminar") eliminarPlatoDeBandeja(nombre);
  });
}

if (btnVaciarBandeja) {
  btnVaciarBandeja.addEventListener("click", vaciarBandeja);
}

// Clic directo sobre un plato dibujado en el Canvas de la bandeja para restar 1 unidad
if (canvasBandeja) {
  canvasBandeja.addEventListener("click", (event) => {
    if (posicionesPlatosCanvas.length === 0) return;

    const rect = canvasBandeja.getBoundingClientRect();
    const escalaX = canvasBandeja.width / rect.width;
    const escalaY = canvasBandeja.height / rect.height;
    const clickX = (event.clientX - rect.left) * escalaX;
    const clickY = (event.clientY - rect.top) * escalaY;

    const platoTocado = posicionesPlatosCanvas.find(
      p => Math.hypot(clickX - p.x, clickY - p.y) <= p.radio
    );

    if (platoTocado) {
      cambiarCantidadBandeja(platoTocado.nombre, -1);
    }
  });
}

// Redibujar los lienzos Canvas cuando el usuario cambie entre modo claro y oscuro
["#tema-toggle", "#header-tema-toggle", "#olvidar"].forEach((selector) => {
  document.querySelector(selector)?.addEventListener("click", () => {
    requestAnimationFrame(() => {
      dibujarGrafico();
      dibujarCanvasBandeja(false);
    });
  });
});

// Inicialización
precargarImagenesBandeja();
renderCatalogoBandeja();
renderBandeja();
renderTablero();
