// ── 1. SELECTORES DEL DOM PARA CARGA REMOTA ─────────────────────────────
const $estado = document.querySelector("#estado");
const listaRemota = document.querySelector("#lista-remota");

// ── 2. JSON: PARSEO Y SERIALIZACIÓN ─────────────────────────────────────
// Ejemplo contextualizado con un producto representativo de Alitas del Sur
const textoJson = '{"nombre":"Porción de Alitas BBQ","precio":20.00,"unidad":"porción","disponible":true}';
const objeto = JSON.parse(textoJson);
console.log("Plato parseado desde JSON:", objeto.nombre, "- Precio: Bs", objeto.precio);
console.log("Convertido de vuelta a JSON (serializado):", JSON.stringify(objeto));

// ── 3. GESTIÓN DE LOS TRES ESTADOS DE PETICIÓN (cargando, ok, error) ─────
function mostrarEstado(texto, tipo = "info") {
  if (!$estado) return;
  $estado.textContent = texto;
  $estado.className = tipo;
}

// ── 4. FUNCIÓN PARA PINTAR PLATOS DEL CATÁLOGO REMOTO ───────────────────
function pintarRemoto(productos) {
  if (!listaRemota) return;
  listaRemota.innerHTML = "";

  productos.forEach(p => {
    const art = document.createElement("article");
    art.classList.add("tarjeta");

    // Marca como agotado si no está disponible o el stock es cero
    if (!p.disponible || p.stock <= 0) {
      art.classList.add("agotado");
    }

    let imagenUrl = p.imagen || "alitas.jpg";
    if (!imagenUrl.startsWith("imagenes/") && !imagenUrl.startsWith("http")) {
      imagenUrl = `imagenes/${imagenUrl}`;
    }
    const categoriaHtml = p.categoria ? `<p class="categoria"><strong>Categoría:</strong> ${p.categoria}</p>` : "";
    const proveedorHtml = p.proveedor ? `<p class="stock" style="font-size:0.8rem; color:var(--color-suave)">🏢 Proveedor local: ${p.proveedor}</p>` : "";

    art.innerHTML = `
      <img src="${imagenUrl}" alt="${p.nombre}" onerror="this.src='alitas.jpg'">
      <h3>${p.nombre}</h3>
      <p class="precio">Bs ${p.precio.toFixed(2)} <span style="font-size:0.85rem; font-weight:normal; color:var(--color-suave)">/ ${p.unidad || "porción"}</span></p>
      ${categoriaHtml}
      <p class="stock">${p.disponible && p.stock > 0 ? `✅ ${p.stock} porciones disponibles` : "⚠️ Agotado por el momento"}</p>
      ${proveedorHtml}
    `;

    listaRemota.append(art);
  });
}

// ── 5. CARGA ASÍNCRONA CON FETCH Y ASYNC/AWAIT ───────────────────────────
async function cargarConFetch(url = "datos.json") {
  mostrarEstado("Cargando menú de Alitas del Sur desde el servidor...", "cargando");

  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con código de error HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    pintarRemoto(datos.productos);

    mostrarEstado(`✅ Se cargaron exitosamente ${datos.productos.length} platos y combos de ${datos.negocio.nombre}`, "ok");

  } catch (error) {
    mostrarEstado(`No se pudieron cargar los datos remotos. ${error.message}`, "error");
    if (listaRemota) listaRemota.innerHTML = "";
  }
}

// Listeners con Fetch nativo
const btnFetch = document.querySelector("#cargar-fetch");
if (btnFetch) {
  btnFetch.addEventListener("click", () => cargarConFetch("datos.json"));
}

const btnRoto = document.querySelector("#cargar-roto");
if (btnRoto) {
  btnRoto.addEventListener("click", () => cargarConFetch("no-existe.json"));
}

// ── 6. CARGA ASÍNCRONA CON jQUERY ($.getJSON) ───────────────────────────
const $btnJquery = $("#cargar-jquery");
if ($btnJquery.length) {
  $btnJquery.on("click", function () {
    mostrarEstado("Cargando menú con jQuery...", "cargando");

    $.getJSON("datos.json")
      .done(function (datos) {
        pintarRemoto(datos.productos);
        mostrarEstado(`✅ Se cargaron ${datos.productos.length} platos de ${datos.negocio.nombre} (mediante jQuery)`, "ok");
      })
      .fail(function (jqXHR) {
        mostrarEstado(`Falló la petición con jQuery: Código HTTP ${jqXHR.status}`, "error");
        if (listaRemota) listaRemota.innerHTML = "";
      })
      .always(function () {
        console.log("Petición remota de Alitas del Sur finalizada.");
      });
  });
}