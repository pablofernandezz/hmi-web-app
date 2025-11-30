# Informe del analista

## Evaluación final de la semana 1

   - **Nicolás Domínguez Souto (Administrador)**
   
     - **5**
	 
	 - Ha gestionado correctamente el repositorio y la estructura de carpetas (separando CSS, assets, etc.). Ha coordinado la integración del código HTML y CSS asegurando que se cumplían los estándares requeridos en el enunciado.

   - **Joel Ramos Carro (Curador)**
    
     - **5**
   
     - Se encargó de investigar sobre las etiquetas de HTML5 (`article`, `section`, `time`) y las propiedades de accesibilidad (ARIA), lo que ha facilitado mucho la implementación del código base cumpliendo con las rúbricas.

   - **Pablo Fernández Martí (Analista)**

     - **5**

     - Me he encargado de definir el diseño visual para las distintas resoluciones (Móvil, Tablet, PC) y de analizar cómo adaptar la información de los gastos para que sea legible en cada formato. He supervisado que la implementación final coincidiera con los wireframes planteados.

## Retrospectiva de la semana 1

  **a) ¿Qué ha sido lo mejor de la práctica?**
  Lo mejor ha sido ver cómo, mediante una única hoja de estilos, la interfaz cambia de forma y disposición (de lista vertical a grid con panel lateral) sin necesidad de tocar el HTML ni usar JavaScript. Ver el concepto "Mobile First" en acción es muy interesante.
  
  **b) ¿Qué fue lo peor?**
  Ajustar los detalles del CSS "a mano". Al no poder usar librerías (por restricción del enunciado), hemos tenido que escribir todo el CSS desde cero, lo que a veces complica cosas "sencillas" como los alineamientos de los precios o los bordes de las tarjetas para que no se peguen al contenido.

  **c) ¿Cuál fue el mejor momento de cada semana durante el trabajo del equipo?**
  Cuando conseguimos visualizar la página en el móvil utilizando *Live Server* en VSC y comprobamos que el diseño se sentía cómodo y fluido en un dispositivo real.

  **d) ¿Cuál ha sido el peor?**
  El momento de decidir cómo mostrar tanta información (total, pagado, pendiente, participantes) dentro de una sola tarjeta sin que pareciera desordenado. Tuvimos que cambiar varias veces el diseño de la tarjeta hasta dar con la estructura de "Cabecera + Detalles" que fuera más útil.

  **e) ¿Qué has aprendido?**
  Hemos aprendido mucho de **HTML5 Semántico** (usando `aria-labelledby`, `time`, `article` en lugar de solo `divs`) y en **CSS Grid/Flexbox** para layouts responsivos. También hemos aprendido la importancia de la accesibilidad web, entendiendo que el código no solo debe verse bien, sino estar bien estructurado para lectores de pantalla.

  **f) ¿Qué necesitáis conservar -como equipo- para las próximas semanas?**
  La metodología de trabajo iterativa: primero diseñar (wireframes), luego estructurar (HTML) y finalmente estilizar (CSS). Separar el trabajo en estos pasos nos ha permitido trabajar de forma ordenada.

  **g) ¿Qué tenéis que mejorar -como equipo- para las próximas semanas?**
  Quizás planificar mejor las clases de CSS desde el principio. Al ir añadiendo estilos sobre la marcha, el archivo `styles.css` ha crecido rápido. Para las siguientes tareas que implican interactividad, debemos ser más organizados.

  **h) ¿Cómo se relaciona ESTE contenido con otros del curso y con tu titulación?**
  Esta práctica es la base de la Ingeniería Web y el último diseño de aplicaciones que nos queda por hacer, con respecto a la titulación, esta parte se complementa con otras asignaturas donde solo nos centramos en la lógica de negocio pero no vemos nada de interfaces.