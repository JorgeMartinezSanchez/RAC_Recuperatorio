# EC2 — Defensa en Vivo · Primera Instancia
## Taller de Diseño de Software I
**Estudiante:** Jorge Martínez Sánchez
**Fecha:** sábado 24 de mayo de 2025  
**Proyecto trabajado en esta defensa:** Residencial Al Cubo Lite

---

## Reporte de cobertura actual

- Herramienta utilizada: *dotnet reportgenereator*
- Nombre de archivo del reporte generado: *dotnet_report.zip* 

---

## Code smell a refactorizar

**Tipo de code smell:**
> Enpoints sin usar en el Controlador de Guests: ControllerGuests.cs

**¿Por qué este fragmento es un code smell? ¿Qué problema real podría causar si se deja así?**
> Porque un pedazo de condigo sin usar puede afectar el rendimiento y simplemente ser una carga para la api?

**Código original (snippet — sin capturas):**
```
        public async Task<IActionResult> NewGuest([FromBody] GuestRequestDTO newGuest)
        {
            var guest = await guestService.AddGuest(newGuest);
            return Ok(guest);
        }

        [HttpPost("new/many/{newGuestList}")]
        public async Task<IActionResult> NewGuestList([FromBody] List<GuestRequestDTO> newguestList)
        {
            var guestList = await guestService.AddGuestList(newguestList);
            return Ok(guestList);
        }
```

**Código refactorizado (snippet):**
```
        /*[HttpPost("new/{newGuest}")]
        public async Task<IActionResult> NewGuest([FromBody] GuestRequestDTO newGuest)
        {
            var guest = await guestService.AddGuest(newGuest);
            return Ok(guest);
        }

        [HttpPost("new/many/{newGuestList}")]
        public async Task<IActionResult> NewGuestList([FromBody] List<GuestRequestDTO> newguestList)
        {
            var guestList = await guestService.AddGuestList(newguestList);
            return Ok(guestList);
        }*/
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
