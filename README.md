# materias-app

Es una página web para ayudar a estudiantes de Ingeniería en Computación de la UdelaR a decidir que materias cursar.

## funcionalidades

1. Dar clic al botón de una materia habilitada para cursar (en rojo) para marcar que se aprobó. La materia debería quedar aprobada (en celeste).
2. Dar clic al botón de una materia aprobada (en celeste) para marcar que se exoneró. La materia debería quedar exonerada (en verde).
3. Dar clic al botón de una materia exonerada (en verde) para volver al inicio del ciclo. La materia debería quedar habilitada para cursar (en rojo).
4. Dar clic al botón de una materia deshabilitada (en gris) para abrir una ventana de información de la materia. Debería mostrar la pestaña de las previas necesarias.
5. Mantener el clic apretado en el botón de una materia para abrir una ventana de información de la materia. Debería mostrar la pestaña de que es previa la materia.
6. Al exonerar materias o sacar materias exoneradas, los créditos deberían ajustarse correctamente.
7. Dar clic al botón "1er Semestre" debería mostrar en pantalla únicamente las materias que se dictan en el primer semestre.
8. Dar clic al botón "2do Semestre" debería mostrar en pantalla únicamente las materias que se dictan en el segundo semestre.
9. Dar clic al botón "Ambos" debería mostrar en pantalla todas las materias.
9. Dar clic al botón "Calidad Libre" debería mostrar en pantalla únicamente las materias que tienen calidad de libre.
10. Dar clic al botón "Reset" debería abrir una venta que pregunta si queremos reiniciar el estado de la página.
11. Las materias aprobadas y exoneradas, la selección de los toggles y el filtro seleccionado, deberían mantenerse aunque una persona recargue la página. No se utiliza base de datos, ya que sería overkill y enlentecería el uso cuando no es necesario. Utilizamos un estado simple y lo guardamos en localStorage.
12. El toggle de "Matemática Inicial" es para indicar si quiero que la materia del mismo nombre aparezca o no.
13. El toggle de "Plan 2025" es para indicar si quiero utilizar el plan del mismo nombre, o el antiguo de 1997.
14. El toggle de "Opcionales" es para indicar si quiero ver las materias opcionales, o solo las obligatorias.
15. En la ventana de información de una materia, hay una pestaña "Información" que muestra más información sobre una materia, como el Eva del curso, el programa y a que área da créditos.
16. Dar clic al botón "Ver áreas" debería abrir una ventana que muestra todas las áreas de la carrera, los créditos obtenidos en cada una y los créditos mínimos necesarios en cada una.
17. Dar clic en el nombre de un área debería mostrar las materias asociadas a esa área.
18. Dar clic el botón "Ajustar créditos" debería abrir una ventana que permite agregar o quitar créditos de áreas específicas, permitiendo flexibilidad a los usuarios en caso de materias no contempladas por la página o casos borde como cambios en los créditos de una materia.
19. Dar clic en el botón "Respuestas" debería mostrar una ventana que muestra las respuestas a sugerencias o dudas que me dejaron usuarios.
20. Dar clic en el botón "Hacer sugerencia" debería redireccionar a un formulario de Google para dejar la sugerencia.