# Feature 003: Historial de repostajes (lógica)

> **Estado:** cerrada el 24/11/2026; se cumplen los 18 criterios de aceptación (ver [plan.md](plan.md), sección 7).

## Resumen y objetivo
Toda la lógica del historial de repostajes, sin interfaz. La app sabe:
- **guardar un repostaje** con su fecha, los euros pagados, el precio por litro y, si lo hay, el coche con el que se hizo; los litros se calculan;
- comprobar si los datos son válidos y, si no, explicar por qué en español;
- **borrar** un repostaje guardado por error;
- decir **cuánto se gastó la última vez**;
- dar un **resumen del gasto**: lo gastado cada día y el total del mes en curso;
- **recordar el historial entre visitas** en el dispositivo del usuario.

Como en la [feature 001](../001-calculadora/spec.md), las cifras son enteras: euros enteros y litros truncados. El único dato con decimales es el precio por litro.

Objetivo: que el usuario sepa cuánto gastó la última vez y cuánto gasta a lo largo del tiempo, sin apuntarlo en otro sitio.

## Historias de usuario
- Como conductor quiero **guardar lo que he repostado** para no tener que apuntarlo.
- Como conductor quiero **apuntar un repostaje de otro día** que olvidé guardar.
- Como conductor quiero **borrar un repostaje** que guardé mal.
- Como conductor quiero saber **cuánto gasté la última vez**.
- Como conductor quiero ver **cuánto gasto cada día y en el mes** para controlar el gasto.

## Criterios de aceptación

**Datos de un repostaje**
- CA1: Un repostaje tiene **fecha** (día, mes y año), **euros** pagados, **precio por litro**, **litros** y, opcionalmente, **coche**.
- CA2: Los euros siguen la regla del dinero de la feature 001: entero entre 1 y 1000 €. El precio sigue la regla de la feature 001: mayor que 0, como máximo 5 €/l y con tres decimales como máximo. Ambos se leen como en la feature 001 (coma o punto decimal, espacios de los extremos ignorados).
- CA3: Los litros no los escribe el usuario: son los euros entre el precio, **truncados** a litros enteros y calculados de forma exacta (un resultado que vale exactamente 25 l da 25 l, nunca 24 l). Ejemplo: 30 € a 1,579 €/l → **18 l**; 28 € a 1,12 €/l → **25 l**.
- CA4: Si no se indica fecha, el repostaje es de **hoy**. Si se indica, debe ser una fecha que existe y estar entre hoy y los 365 días anteriores, ambos incluidos. «Hoy» es el día del dispositivo del usuario.
- CA5: Si hay un coche seleccionado (feature 002) al guardar, el repostaje guarda su **nombre tal como se muestra** («Toyota Corolla (híbrido)» o el nombre del coche propio). Si no hay coche seleccionado, se guarda sin coche. Si después se borra el coche o se cambia la selección, el repostaje conserva el nombre que guardó.

**Validación**
- CA6: Si un dato no es válido, el repostaje no se guarda y se da un mensaje en español por cada dato no válido, todos a la vez:

| Dato | Caso | Mensaje |
|---|---|---|
| Euros | Vacío | «Introduce el importe pagado.» |
| Euros | No válido | «Escribe un importe entero entre 1 y 1000 €.» (el de la feature 001) |
| Precio | Vacío o no válido | Los mensajes de la feature 001 |
| Fecha | No existe o está mal escrita | «Introduce una fecha válida.» |
| Fecha | Posterior a hoy | «La fecha no puede ser posterior a hoy.» |
| Fecha | Anterior a los 365 días previos | «La fecha no puede ser de hace más de un año.» |

**Guardar y borrar**
- CA7: Un repostaje válido se añade al historial.
- CA8: Se guardan como máximo **500 repostajes**. Al guardar uno nuevo con 500 ya guardados, se guarda el nuevo y se descarta el más antiguo de los que había (el de fecha más antigua; si hay varios ese día, el que se guardó antes).
- CA9: Un repostaje se puede **borrar**. Solo se borra ese, aunque haya otro con los mismos datos.

**Consultas**
- CA10: El historial se ordena de más reciente a más antiguo por fecha; dentro del mismo día, el último guardado va primero.
- CA11: **La última vez** es el primer repostaje de ese orden, con todos sus datos. Con el historial vacío, no hay última vez.
- CA12: **Gasto por día:** una entrada por cada día con al menos un repostaje, de más reciente a más antiguo, con la fecha y la suma de los euros de ese día. Los días sin repostajes no aparecen.
- CA13: **Total del mes:** suma de los euros de los repostajes con fecha en el mes en curso del dispositivo (del día 1 a hoy). Si no hay ninguno, es 0 €.

**Presentación de las cifras**
- CA14: Euros, litros y porcentajes como en la feature 001 (`59 €`, `37 l`). El precio con coma decimal, sin ceros a la derecha y con la unidad detrás (`1,579 €/l`). La fecha como `24/11/2026` (día y mes con dos cifras).

**Recordar entre visitas**
- CA15: El historial se conserva al cerrar y volver a abrir la app en el mismo dispositivo y navegador. En la primera visita está vacío.
- CA16: Si lo guardado no se puede leer o está dañado, la app funciona sin errores: se descartan los repostajes que no cumplan CA1–CA3 (fecha que no existe, euros o precio no válidos, litros que no corresponden, coche que no sea un nombre de 1 a 40 caracteres) y se conservan los demás. Si quedan más de 500, se conservan los 500 más recientes. Al cargar no se aplica el límite de fechas de CA4: un repostaje de hace más de un año, o con fecha posterior a hoy porque cambió el reloj del dispositivo, se conserva.
- CA17: Si no se puede guardar (p. ej. el navegador lo impide), el cambio sigue valiendo mientras la app esté abierta y se indica que no se ha podido guardar, para que la interfaz pueda avisar (como CA23 de la feature 002).
- CA18: El historial se guarda aparte de los coches y el precio de la feature 002: si uno está dañado, el otro no se ve afectado.

## Casos límite y errores
- **Fecha de hoy y de hace 365 días:** válidas; mañana y hace 366 días, no.
- **Fechas que no existen:** 30/02/2026 o 29/02/2026 no son válidas; 29/02/2028 sí lo será cuando esté dentro del último año.
- **Cambio de mes:** el 1 del mes, el total del mes solo incluye los repostajes de ese día.
- **Varios repostajes el mismo día:** aparecen por separado en el historial y sumados en el gasto por día.
- **Litros truncados a 0:** posibles con precios muy altos (1 € a 2 €/l); se guarda `0 l`.
- **Dos repostajes idénticos:** se borra solo el elegido (CA9).
- **Repostaje 501 con fecha más antigua que todos los demás:** se guarda el nuevo y se descarta el más antiguo de los que había (CA8).
- **Borrar el último repostaje:** el historial queda vacío, sin última vez y con 0 € de total del mes.
- **Coche borrado después de repostar:** el repostaje conserva su nombre (CA5).
- **Extremos válidos:** 1 € y 1000 €; 0,001 €/l y 5 €/l.

## Fuera de alcance
- **Cualquier interfaz:** pantallas, cómo se elige la fecha, si los datos se rellenan con el resultado de la calculadora y cómo se avisa de que no se ha podido guardar. Irá en las specs de interfaz (004+).
- Editar un repostaje (se borra y se vuelve a guardar).
- Borrar todo el historial de una vez.
- Euros con céntimos y litros con decimales.
- Filtrar o resumir por coche, por semana o por año; precio medio; gráficos.
- Kilómetros y consumo (fuera de la visión).
- Exportar o importar el historial y sincronizarlo entre dispositivos.

## Preguntas abiertas
Ninguna.
