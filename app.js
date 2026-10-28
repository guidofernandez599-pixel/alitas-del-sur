/* ═════════════════════════════════════════════════════════════════════════
   CONFIGURACIÓN GENERAL DEL RESTAURANTE - Alitas del Sur
   ═════════════════════════════════════════════════════════════════════════ */

const negocio = "Alitas del Sur";
const anioFundacion = 2020;

// ── 2. VARIABLES DE INVENTARIO DIARIO ────────────────────────────────────

let racionesSajta = 20;
racionesSajta = 18;                   

let racionesSilpancho = 15;
racionesSilpancho = 12; 

let porcionesAlitas = 30;
porcionesAlitas = 25; 

let racionesTrucha = 10;
racionesTrucha = 8; 

let racionesChicharron = 5;
racionesChicharron = 0; // Agotado

// ── 3. TIPOS DE DATOS ────────────────────────────────────────────────────

const precioSajta = 20.0;                 // number
const precioSilpancho = 22.0;             // number
const precioAlitas = 20.0;                // number
const precioTrucha = 30.0;                // number
const abiertoHoy = true;                  // boolean
const promoMiercoles2x1 = null;           // null: reservado para promoción
let telefonoContacto;                     // undefined

console.log("Tipos de datos:", typeof negocio, typeof precioSajta, typeof abiertoHoy);
console.log("Promo actual:", promoMiercoles2x1, "| Teléfono sin asignar:", telefonoContacto);

// ── 4. TEMPLATE LITERAL ─────────────────────────────────────────────────

const resumen = `${negocio} atiende desde ${anioFundacion}. Hoy nos quedan ${racionesSajta} raciones de Sajta, ${racionesSilpancho} de Silpancho y ${porcionesAlitas} porciones de Alitas.`;
console.log(resumen);

// ── 5. COMPARACIÓN ──────────────────────────────────────────────────────

console.log("18" == racionesSajta);   // true (coerción de tipo)
console.log("18" === racionesSajta);  // false (comparación estricta)

// ── 6. ACTUALIZAR ENCABEZADO ────────────────────────────────────────────

const subtitulo = document.querySelector("header p");
if (subtitulo) {
  subtitulo.textContent = `¡Hoy tenemos ${porcionesAlitas} porciones de alitas disponibles!`;
}