# materias-app

Es una página web para ayudar a estudiantes de Ingeniería en Computación de la UdelaR a llevar el registro de las materias, ver los créditos obtenidos y planificar qué cursar.

No es una herramienta oficial de la UdelaR. La información de avance se debe utilizar como guía, ya que puede contener errores o quedar desactualizada.

## Funcionalidades

### Materias

1. Las materias se muestran con un color según su estado:

   - Gris: no está habilitada.
   - Rojo: está habilitada para cursar.
   - Celeste: está aprobada.
   - Verde: está exonerada.

2. Dar clic a una materia habilitada la marca como aprobada. Darle clic nuevamente la marca como exonerada, y un tercer clic vuelve al estado inicial.
3. Dar clic a una materia deshabilitada abre sus previas. Mantener el clic o tap apretado en cualquier materia abre toda su información.
4. La ventana de una materia permite ver sus previas, de qué materias es previa, el EVA, el programa y las áreas a las que aporta créditos.
5. Dar clic al nombre de un área dentro de esa ventana muestra las materias asociadas a esa área.
6. Los créditos se actualizan al exonerar materias o cambiar su estado.
7. Se pueden buscar materias por nombre o sigla, y filtrarlas por semestre, calidad de libre o área de créditos.
8. Se puede elegir entre el Plan 1997 y el Plan 2025, mostrar u ocultar Matemática Inicial y mostrar u ocultar materias opcionales.
9. Las materias opcionales y las que no muestran inscripción en Bedelías tienen un indicador propio.
10. La página tiene modo oscuro.

### Planificación

1. La vista **Planificar** permite armar una planificación por semestres y períodos de exámenes.
2. Se puede empezar desde el estado actual de las materias o planificar desde cero, eligiendo las materias que se quieren tomar como exoneradas al inicio.
3. Cada período se puede renombrar, cambiar entre semestre impar, semestre par o período de exámenes, y eliminar cuando ya no sea necesario.
4. La página muestra qué materias estarían habilitadas en cada período según las previas y los resultados elegidos en períodos anteriores.
5. Para cada materia planificada se puede indicar si se piensa aprobar el curso o exonerarla. En los períodos de exámenes se puede indicar si se aprueba el examen.
6. Se pueden mostrar u ocultar materias opcionales y materias que normalmente no se dictan en ese semestre.
7. Cada período muestra un resumen de las materias, los créditos planificados y el total acumulado.
8. Si la planificación usa el estado actual, el primer período se puede aplicar al progreso real cuando termine.

### Avance

1. La vista **Avance** muestra los créditos totales, los mínimos por área y las unidades curriculares necesarias.
2. Se puede consultar el avance para Ingeniería en Computación o para Analista en Computación.
3. Se puede mostrar todo o únicamente los requisitos que todavía faltan.
4. También se puede proyectar el avance hasta cualquiera de los períodos agregados en la planificación.

Actualmente esta vista calcula los requisitos del Plan 1997. Se debe utilizar como guía, porque puede contener errores y está sujeta a cambios.

La información del Plan 2025 todavía puede estar incompleta porque se actualiza a medida que se publican los programas, los EVA y las materias del plan.

### Guardado de datos

1. El progreso, la planificación, los créditos ajustados, los filtros y la configuración se guardan en `localStorage`, por lo que se mantienen al recargar la página.
2. **Copiar datos** genera un respaldo en formato JSON y lo copia al portapapeles.
3. **Cargar datos** permite restaurar ese respaldo. Antes de cambiar el estado actual, la página valida el JSON completo. Si encuentra un error no carga nada, y también verifica que toda materia exonerada figure como aprobada.
4. **Cuenta (Opcional)** permite crear una cuenta con email y contraseña para guardar los datos en Firebase y sincronizarlos entre dispositivos.
5. Si existen datos locales y datos guardados en Firebase, la página permite elegir con cuáles continuar.
6. También se puede cerrar sesión o pedir un email para cambiar la contraseña.

### Otras opciones

1. **Ajustar créditos** permite agregar o quitar créditos manualmente por área. Sirve para materias que todavía no están contempladas o para casos especiales.
2. **Reset** pide confirmación antes de borrar el progreso y volver al estado inicial.
3. **Hacer sugerencia** abre un formulario para enviar dudas, errores o materias que faltan.
4. **Respuestas** muestra aclaraciones a sugerencias que ya fueron recibidas.
