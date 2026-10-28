// ── 1. localStorage Y sessionStorage ────────────────────────────────────
const CLAVE = "alitasdelsur:preferencias";

const PREFERENCIAS_POR_DEFECTO = { tema: "claro", orden: "nombre" };

// ── 2. LEER CON try/catch ───────────────────────────────────────────────
function leerPreferencias() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return { ...PREFERENCIAS_POR_DEFECTO };

    const guardado = JSON.parse(texto);
    return { ...PREFERENCIAS_POR_DEFECTO, ...guardado };
  } catch (error) {
    console.warn("Preferencias corruptas, se usan las por defecto:", error.message);
    return { ...PREFERENCIAS_POR_DEFECTO };
  }
}

function guardarPreferencias(prefs) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.warn("No se pudo guardar:", error.message);
    return false;
  }
}

// ── 3. APLICAR LO GUARDADO AL CARGAR ────────────────────────────────────
let preferencias = leerPreferencias();

function aplicarPreferencias() {
  document.body.classList.toggle("tema-oscuro", preferencias.tema === "oscuro");

  const oscuro = preferencias.tema === "oscuro";
  const boton = document.querySelector("#tema-toggle");
  const botonCabecera = document.querySelector("#header-tema-toggle");
  [boton, botonCabecera].filter(Boolean).forEach((control) => {
    control.setAttribute("aria-pressed", String(oscuro));
    control.textContent = oscuro ? "☀️ Modo claro" : "🌙 Modo oscuro";
  });

  const orden = document.querySelector("#orden");
  if (orden) orden.value = preferencias.orden;

  const estado = document.querySelector("#estado-prefs");
  if (estado) estado.textContent = `Tema ${preferencias.tema}, ordenado por ${preferencias.orden}.`;
}

aplicarPreferencias();

// ── 4. GUARDAR AL CAMBIAR ───────────────────────────────────────────────
function alternarTema() {
  preferencias.tema = preferencias.tema === "oscuro" ? "claro" : "oscuro";
  guardarPreferencias(preferencias);
  aplicarPreferencias();
}
document.querySelector("#tema-toggle")?.addEventListener("click", alternarTema);
document.querySelector("#header-tema-toggle")?.addEventListener("click", alternarTema);

document.querySelector("#orden")?.addEventListener("change", (event) => {
  preferencias.orden = event.target.value;
  guardarPreferencias(preferencias);
  aplicarPreferencias();
  if (typeof actualizar === "function") actualizar();
});

document.querySelector("#olvidar")?.addEventListener("click", () => {
  localStorage.removeItem(CLAVE);
  preferencias = { ...PREFERENCIAS_POR_DEFECTO };
  aplicarPreferencias();
  document.querySelector("#estado-prefs").textContent = "Preferencias olvidadas.";
});

// ── 5. GEOLOCATION ──────────────────────────────────────────────────────
const LOCAL = { lat: -16.5000, lng: -68.1500 }; // Referencia aproximada en La Paz / Achumani, Bolivia

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const aRad = (g) => (g * Math.PI) / 180;
  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const $ubic = document.querySelector("#estado-ubicacion");

document.querySelector("#ubicarme")?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    if ($ubic) {
      $ubic.textContent = "Tu navegador no permite compartir la ubicación.";
      $ubic.className = "error";
    }
    return;
  }

  if ($ubic) {
    $ubic.textContent = "Pidiendo permiso...";
    $ubic.className = "cargando";
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const km = distanciaKm(latitude, longitude, LOCAL.lat, LOCAL.lng);
      if ($ubic) {
        $ubic.textContent = `Estás a ${km.toFixed(1)} km del restaurante (precisión: ${Math.round(accuracy)} m).`;
        $ubic.className = "ok";
      }
    },
    (error) => {
      const mensajes = {
        [error.PERMISSION_DENIED]: "No diste permiso. Puedes seguir haciendo tu pedido igual.",
        [error.POSITION_UNAVAILABLE]: "No se pudo determinar tu ubicación.",
        [error.TIMEOUT]: "Tardó demasiado. Intenta de nuevo.",
      };
      if ($ubic) {
        $ubic.textContent = mensajes[error.code] || "No se pudo obtener la ubicación.";
        $ubic.className = "error";
      }
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});