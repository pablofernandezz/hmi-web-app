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

---

## Evaluación final de la semana 2

   - **Nicolás Domínguez Souto (Administrador)**
   
     - **5**
	 
	 - Ha hexho un gran trabajo implementando funciones en JavaScript. Gestionó los cambios en el CSS (como las *Media Queries* para tablet) no rompieran la estructura base que definimos la semana pasada.

   - **Joel Ramos Carro (Curador)**
    
     - **4**
   
     - Se encargó de toda la parte de gestión de amigos y también fue el encargado de actualizar el diseño cuando hubo cambios con respecto al diseño original planteado la semana pasada.

   - **Pablo Fernández Martí (Analista - Yo)**

     - **4**

     - Me he centrado en la lógica de negocio compleja en el cliente: el cálculo de saldos (evitando los errores de `NaN`), la gestión del estado "dual" (acordeón en móvil vs panel lateral en escritorio) y la lógica de validación para añadir/eliminar participantes en los gastos, objetivamente esta semana no le he podido dedicar tanto tiempo como otras.

## Retrospectiva de la semana 2

  **a) ¿Qué ha sido lo mejor de la práctica?**
  Lo mejor ha sido "dar vida" al diseño estático. Ver cómo la aplicación se conecta a la API real y rellena la interfaz con datos reales del servidorr ha sido un gran paso. Lograr que una misma interacción (clic en tarjeta) se comporte de forma distinta en móvil (desplegar acordeón) y en escritorio (actualizar panel lateral) ha sido un reto técnico bastante interesante.
  
  **b) ¿Qué fue lo peor?**
  La gestión del estado y la manipulación del DOM con "Vanilla JS" (JavaScript puro). Al no usar frameworks como React o Vue, tuvimos que escribir mucho código manual para actualizar la interfaz (por ejemplo, regenerar la lista de checkboxes al abrir el modal de edición o calcular manualmente quién ha pagado y quién debe). El error de los cálculos que daban `NaN` o el problema del Grid en tablet que se rompía por un `div` contenedor nos dieron varios problemas difíciles de solucionar.

  **c) ¿Cuál fue el mejor momento de cada semana durante el trabajo del equipo?**
  Cuando solucionamos el problema de la visualización en Tablet. Al principio las tarjetas se apilaban en una sola columna desaprovechando el espacio, pero al aplicar correctamente el `display: grid` al contenedor dinámico `#expenses-list`, la interfaz mejoró un montón y se sintió verdaderamente adaptativa.

  **d) ¿Cuál ha sido el peor?**
  Implementar la lógica de edición de participantes. Cruzar los datos de "todos los amigos" con "participantes actuales" y decidir qué checkboxes debían estar marcados y deshabilitados (porque ya habían pagado) fue la lógica más compleja de la semana y nos llevó varios intentos que funcionara sin errores.

  **e) ¿Qué has aprendido?**
  Hemos aprendido a manejar la asincronía en la web (`Promise.all`, `fetch`), a manipular el DOM dinámicamente respetando la estructura CSS previa, y a depurar errores de JavaScript en el navegador. También hemos reforzado la importancia de separar los datos (JSON) de la representación visual.

  **f) ¿Qué necesitáis conservar -como equipo- para las próximas semanas?**
  La estructura modular del código. Haber separado las funciones en "Gestión de Gastos", "Gestión de Resumen" y "Utilidades" dentro de `main.js` nos salvó de tener un archivo desoredenado.

  **g) ¿Qué tenéis que mejorar -como equipo- para las próximas semanas?**
  Quizás la validación de errores. Aunque ahora capturamos los fallos de conexión y mostramos un mensaje, podríamos mejorar el feedback al usuario en los formularios (por ejemplo, validando los campos antes de enviarlos a la API para evitar esperas innecesarias).

  **h) ¿Cómo se relaciona ESTE contenido con otros del curso y con tu titulación?**
  Esta semana conecta directamente con asignaturas de **Internet y Sistemas Distribuidos** (consumo de APIs REST). Hemos puesto en práctica el ciclo completo de una aplicación web: Backend (Python/API) <-> Frontend (HTML/JS), entendiendo cómo viajan y se transforman los datos entre capas.