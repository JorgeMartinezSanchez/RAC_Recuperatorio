# EC2 — Defensa en Vivo · Primera Instancia
## Taller de Diseño de Software I
**Estudiante:** Jorge Martínez Sánchez
**Fecha:** sábado 24 de mayo de 2025  
**Proyecto trabajado en esta defensa:** Residencial Al Cubo Lite

---

## Paso 1 · Reporte de cobertura actual

Antes de tocar cualquier código, genera el reporte de cobertura del proyecto que vas a trabajar.

- Herramienta utilizada: *dotnet reportgenereator*
- Nombre de archivo del reporte generado: *dotnet_report.zip* 

---

## Paso 2 · Code smell a refactorizar

Identifica un code smell en tu código y refactorízalo.

**Tipo de code smell:**
> [nombre del tipo, ej: Long Method]

**¿Por qué este fragmento es un code smell? ¿Qué problema real podría causar si se deja así?**
> [Tu respuesta — en tus palabras]

**Código original (snippet — sin capturas):**
```
// pegar aquí el código antes de refactorizar
```

**Código refactorizado (snippet):**
```
// pegar aquí el código después de refactorizar
```

**Commit de la refactorización:**
```
refactor([scope]): descripción breve
```
*Ejemplos:*
```
refactor(backend): extraer lógica de validación de reserva a método separado
refactor(frontend): renombrar variable 'x' a 'precioTotal' en servicio de carrito
```

---

## Paso 3 · Prueba unitaria sobre el código refactorizado

Escribe una prueba unitaria que cubra la lógica del código que acabas de refactorizar.

> ⚠️ Solo se aceptan pruebas sobre lógica de negocio.
> No se aceptan pruebas sobre controllers, repositorios, DbContext ni configuraciones.
> ⚠️ Tanto el code smell refactorizado como esta prueba unitaria deben ser **código nuevo** — no reutilices ni copies trabajo del reporte entregado entre semana.

**Historia de Usuario relacionada:** [código o título de la HU]

**Código a probar (snippet):**
```
// método o función sobre el que se hace la prueba
```

**Prueba unitaria (snippet):**
```
// prueba escrita — patrón AAA
```

**En tu prueba, ¿dónde está el Arrange, el Act y el Assert? Explícalo brevemente:**
> [Tu respuesta]

**Commit de la prueba:**
```
test([scope]): descripción breve
```
*Ejemplos:*
```
test(backend): agregar prueba unitaria para validación de fechas en ReservaService
test(frontend): agregar prueba para cálculo de descuento en CarritoService
```

---

## Paso 4 · Reporte de cobertura nuevo

Genera nuevamente el reporte de cobertura con la prueba recién escrita.

- Link al reporte generado: [link o nombre del archivo adjunto en el .zip]

**¿Qué cambió respecto al reporte anterior? ¿Por qué subió (o no subió) la cobertura?**
> [Tu respuesta]

---

## Paso 5 · Preguntas

> Responde con tus propias palabras. No hay una única respuesta correcta — importa que razones lo que estás diciendo.

**Pregunta 1**
¿Por qué no es suficiente probar una aplicación solo haciendo clic en la interfaz?

> [Tu respuesta]

---

**Pregunta 2**
¿Qué significa que una prueba sea "unitaria"? ¿Qué tan pequeña debe ser la unidad que prueba?

> [Tu respuesta]

---

**Pregunta 3**
¿Qué es la cobertura de código? ¿Un 100% de cobertura garantiza que el software no tiene errores?

> [Tu respuesta]

---

**Pregunta 4**
Después de refactorizar, ¿cómo sabes que el código sigue funcionando igual? ¿Qué papel jugó la prueba unitaria ahí?

> [Tu respuesta]

---

## Entrega

Comprimir en un `.zip` con el nombre:
```
evidencia-ec2-[apellido-nombre].zip
```

El `.zip` debe contener:
- Este archivo `.md` completado
- Reporte de cobertura inicial (PDF o HTML)
- Reporte de cobertura final (PDF o HTML)

Subir en la tarea **EC2 — Evidencia de Defensa en Vivo** en Moodle antes de las 10:40.
