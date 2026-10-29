# Alitas del Sur

**Estudiante:** Evelyn Sharon Paucara Pacheco
**Cliente:** Silviana Pacheco
**URL publicada:** [DESPUES, PROXIMA SEMANA]

## Qué resuelve
Este sitio web soluciona la necesidad de marketing para el restaurante "Alitas del Sur", permitiendo a los clientes  conocer el menú de platos típicos nacionales (como sajta, silpancho, plato paceño y chicharrón), consultar horarios, precios y promociones vigentes. Además, cuenta con un formulario interactivo para que los usuarios puedan realizar sus pedidos de forma rápida y directa desde cualquier dispositivo.

## Cómo está construido
- **Semántica:** Utilice en la página etiquetas semánticas de HTML5 para dar orden y accesibilidad al sitio del restaurante: usé header para la cabecera y la navegación nav, main para el núcleo de la página y section para dividir temas principales como el menú, promociones, horarios y pedidos. Cada plato y promoción se encapsuló en un article independiente, los precios y la imagen destacada se organizaron con table y figure, el formulario agrupó los campos en fieldset con sus respetivas label, y reservé un aside para una nota complementaria y un footer con la etiqueta address para la información de contacto físico de la tienda.
- **Layout:** puse flex box para el encabezado dellogo y el menu  queden en un solo lado, y en la parte de los platos use grid para organizar las fotos de la comida,
- **Diseño:** escogi colores claros y vivos para que se vea alegre y una letra sencilla para que se visualice bien.

## Capturas
![Escritorio]  (![alt text](capura-restaurante.png))
![Móvil 375px] (ruta/a/captura-movil.png) DESPUES, PROXIMA SEMANA

## Lo más difícil
al rpincipio el logo aparecia abajo de la pagina y el menu se desordenaba en el celular, lo resolvi revisando que la imagen estuviera dentro del header y agrege Flex-wrap para que los enlaces bajen en linea cuando la pantalla es pequeña, tambien tuve la dificultad de mantener los nombres y precios y botones de los productos alieandos para solucionarlo ajuste los margenes el espacio y la distribucion de los elementos con CSS. 

## Laboratorio 3
En esta etapa se incorporó interactividad avanzada al sitio mediante JavaScript moderno, jQuery y APIs del navegador: se implementó el renderizado dinámico del menú con buscador en tiempo real y filtros por categoría, un panel interactivo con efectos de jQuery (menú móvil desplegable, acordeón y avisos escalonados), carga asíncrona del catálogo desde `datos.json` usando `fetch` (`async/await`) y `$.getJSON`, además de persistencia de preferencias (modo oscuro y ordenamiento) con `localStorage` y cálculo de distancia al restaurante con la API de Geolocalización.

Asimismo, se integró la API de Drag & Drop junto con HTML5 Canvas en dos módulos: un tablero de planificación diaria de cocina que actualiza en vivo un gráfico de barras en Canvas según las raciones por columna, y una bandeja interactiva de pedidos donde el cliente puede arrastrar varios platos con sus pequeñas imágenes para armar un pedido múltiple, dibujando dinámicamente los platos sobre la bandeja en Canvas, el gráfico de subtotales y el cálculo automático del total a pagar en el formulario.
