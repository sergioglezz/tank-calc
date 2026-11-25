# Feature 004: Interfaz de la calculadora y los coches

> **Estado:** implementada y publicada el 25/11/2026 en https://tank-calc-tau.vercel.app/; quedan CA15, CA35 y CA36 (probar en móviles reales y Lighthouse) y CA37 (comprobar la publicación automática tras un merge a `main`). Ver [plan.md](plan.md), sección 9.
> Primera de las dos specs de interfaz. Esta cubre la calculadora, la elección de coche y la publicación; la **005** cubrirá el historial (guardar un repostaje, la pantalla «Historial», borrar repostajes) y cerrará el MVP.

## Resumen y objetivo
La primera interfaz de tank-calc, construida sobre la lógica ya terminada de las features [001](../001-calculadora/spec.md) (calculadora) y [002](../002-coches/spec.md) (coches). El usuario puede, desde el móvil:
- elegir su coche de la lista o añadir el suyo, y borrar los que añadió;
- escribir el nivel actual y el precio por litro, elegir uno de los tres modos y ver al momento cuánto pedir en caja;
- volver otro día y encontrarse su coche y su último precio.

La app se publica en una URL pública que se actualiza sola con cada cambio en `main`.

La interfaz no hace cálculos propios: las cifras, las reglas de validación, los mensajes de error y los formatos son los de las specs 001 y 002. Si el mockup no coincide con ellas, mandan las specs.

**Diseño de referencia:** las capturas de [docs/design/](../../docs/design/) (01–05 y 07–10) y el [prototipo de Figma](https://www.figma.com/proto/hAq16LKqkVc1jL0ss69W8K/Tank-calc?node-id=0-1). Son una guía y no hay que calcarlas al píxel. De ellas se toman el estilo (fondo claro, tarjeta de resultado en verde oscuro con cifras en verde lima, botón principal lima, tarjetas blancas redondeadas, tipografía sin serifa en negrita para los títulos), la estructura de cada pantalla y la navegación. Las capturas 06, 11 y 12 son de la feature 005.

Los textos secundarios de las capturas que no cambian el comportamiento se toman del mockup: la cabecera «tank-calc» con la etiqueta «Reposta con cabeza»; en la bienvenida, «Antes de pasar por caja», «Calcula cuánto pedir en la gasolinera, sin hacer cuentas de cabeza.», «Empieza en tres pasos» y la descripción de cada paso; en «Elige tu coche», el subtítulo «La capacidad nos ayuda a hacer los cálculos.»; y en «Añadir mi coche», «Ponle un nombre y consulta los litros en el manual de tu coche.». Los textos de los criterios de aceptación mandan sobre el mockup.

## Historias de usuario
- Como conductor en la gasolinera quiero ver **cuánto pedir en caja** nada más escribir el nivel y el precio, sin pulsar ningún botón.
- Como conductor quiero **elegir mi coche** una vez y no tener que saber la capacidad de su depósito.
- Como conductor cuyo coche no está en la lista quiero **añadirlo** y **borrarlo** si me equivoco.
- Como conductor quiero que se me diga **qué dato está mal** en cuanto lo escribo, y que el aviso desaparezca cuando lo corrijo.
- Como conductor quiero usar la app **con una mano en el móvil**, con el teclado adecuado en cada campo.
- Como autor quiero que la app esté **publicada en una URL pública** para enseñarla en mi CV.

## Criterios de aceptación

### Primera visita y coche seleccionado
- CA1: Sin coche seleccionado (primera visita, coche propio borrado o coche guardado que ya no existe; CA15 y CA21 de la 002), la pantalla «Calculadora» muestra la bienvenida de la captura 07. Tiene una tarjeta «Solo paga lo que cabe.» con el botón «Elegir coche», los tres pasos («Elige tu coche», «Indica nivel y precio», «Mira cuánto pedir») y el aviso «Tu cálculo aparecerá aquí», con el texto «Elige un coche para empezar.». No se muestran los campos ni los modos.
- CA2: Con un coche seleccionado, la calculadora muestra arriba la tarjeta «Tu coche» con su nombre (CA4 de la 002) y su capacidad (p. ej. «Seat Ibiza · 40 l») y el botón «Cambiar», que abre «Elige tu coche».

### Calculadora
- CA3: La calculadora tiene, en este orden, el campo **Nivel actual (%)** con tres botones rápidos («25 %», «50 %», «75 %») que lo rellenan, el campo **Precio por litro (€/l)**, el selector de modo («A tope», «Hasta X %», «Tengo X €») y, según el modo, el campo **% objetivo** o **Euros que tienes**. Debajo está la tarjeta de resultado.
- CA4: Al abrir la app, el modo es «A tope», el nivel y los campos de cada modo están vacíos, y el precio aparece relleno con el último precio recordado, escrito como dice CA19 de la 002 (p. ej. «1,579»). Si no hay ninguno recordado, está vacío.
- CA5: Al cambiar de modo se conservan los valores de todos los campos, también los de los otros modos, mientras la app siga abierta.
- CA6: El resultado se recalcula **en cuanto cambia cualquier dato** (cada tecla, botón rápido, cambio de modo o de coche), sin botón de calcular.

### Tarjeta de resultado
- CA7: La tarjeta muestra, según el estado del cálculo, estos textos. Las cifras salen de la 001 con su formato (CA18). Los ejemplos usan 50 l, 25 % y 1,579 €/l:

| Estado | Etiqueta | Texto principal | Detalle |
|---|---|---|---|
| «A tope» | PARA LLENAR EL DEPÓSITO | Pide 59 € | 37 l · el depósito queda al 99 %. Redondeado a la baja para no pasarte. |
| «Hasta X %» (75 %) | PARA LLEGAR AL 75 % | Pide 39 € | 24 l · el depósito queda al 74 %. Redondeado a la baja para no pasarte. |
| «Tengo X €» sin sobrante (30 €) | CON 30 € PUEDES AÑADIR | 18 l | Pide 30 € · el depósito queda al 62 %. |
| «Tengo X €» con sobrante (80 €) | CON 80 € TE SOBRA | Pide 59 € | Llenas el depósito: 37 l · te sobran 21 €. |
| Depósito lleno | TODO LISTO | Tu depósito ya está lleno | No necesitas añadir gasolina. |
| Menos de 1 € | CASI LLENO | Falta menos de 1 € | Lo que cabe cuesta menos de 1 €. |
| Datos incompletos o no válidos | FALTA UN PASO | Revisa los datos | Completa o corrige los campos para calcular. |

- CA8: Con el nivel actual al 100 % (válido), la tarjeta muestra «Tu depósito ya está lleno» en los tres modos, aunque el precio, el objetivo o el dinero estén vacíos o no sean válidos (CA16 de la 001).
- CA9: Cuando cambia el resultado, un lector de pantalla lo anuncia sin que el usuario tenga que buscarlo.

### Errores en los campos
- CA10: Un campo no muestra ningún error mientras el usuario no haya salido de él al menos una vez (o pulsado un botón rápido, en el caso del nivel).
- CA11: Al salir de un campo con un dato vacío o no válido, aparece debajo el mensaje de la 001 o la 002 para ese caso y el campo se marca en rojo (captura 08).
- CA12: Si un campo ya muestra un error, al escribir se vuelve a comprobar en cada tecla: el error **desaparece en cuanto el dato es válido** y el mensaje cambia si cambia el motivo.
- CA13: El error del objetivo se vuelve a comprobar también cuando cambia el nivel actual. Si el nivel actual no es válido, el objetivo solo se comprueba con su propia regla, como dice la 001 (no como en la captura 08).
- CA14: Solo se muestran los errores de los campos visibles: el del objetivo o el del dinero se ocultan al cambiar a un modo que no los usa, y vuelven si se regresa a ese modo y siguen sin ser válidos.

### Teclado y entrada en el móvil
- CA15: Los campos de números enteros (nivel actual, % objetivo, euros que tienes y capacidad) abren en el móvil el **teclado numérico sin separador decimal**, y el precio abre el **teclado numérico con separador decimal**.
- CA16: Los campos enteros **solo admiten cifras**: cualquier otro carácter, escrito o pegado, se descarta al instante. Así, «1.000» en «Euros que tienes» se queda en «1000» y nunca se lee como 1 € (pendiente de la 001, plan, sección 9.7).

### Recordar el precio
- CA17: El precio se recuerda (CA17–CA18 de la 002) cada vez que el valor del campo es válido, sin esperar a salir de él; un precio no válido no sustituye al último recordado.

### Elige tu coche (capturas 04 y 05)
- CA18: «Elige tu coche» tiene un botón «Volver» a la calculadora, el buscador «Busca marca o modelo», la sección **Mis coches** con los coches propios y la sección **Explorar modelos** con los de la lista, ambos en el orden de CA9 de la 002, y el botón «+ Añadir mi coche». Al final aparece la nota «La capacidad puede variar según el año y la versión. Compruébala en el manual de tu coche.».
- CA19: Cada fila muestra el nombre del coche (CA4 de la 002) y su capacidad (p. ej. «40 l»). El coche seleccionado aparece marcado con «Seleccionado» y un ✓, y los propios con «Añadido por ti».
- CA20: Al tocar un coche, queda seleccionado y se vuelve a la calculadora, que recalcula con su capacidad.
- CA21: La búsqueda filtra **mientras se escribe**, con las reglas de CA5–CA8 de la 002. Una sección sin resultados no se muestra.
- CA22: Si ningún coche coincide, aparece «No hay coches que coincidan con «texto».» y el botón «+ Añadir mi coche» sigue visible.
- CA23: Cada coche propio tiene un botón «Borrar». Al pulsarlo se pide confirmación («¿Borrar «Mi furgoneta»?» con «Borrar» y «Cancelar»), en el mismo estilo de la app. Si se confirma, se borra (CA15 de la 002). Si era el seleccionado, la calculadora vuelve a la bienvenida (CA1). Los coches de la lista no tienen ese botón.

### Añadir mi coche (captura 05)
- CA24: «+ Añadir mi coche» abre una hoja desde abajo con «Nombre» (ejemplo «Ej. Coche de casa»), «Capacidad del depósito (l)» (ejemplo «Ej. 50») y los botones «Guardar» y «Cancelar».
- CA25: Los errores de la hoja siguen CA10–CA12. Al pulsar «Guardar» con datos no válidos, aparecen a la vez todos los errores (CA13 de la 002) y el coche no se añade.
- CA26: Al guardar un coche válido, se añade, **queda seleccionado**, se cierra la hoja y se vuelve a la calculadora.
- CA27: Con 10 coches propios, la hoja muestra «Ya tienes 10 coches guardados. Borra uno para añadir otro.» en lugar de los campos, con un solo botón «Cerrar» (CA14 de la 002).
- CA28: «Cancelar», la tecla Escape o tocar fuera de la hoja la cierran sin añadir nada.

### Aviso de que no se ha podido guardar
- CA29: Si no se puede guardar el coche, los coches propios o el precio (CA23 de la 002), aparece arriba el aviso «No se han podido guardar tus datos en este dispositivo. Se mantendrán hasta que cierres la app.». La app sigue funcionando con el cambio hecho, y el aviso desaparece cuando un guardado posterior funciona.

### Móvil, idioma y accesibilidad
- CA30: A 360 px de ancho, ninguna pantalla ni la hoja tienen desplazamiento horizontal, ni siquiera con un nombre de coche de 40 caracteres. En pantallas más anchas, el contenido se muestra en una columna centrada del ancho de un móvil.
- CA31: Todos los textos de la interfaz están en español, y la página declara el español como idioma.
- CA32: Cada campo tiene una etiqueta visible asociada. Un lector de pantalla lee el mensaje de error junto al campo y sabe que el campo no es válido.
- CA33: Todo se puede usar solo con el teclado, en un orden lógico y con el foco siempre visible. Al abrirse la hoja o la confirmación de borrado, el foco pasa a ellas, y al cerrarse vuelve al botón que las abrió.
- CA34: Los botones y las filas que se pueden tocar miden como mínimo 44 × 44 px. El selector de modo indica a un lector de pantalla qué modo está activo.
- CA35: El contraste de los textos cumple el nivel AA de WCAG (4,5:1 para el texto normal), y la puntuación de accesibilidad de Lighthouse en móvil es de 90 o más.

### Publicación
- CA36: La app está publicada en una URL pública de Vercel y funciona en Chrome para Android y en Safari para iOS en sus versiones actuales.
- CA37: Cada cambio que llega a `main` se publica solo, sin pasos manuales, y aparece en la URL en menos de 10 minutos.
- CA38: El README incluye el enlace a la app publicada.

## Casos límite y errores
- **Nivel al 100 % en «Hasta X %»:** ningún objetivo es válido (debe ser mayor que 100), pero la tarjeta dice «Tu depósito ya está lleno» (CA8). Si el usuario sale del campo del objetivo, este sigue mostrando su error.
- **Pegar texto en un campo entero:** se quedan solo las cifras. «-3» se queda en «3», «40,5» en «405» (y entonces da el error de capacidad no válida) y «1.000» en «1000».
- **Precio recordado no válido o dañado:** el campo aparece vacío (CA21 de la 002).
- **Borrar el coche seleccionado:** la calculadora vuelve a la bienvenida. Al elegir otro coche, el nivel, el precio y los campos de cada modo conservan lo que tenían.
- **Coche de la lista con variante:** se muestra «Dacia Jogger (híbrido) · 40 l».
- **Búsqueda solo con espacios:** se muestran todos los coches (CA8 de la 002).
- **Litros a 0 con 1 € o más** (p. ej. 1 € a 2 €/l en «Tengo X €»): el texto principal es «0 l», como dice la 001.
- **Navegador que no deja guardar** (p. ej. modo privado estricto): todo funciona mientras la app está abierta y se ve el aviso de CA29.
- **Pantalla muy ancha** (escritorio): columna centrada, sin diseño propio de escritorio (visión).

## Fuera de alcance
- **Historial:** el botón «Guardar repostaje», la barra de navegación inferior «Calculadora / Historial», la pantalla «Historial», borrar repostajes y el aviso «Repostaje guardado» (capturas 06, 11 y 12). Van en la **feature 005**.
- **Gráfico «Últimos 7 días»** y total semanal de la captura 06: fuera del MVP, porque la 003 excluye gráficos y resúmenes por semana. La 005 mostrará el total del mes y el gasto por día.
- **Cifras con decimales del mockup** («30,2 L», «47,83 € exactos», «24,6 %»): la 001 solo da enteros.
- Editar un coche propio (se borra y se vuelve a añadir, como dice la 002).
- Recordar el nivel, el modo, el objetivo o el dinero entre visitas (la 002 lo excluye).
- Que el botón «Atrás» del navegador o del móvil vuelva de «Elige tu coche» a la calculadora.
- Modo oscuro, instalación como app (PWA) o uso sin conexión, dominio propio, analítica y diseño específico de escritorio.

## Preguntas abiertas
Ninguna.
