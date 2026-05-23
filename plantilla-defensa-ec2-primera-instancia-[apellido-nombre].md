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

**1**
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

**2:**
> Uso de Any() en el Servicio de Guests

**¿Por qué este fragmento es un code smell? ¿Qué problema real podría causar si se deja así?**
> Por que no deja mucha claridad de lo que se quiere validar si las guestids del booking entrante existen o no.

**Código original (snippet — sin capturas):**
```
                if (guestIds != null && guestIds.Any())
                {
                    foreach (var guestId in guestIds)
                    {
                        Console.WriteLine($"Checking guest ID: {guestId}");
                    }
                    
                    await _bookingRepo.AssignGuestsToBooking(created.Id, guestIds);
                }
```

**Código refactorizado (snippet):**
```
                if (guestIds != null && guestIds.Count() != 0)
                {
                    foreach (var guestId in guestIds)
                    {
                        Console.WriteLine($"Checking guest ID: {guestId}");
                    }
                    
                    await _bookingRepo.AssignGuestsToBooking(created.Id, guestIds);
                }
```

**Commit de la refactorización:**
```
refactor(backend): Comentar enpoints sin utilizar en el Controlador de Guests, porque pueden ser de utilidad en algun futuro
refactor(backend): Reemplazar _.any()_ con _.count() != 0_ para dar mas seguridad a la hora de validar la lista de los guests, si no estan vacíos o no. 
```

---

## Paso 3 · Prueba unitaria sobre el código refactorizado


**Historia de Usuario relacionada:** Crear Reserva para hotel, no me acuerdo

**Código a probar (snippet):**
```
                if (guestIds != null && guestIds.Count() != 0)
                {
                    foreach (var guestId in guestIds)
                    {
                        Console.WriteLine($"Checking guest ID: {guestId}");
                    }
                    
                    await _bookingRepo.AssignGuestsToBooking(created.Id, guestIds);
                }
```

**Prueba unitaria (snippet):**
```
        [Fact]
        public async Task GuestIds_Count_Test()
        {
            //Arrange
            var request = new BookingRequestDTO
            {
                RoomId = 1,
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5),
                GuestIds = new List<int> { }
            };
            // act
            await _service.CreateBooking(request, request.GuestIds);
            // Assert
            Assert.False(request.GuestIds.Count() == 0);
        }
```

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
