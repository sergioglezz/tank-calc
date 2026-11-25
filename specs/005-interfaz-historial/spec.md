# Feature 005: Interfaz del historial

> **Estado:** cerrada el 25/11/2026; se cumplen los 24 criterios (ver [plan.md](plan.md), sección 8). La redactó el agente con autorización expresa del autor para escribir la spec, el plan y las tareas e implementarlas sin esperar la aprobación de cada fase (el autor no estaba disponible). Las decisiones que normalmente se habrían preguntado están en «Decisiones tomadas sin consulta»; el autor las revisó y aprobó las seis el 25/11/2026. La publicación en Vercel es T1 de la 004 y queda fuera de esta feature.

## Resumen y objetivo
Segunda y última spec de interfaz del MVP. Se apoya en la lógica de la [feature 003](../003-historial/spec.md) (historial) y en la interfaz de la [feature 004](../004-interfaz-calculadora/spec.md). El usuario puede:
- **guardar un repostaje** desde la calculadora, con los datos ya rellenados y la posibilidad de cambiarlos (otro importe, otro precio u otro día);
- ver en la pantalla **«Historial»** cuánto gastó la última vez, cuánto lleva gastado este mes, lo gastado cada día y la lista de repostajes;
- **borrar** un repostaje guardado por error;
- moverse entre «Calculadora» e «Historial» con una **barra de navegación inferior**.

Como en la 004, la interfaz no hace cálculos propios: los litros, las sumas, el orden, los mensajes y los formatos son los de la 003.

**Diseño de referencia:** las capturas 01, 06, 08, 09, 11 y 12 de [docs/design/](../../docs/design/). Del mockup se toman el estilo, la estructura y la navegación. Las cifras son las de las specs: euros y litros enteros, precio con hasta tres decimales y fechas `24/11/2026`.

La pantalla «Historial» lleva el título «Tu historial» (captura 06). Como en la 004, los textos secundarios que no cambian el comportamiento se toman del mockup, como la etiqueta «Tu próxima parada cuenta» del historial vacío. Los textos de los criterios de aceptación mandan sobre el mockup.

## Historias de usuario
- Como conductor quiero **guardar el repostaje con un toque** después de calcularlo, sin volver a escribir los datos.
- Como conductor quiero **cambiar el importe, el precio o el día** al guardar, porque a veces pago otra cantidad o apunto un repostaje de otro día.
- Como conductor quiero ver **cuánto gasté la última vez** y **cuánto llevo este mes**.
- Como conductor quiero ver **cada repostaje** y **lo gastado cada día**.
- Como conductor quiero **borrar un repostaje** que guardé mal.

## Criterios de aceptación

### Navegación
- CA1: En todas las pantallas hay una **barra inferior fija** con «Calculadora» e «Historial» (capturas 01 y 06). Marca la pantalla activa, y «Elige tu coche» cuenta como «Calculadora». Un lector de pantalla sabe cuál es la página actual.
- CA2: Al cambiar de pantalla desde la barra, el foco va al título de la nueva pantalla (como CA33 de la 004). Pulsar la pantalla que ya está activa no hace nada; desde «Elige tu coche», «Calculadora» vuelve a la calculadora.
- CA3: Los datos de la calculadora (campos, modo y errores mostrados) se conservan al ir al historial y volver, como en CA5 de la 004.
- CA4: La barra no tapa ningún contenido: el final de cada pantalla se puede ver por encima de ella.

### Guardar un repostaje
- CA5: Debajo de la tarjeta de resultado hay un botón **«Guardar repostaje»**:
  - está **activo** solo cuando la tarjeta muestra cifras (las cuatro primeras filas de CA7 de la 004);
  - está **desactivado** con el depósito lleno, con menos de 1 € o con datos incompletos o no válidos (capturas 08 y 09);
  - no aparece en la bienvenida (sin coche seleccionado).
- CA6: Al pulsarlo se abre una hoja desde abajo, **«Guardar repostaje»**, con:
  - **Euros pagados (€)**, relleno con los euros a pedir del resultado. En «Tengo X €» con dinero de sobra son los euros a pedir, no el dinero que se tiene: 59 € y no 80 € en el ejemplo de la 001.
  - **Precio por litro (€/l)**, relleno con el precio de la calculadora tal como está escrito.
  - **Fecha**, rellena con el día de hoy.
  - el texto «Se guardará con tu coche: Seat Ibiza.», con el nombre del coche seleccionado tal como se muestra (CA5 de la 003).
  - los botones «Guardar» y «Cancelar».
- CA7: Los tres datos se pueden cambiar antes de guardar:
  - los euros abren el teclado numérico sin separador y solo admiten cifras (como CA15 y CA16 de la 004);
  - el precio abre el teclado con separador decimal;
  - la fecha usa el selector de fecha del dispositivo, limitado de hace 365 días a hoy.
- CA8: Los errores de la hoja siguen CA10–CA12 de la 004, con los mensajes de CA6 de la 003. Al pulsar «Guardar» con algún dato no válido, aparecen a la vez todos los errores y no se guarda nada.
- CA9: Al guardar un repostaje válido:
  - se añade al historial con sus litros calculados y el coche;
  - se cierra la hoja y se sigue en la calculadora;
  - debajo del botón aparece el aviso **«Repostaje guardado»** (captura 12), que un lector de pantalla anuncia.
- CA10: El aviso «Repostaje guardado» desaparece al cambiar cualquier dato de la calculadora, al cambiar de pantalla o al volver a abrir la hoja.
- CA11: «Cancelar», la tecla Escape o tocar fuera de la hoja la cierran sin guardar nada.
- CA12: Guardar un repostaje no cambia los datos de la calculadora. Un precio cambiado en la hoja no sustituye al último precio recordado (CA17 de la 004 solo se aplica al campo de la calculadora).

### Historial vacío (captura 11)
- CA13: Sin repostajes, la pantalla «Historial» muestra:
  - la tarjeta «Aún no has guardado ningún repostaje», con el texto «Guarda tu primer cálculo y empieza a ver cuánto gastas en gasolina.» y el botón **«Ir a la calculadora»**;
  - debajo, la nota «Todos tus repostajes, a mano», con el texto «Aquí verás el último importe, tu gasto por día y los litros de cada repostaje.».

### Historial con repostajes (captura 06)
- CA14: Arriba aparece la tarjeta **«La última vez gastaste»** (CA11 de la 003):
  - los euros en grande (p. ej. «45 €»);
  - debajo, la fecha y el coche, si lo hay («24/11/2026 · Seat Ibiza»);
  - después, los litros y el precio («28 l · 1,59 €/l»).
- CA15: Después aparece la tarjeta **«Este mes»**:
  - el total del mes en curso (CA13 de la 003), p. ej. «160 €»;
  - la lista **«Gasto por día»**, con una fila por día que tiene repostajes, la fecha y los euros de ese día (CA12 de la 003), del más reciente al más antiguo.
- CA16: Al final aparece la sección **«Repostajes»** con el número de repostajes guardados («4 repostajes» o «1 repostaje») y la lista en el orden de CA10 de la 003. Cada fila muestra:
  - la fecha;
  - los litros, el precio y el coche, si lo hay («18 l · 1,579 €/l · Seat Ibiza»);
  - los euros.
- CA17: Las cifras y las fechas siguen CA14 de la 003: `45 €`, `18 l`, `1,579 €/l` y `24/11/2026`.

### Borrar un repostaje
- CA18: Cada fila de «Repostajes» tiene un botón «Borrar». Al pulsarlo se pide confirmación en una hoja: «¿Borrar el repostaje del 24/11/2026 de 45 €?», con «Borrar» y «Cancelar». El foco empieza en «Cancelar», como al borrar un coche en la 004.
- CA19: Al confirmar, se borra solo ese repostaje (CA9 de la 003), aunque haya otro igual. «La última vez», «Este mes», «Gasto por día» y el número de repostajes se actualizan al momento, y el foco va al título de la pantalla.
- CA20: Al borrar el último repostaje, la pantalla pasa al historial vacío (CA13).

### Recordar entre visitas
- CA21: Los repostajes guardados siguen ahí al cerrar y volver a abrir la app (CA15 de la 003). Si lo guardado está dañado, la app funciona y muestra los repostajes válidos (CA16 de la 003).
- CA22: Si no se puede guardar el historial al añadir o borrar un repostaje (CA17 de la 003), aparece el aviso de CA29 de la 004 y el cambio sigue valiendo mientras la app esté abierta.

### Móvil, idioma y accesibilidad
- CA23: Las pantallas y las hojas nuevas cumplen los mismos criterios que la 004 (CA30–CA35):
  - sin desplazamiento horizontal a 360 px;
  - textos en español;
  - etiquetas visibles y errores accesibles;
  - uso completo con teclado y foco visible;
  - botones de 44 × 44 px como mínimo;
  - contraste AA.

### Cierre del MVP
- CA24: El README describe la app como MVP completo: calculadora, coches e historial. Lo que dependa de la publicación en Vercel (T1 de la 004) queda indicado como pendiente.

## Casos límite y errores
- **Guardar con la fecha vacía:** cuenta como hoy (CA4 de la 003).
- **Fecha escrita a mano en un navegador sin selector:** si no existe, es posterior a hoy o es de hace más de un año, se muestra el mensaje de la 003.
- **Euros cambiados a «0» o «1001»:** error de la 003 («Escribe un importe entero entre 1 y 1000 €.»).
- **Precio de la calculadora válido pero cambiado en la hoja a uno no válido:** error del precio en la hoja; la calculadora no cambia.
- **Varios repostajes el mismo día:** aparecen por separado en «Repostajes» y sumados en «Gasto por día».
- **Repostaje de otro mes:** cuenta en «Gasto por día» y en la lista, pero no en «Este mes».
- **Repostaje sin coche** (se guardó sin coche o viene de datos antiguos): la fila y «La última vez» no muestran el coche.
- **Coche borrado después de guardar:** el repostaje conserva el nombre (CA5 de la 003).
- **Litros a 0** (1 € a 2 €/l): se muestra «0 l».
- **Repostaje 501:** se guarda y desaparece el más antiguo (CA8 de la 003), sin aviso.
- **Muchos repostajes** (hasta 500): la lista y «Gasto por día» se muestran enteras, sin paginar.

## Fuera de alcance
- Gráfico «Últimos 7 días» y total semanal de la captura 06 (decidido en la 004).
- Editar un repostaje (se borra y se vuelve a guardar) y borrar todo el historial (la 003 lo excluye).
- Paginar o filtrar el historial, y resúmenes por coche, por semana o por año.
- Guardar un repostaje sin pasar por la calculadora (desde la pantalla «Historial»).
- Que el aviso «Repostaje guardado» desaparezca solo pasado un tiempo.
- Publicación en Vercel: es T1 de la 004 y la hace el autor.

## Decisiones tomadas sin consulta
Se resolvieron con el mismo criterio que la 004 (seguir el mockup cuando no contradice las specs). El autor aprobó las seis el 25/11/2026:
1. **Guardar desde la calculadora con hoja editable** (CA6–CA7), en lugar de guardar directamente con un toque. Así se cubre la historia «apuntar un repostaje de otro día» de la 003, que el mockup no tiene, sin pantalla nueva.
2. **«Este mes» y «Gasto por día» en lugar del gráfico de 7 días**, como se decidió en la 004.
3. **«Gasto por día» muestra todos los días con repostajes**, no solo los del mes, porque así lo define CA12 de la 003.
4. **El aviso «Repostaje guardado» no desaparece solo** (CA10): un temporizador complica la accesibilidad y los tests, y el aviso deja de tener sentido en cuanto cambia algo.
5. **Un precio cambiado en la hoja no se recuerda** (CA12): el «último precio» de la 002 es el de la calculadora.
6. **La barra inferior está también en «Elige tu coche»**, como en la captura 04.

## Preguntas abiertas
Ninguna.
