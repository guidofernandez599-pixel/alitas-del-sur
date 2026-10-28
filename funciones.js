// ── 1. COERCIÓN DE TIPOS ────────────────────────────────────────────────
console.log("20" + 2); // "202"
console.log("20" - 2); // 18

console.log(Number("20") + 2); // 22

// ── 2. VALORES FALSY ────────────────────────────────────────────────────
console.log(Boolean(0), Boolean(""), Boolean("0"), Boolean([]));

// ── 3. CONTROL DE FLUJO ─────────────────────────────────────────────────
let stockAlitas = 25;

if (stockAlitas > 0) {
  console.log("Hay raciones de alitas disponibles");
} else {
  console.log("Alitas agotadas por el día");
}

const estadoStock = stockAlitas > 0 ? "Disponible" : "Agotado";
console.log("Estado de alitas:", estadoStock);

const preciosPlatos = [20, 22, 25, 30, 35];
for (const precio of preciosPlatos) {
  console.log("Precio del plato: Bs", precio);
}

// ── 4. FUNCIONES DE CÁLCULO DE PEDIDOS ──────────────────────────────────
function totalDeclarada(precio, cantidad) {
  return precio * cantidad;
}

const totalExpresion = function (precio, cantidad) {
  return precio * cantidad;
};

const calcularTotal = (precio, cantidad) => precio * cantidad;

console.log("Cálculo de pedido (3 Sajtas): Bs", calcularTotal(20, 3));

// ── 5. FUNCIONES FLECHA CON DESCUENTOS Y DELIVERIES ──────────────────────
const dobleRacion = (n) => n * 2;

const aplicarDescuentoEspecial = (total, porcentaje) => {
  const descuento = total * (porcentaje / 100);
  return total - descuento;
};

const conRecargoDelivery = (monto, recargo = 5) => monto + recargo;

console.log("Pedido con descuento: Bs", aplicarDescuentoEspecial(100, 10));
console.log("Pedido con envío: Bs", conRecargoDelivery(50).toFixed(2));

// ── 6. FUNCIONES COMO PARÁMETROS ────────────────────────────────────────
const operacionPedido = calcularTotal;
console.log("Total por 2 platillos extra: Bs", operacionPedido(30, 2));

function aplicarAConvertidor(lista, fn) {
  const salida = [];
  for (const elemento of lista) {
    salida.push(fn(elemento));
  }
  return salida;
}

console.log(aplicarAConvertidor(preciosPlatos, p => `Bs ${p}.00`));

// ── 7. SCOPE Y CLOSURE (CONTADOR DE PEDIDOS Y MESAS) ────────────────────
function crearContadorDePlatos() {
  let contador = 0;
  return () => {
    contador += 1;
    return contador;
  };
}

const sajtasVendidas = crearContadorDePlatos();
console.log("Sajtas vendidas hoy:", sajtasVendidas(), sajtasVendidas(), sajtasVendidas());

const alitasVendidas = crearContadorDePlatos();
console.log("Porciones de alitas vendidas hoy:", alitasVendidas());