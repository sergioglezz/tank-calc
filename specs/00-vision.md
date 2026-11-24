# Visión

## Problema
Cuando vas a repostar, en muchas gasolineras tienes que decir o pagar el importe **antes** de llenar. Calcular de cabeza cuántos euros caben en el depósito sin pasarte, cuánto cuesta llenarlo hasta cierto nivel o hasta dónde llegas con el dinero que llevas es incómodo y propenso a errores. Tampoco es fácil recordar cuánto gastaste la última vez ni cuánto gastas a lo largo del tiempo.

## Para quién
Cualquier conductor que está en la gasolinera con el móvil en la mano y quiere saber, en pocos segundos, cuánto pedir en caja o cuánto le llega el dinero. El primer usuario es el propio autor.

## MVP: 3 funcionalidades mínimas
1. **Calculadora de repostaje con varios modos.** El usuario indica el nivel actual del depósito (en %) y el precio por litro (a mano), y elige un modo:
   - **Llenar a tope:** litros y euros necesarios, y el importe a pedir sin pasarse (importe exacto truncado a euros, sin céntimos; p. ej. 47,83 € → 47 €).
   - **Llenar hasta X %:** litros y euros para llegar al porcentaje objetivo.
   - **Tengo X €:** litros que entran con ese dinero y porcentaje en el que quedará el depósito.
2. **Mi coche.** El usuario elige su modelo de una lista incluida en la app (JSON con modelos populares y su capacidad de depósito). Si no está, puede añadir su coche (nombre + capacidad en litros), que se guarda solo en su dispositivo. La app recuerda el coche seleccionado y el último precio entre visitas.
3. **Historial de repostajes.** El usuario puede guardar un repostaje (fecha, litros, euros, precio/litro) y consultar cuánto gastó la última vez y un resumen sencillo de su gasto por días.

## Fuera de alcance (NO lo hago ahora)
- Mapa de gasolineras y precios reales obtenidos de una API (posible mejora futura).
- Cuentas de usuario, login y sincronización entre dispositivos (los datos viven solo en el navegador).
- Distinguir tipos de combustible (diésel, gasolina 95/98…): el precio por litro introducido ya lo cubre.
- Consumo en l/100 km u otras estadísticas que requieran kilómetros.
- Idiomas distintos al español.
- Versión de escritorio optimizada (debe funcionar, pero el diseño es mobile-first).

## Terminado significa
- La app está desplegada en una URL pública y funciona bien en el móvil.
- Un usuario puede, de principio a fin: elegir o añadir su coche, introducir nivel y precio, obtener el resultado en cualquiera de los tres modos, guardar el repostaje y verlo en el historial.
- Los cálculos no fallan: están cubiertos por tests automáticos (incluidos casos límite como depósito lleno, 0 %, porcentaje objetivo menor que el actual o dinero que supera la capacidad) y las entradas no válidas se rechazan con un mensaje claro.
- El README explica qué es, cómo usarla, cómo ejecutarla en local e incluye el enlace a la demo.

## Preferencias técnicas (si las tienes)
Recomendadas para un perfil frontend actual:
- **React + TypeScript** con **Vite**.
- **Tailwind CSS** para el estilo, diseño mobile-first.
- **Vitest** (+ Testing Library) para los tests.
- **localStorage** para coches propios, preferencias e historial (sin backend ni base de datos).
- Despliegue en **Vercel**.
