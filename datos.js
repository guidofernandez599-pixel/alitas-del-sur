// ── 1. OBJETO LITERAL ───────────────────────────────────────────────────
const platoDelDia = {
  nombre: "Sajta de Pollo",
  precio: 20.0,
  categoria: "platos",
  stock: 25,
  disponible: true,
};

console.log(platoDelDia.nombre);

const propiedad = "precio";
console.log(platoDelDia[propiedad]);

platoDelDia.stock = 20;

// ── 2. DESTRUCTURING ────────────────────────────────────────────────────
const { nombre, precio } = platoDelDia;
console.log(`${nombre} cuesta Bs ${precio}`);

const platoEspecial = { ...platoDelDia, precio: 25.0, nombre: "Sajta Especial" };
console.log(platoEspecial);

// ── 3. ARREGLO DE OBJETOS (MENÚ DEL RESTAURANTE) ─────────────────────────
// ── ARREGLO DE OBJETOS (MENÚ CON IMÁGENES) ──────────────────────────────
const productos = [
  { nombre: "Sajta de Pollo",    precio: 20.0, categoria: "nacionales", stock: 20, disponible: true,  imagen: "sajta.jpg",        descripcion: "Pollo jugoso con salsa de ají amarillo, chuño rebosado y papa." },
  { nombre: "Silpancho",         precio: 22.0, categoria: "nacionales", stock: 15, disponible: true,  imagen: "silpancho.jpg",    descripcion: "Carne apanada crujiente sobre arroz, papas doradas y huevo frito." },
  { nombre: "Plato Paceño",      precio: 25.0, categoria: "nacionales", stock: 10, disponible: true,  imagen: "platopaceno.jpg",  descripcion: "Choclo tierno con queso frito, habas, papa y carne asada." },
  { nombre: "Trucha Frita",      precio: 30.0, categoria: "pescados",   stock: 8,  disponible: true,  imagen: "trucha.jpg",       descripcion: "Trucha fresca del lago dorada, servida con mote, chuño y papa." },
  { nombre: "Chicharron",        precio: 35.0, categoria: "extras",     stock: 0,  disponible: false, imagen: "chicharron.jpg",   descripcion: "Costillas de cerdo crujientes en perol con mote y chuño." },
  { nombre: "Porción de Alitas", precio: 20.0, categoria: "alitas",     stock: 30, disponible: true,  imagen: "alitas.jpg",       descripcion: "Alitas crocantes y doradas acompañadas de papas fritas y salsas." },
  { nombre: "Combo Familiar",    precio: 85.0, categoria: "combos",     stock: 5,  disponible: true,  imagen: "platos.jpg",       descripcion: "Bandeja surtida para toda la familia con bebida de cortesía." }
];

// ── 4. MÉTODOS DE ARREGLOS ──────────────────────────────────────────────
productos.forEach(p => console.log(p.nombre));

const nombres = productos.map(p => p.nombre);
console.log(nombres);

const disponibles = productos.filter(p => p.disponible);
console.log(disponibles.length, "de", productos.length, "platos disponibles");

const platoCaro = productos.find(p => p.precio > 30);
console.log(platoCaro);

console.log(nombres.includes("Silpancho"));
console.log(productos.some(p => p.stock === 0));
console.log(productos.every(p => p.precio > 0));

const porPrecio = [...productos].sort((a, b) => a.precio - b.precio);
console.log(porPrecio.map(p => p.nombre));

const valorInventario = productos.reduce((acumulador, p) => acumulador + p.precio * p.stock, 0);
console.log("Valor estimado del menú en stock: Bs", valorInventario.toFixed(2));

// ── 5. ENCADENAR MÉTODOS ────────────────────────────────────────────────
const nombresDisponibles = productos
  .filter(p => p.disponible)
  .map(p => p.nombre);
console.log(nombresDisponibles);

const totalNacionalesEnStock = productos
  .filter(p => p.categoria === "nacionales" && p.disponible)
  .reduce((total, p) => total + p.precio * p.stock, 0);
console.log("Platos nacionales en stock: Bs", totalNacionalesEnStock.toFixed(2));

const porCategoria = productos.reduce((grupos, p) => {
  if (!grupos[p.categoria]) grupos[p.categoria] = [];
  grupos[p.categoria].push(p.nombre);
  return grupos;
}, {});
console.log(porCategoria);

// ── 6. CLASES Y POO ─────────────────────────────────────────────────────
class Plato {
  constructor(nombre, precio, stock) {
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  estaDisponible() {
    return this.stock > 0;
  }

  valorEnStock() {
    return this.precio * this.stock;
  }
}

const silpancho = new Plato("Silpancho", 22.0, 15);
console.log(silpancho.nombre, silpancho.estaDisponible(), silpancho.valorEnStock());

class PlatoConDescuento extends Plato {
  constructor(nombre, precio, stock, descuento) {
    super(nombre, precio, stock);
    this.descuento = descuento;
  }

  precioFinal() {
    return this.precio * (1 - this.descuento / 100);
  }
}

const comboPromocional = new PlatoConDescuento("Combo Familiar", 85.0, 5, 10);
console.log("Precio promocional:", comboPromocional.precioFinal(), "Disponible:", comboPromocional.estaDisponible());