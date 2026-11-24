# Feature 002: Coches (lógica)

> **Estado:** cerrada el 24/11/2026; se cumplen los 23 criterios de aceptación (ver [plan.md](plan.md), sección 7). Durante la implementación se añadió a CA3 la regla de la capacidad más pequeña cuando hay dudas.

## Resumen y objetivo
Toda la lógica de «Mi coche», sin interfaz. La app sabe:
- ofrecer una **lista de unos 100 modelos** populares en España, cada uno con la capacidad de su depósito;
- **buscar** en esa lista y en los coches propios del usuario;
- **añadir y borrar coches propios** (nombre y capacidad), con mensajes en español si los datos no son válidos;
- **recordar entre visitas** los coches propios, el coche seleccionado y el último precio por litro usado.

Los datos se guardan solo en el dispositivo del usuario. Si no se pueden leer o están dañados, la app sigue funcionando como en la primera visita.

Objetivo: que el usuario no tenga que saber de memoria la capacidad de su depósito ni escribirla, ni el precio, en cada visita. La capacidad del coche seleccionado es la que usa la calculadora de la [feature 001](../001-calculadora/spec.md).

## Historias de usuario
- Como conductor quiero **buscar mi coche** por marca o modelo para no tener que saber la capacidad de su depósito.
- Como conductor cuyo coche no está en la lista quiero **añadirlo** con su nombre y capacidad.
- Como conductor quiero **borrar** un coche propio que ya no uso o que añadí mal.
- Como conductor quiero que la app **recuerde mi coche y el último precio** para calcular más rápido la próxima vez.

## Criterios de aceptación

**Lista de modelos incluida en la app**
- CA1: Cada entrada de la lista tiene **marca**, **modelo**, una **variante** opcional y una **capacidad** en litros. La variante solo aparece cuando un mismo modelo tiene depósitos de distinta capacidad según la motorización (p. ej. «híbrido», «diésel»).
- CA2: La lista tiene entre 90 y 110 entradas, todas con capacidad entera entre 1 y 200 l (la regla de la feature 001), marca y modelo no vacíos, y sin dos entradas con la misma marca, modelo y variante.
- CA3: Las capacidades salen de fichas técnicas públicas, y el autor ha revisado la lista y le ha dado el visto bueno antes de cerrar la feature. Si un modelo tiene distintas capacidades según la generación o la versión y no se distinguen con una variante, se usa **la más pequeña**: así la app puede calcular algo menos de lo que cabe, pero nunca pide más.
- CA4: Un coche de la lista se muestra como «Marca Modelo» o, si tiene variante, «Marca Modelo (variante)». Ejemplo: «Toyota Corolla (híbrido)».

**Búsqueda**
- CA5: La búsqueda incluye los coches de la lista (por marca, modelo y variante) y los coches propios (por su nombre).
- CA6: El texto buscado se divide en palabras por los espacios; un coche aparece si **cada palabra** está contenida en sus datos, en cualquier orden y posición. Ejemplo: «corolla toy» encuentra «Toyota Corolla».
- CA7: No se distinguen mayúsculas ni tildes ni diéresis: «citroen» encuentra «Citroën» y «LEON» encuentra «Seat León».
- CA8: Con el texto vacío o solo con espacios, el resultado son todos los coches.
- CA9: En el resultado salen primero los coches propios, en orden alfabético por nombre, y después los de la lista, en orden alfabético por marca, modelo y variante (sin variante antes que con variante).
- CA10: Si ningún coche coincide, el resultado está vacío.

**Coches propios**
- CA11: Para añadir un coche propio hacen falta un **nombre** y una **capacidad**. La capacidad sigue la regla y los mensajes de la feature 001 (entero entre 1 y 200 l).
- CA12: El nombre se guarda sin los espacios del principio y del final. Es válido si tiene entre 1 y 40 caracteres y no coincide con el de otro coche propio, sin distinguir mayúsculas ni tildes.
- CA13: Si un dato no es válido, el coche no se añade y se da un mensaje en español:

| Caso | Mensaje |
|---|---|
| Nombre vacío | «Introduce un nombre para el coche.» |
| Nombre de más de 40 caracteres | «Escribe un nombre de 40 caracteres como máximo.» |
| Nombre repetido | «Ya tienes un coche con ese nombre.» |
| Capacidad vacía o no válida | Los mensajes de la feature 001 |

- CA14: Se pueden guardar como máximo **10 coches propios**. Con 10 guardados, no se puede añadir otro y el mensaje es «Ya tienes 10 coches guardados. Borra uno para añadir otro.».
- CA15: Un coche propio se puede **borrar**. Si era el coche seleccionado, deja de haber coche seleccionado.
- CA16: Los coches de la lista no se pueden borrar ni modificar.

**Recordar entre visitas**
- CA17: Los coches propios, el coche seleccionado (de la lista o propio) y el último precio por litro válido se conservan al cerrar y volver a abrir la app en el mismo dispositivo y navegador.
- CA18: Solo se recuerda un precio que cumple la regla de la feature 001; un precio no válido no sustituye al último recordado.
- CA19: El precio recordado se recupera escrito con coma decimal y sin ceros a la derecha: si se usó «1.579», se recupera «1,579»; si se usó «1,50», se recupera «1,5».
- CA20: En la primera visita no hay coches propios, ni coche seleccionado, ni precio.

**Datos dañados o no disponibles**
- CA21: Si lo guardado no se puede leer o está dañado, la app funciona como en la primera visita para el dato afectado y sin errores: un coche seleccionado que ya no existe (propio borrado o modelo que ya no está en la lista) cuenta como ninguno, y un precio no válido cuenta como sin precio.
- CA22: De los coches propios guardados se descartan los que no cumplan las reglas de CA11–CA12 y los que pasen de 10, y se conservan los demás. Si hay nombres repetidos, se queda el primero.
- CA23: Si no se puede guardar (p. ej. el navegador lo impide), el cambio sigue valiendo mientras la app esté abierta y se indica que no se ha podido guardar, para que la interfaz pueda avisar.

## Casos límite y errores
- **Nombre con 40 caracteres:** válido; con 41, no. Los espacios de los extremos no cuentan.
- **Nombre que solo se diferencia en mayúsculas o tildes** («Mi león» y «MI LEON»): repetido.
- **Nombre igual que un modelo de la lista** («Toyota Corolla» propio): válido; solo se compara con otros coches propios.
- **Décimo coche propio:** se puede añadir; el undécimo, no (CA14).
- **Borrar el último coche propio:** la lista de propios queda vacía, sin errores.
- **Búsqueda con varios espacios seguidos o en los extremos:** se ignoran los espacios sobrantes («  corolla   toy » = «corolla toy»).
- **Palabra repetida en la búsqueda** («toyota toyota»): da lo mismo que «toyota».
- **Coches eléctricos:** no están en la lista, porque no tienen depósito.
- **Precio recordado en un extremo** (0,001 o 5 €/l): se recupera igual.

## Fuera de alcance
- **Cualquier interfaz:** pantallas, cómo se elige el coche, cuándo se guarda el precio y cómo se avisa de que no se ha podido guardar. Irá en las specs de interfaz (004+).
- Editar un coche propio (se borra y se vuelve a añadir).
- Recordar el nivel actual, el modo de cálculo o los datos de cada modo.
- Años, generaciones o versiones de cada modelo, salvo la variante de CA1.
- Actualizar la lista desde internet o con datos de una API.
- Historial de repostajes: feature 003.

## Preguntas abiertas
Ninguna.
