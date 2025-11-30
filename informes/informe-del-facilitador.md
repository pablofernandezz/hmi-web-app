# Informe del Facilitador-Administrador

A continuación se ofrece una plantilla del informe que debe generar la persona encargada de este role cada semana.

## Registro de tareas llevadas a cabo durante la semana 1

**Tarea 1: Diseño de la Interfaz Web y Adaptabilidad**

* **Descripción de la tarea:** Se ha realizado el diseño de la interfaz para la versión web de la aplicación siguiendo la metodología Mobile First. Se han creado los wireframes correspondientes a las tres vistas principales: Móvil (diseño vertical con acordeón), Tablet (diseño Maestro-Detalle de dos columnas) y Escritorio (diseño tipo Dashboard con panel de resumen fijo). El resultado de esta fase se ha plasmado en el documento `diseño-iu.pdf`, justificando las decisiones de distribución de espacio para cada dispositivo.
* **Asignación de responsables:** Tarea conjunta del equipo de desarrollo.
* **Estado de completud:** 100% Completado.
* **Conflictos, desviaciones, etc.:** El principal conflicto fue definir cómo mostrar la información de detalle simultáneamente con la lista sin utilizar navegación entre páginas (SPAs). Se optó por un diseño adaptativo que en móvil despliega la información dentro de la tarjeta (acordeón) y en pantallas grandes utiliza un panel lateral derecho, maximizando el uso del espacio disponible.

**Tarea 2: Implementación Estática HTML5 y CSS3**

* **Descripción de la tarea:** Se ha implementado el diseño utilizando exclusivamente HTML5 semántico y CSS3 (Vanilla), sin el uso de JavaScript ni frameworks externos. Se han aplicado estilos base para móvil y Media Queries para la adaptación a Tablet (`min-width: 768px`). Se ha estructurado el HTML para permitir la visualización dual (lista/detalle) mediante clases de utilidad CSS (`mobile-only`, `desktop-only`) que gestionan la visibilidad de los elementos según el ancho de la pantalla.
* **Asignación de responsables:** Tarea conjunta del equipo de desarrollo.
* **Estado de completud:** 100% Completado.
* **Conflictos, desviaciones, etc.:** El mayor desafío técnico fue simular la interactividad (ver detalles de un gasto) sin usar JavaScript. Se solucionó duplicando estratégicamente la información en el DOM y utilizando CSS para alternar entre la vista de "tarjeta expandida" (móvil) y "panel lateral" (escritorio), logrando cumplir el requisito de mostrar todos los bloques a la vez.

## Estado del repositorio en la semana 1

Al cierre de la semana 1, el repositorio se encuentra en un estado estable y contiene todos los entregables requeridos para la Tarea 1, cumpliendo con los requisitos de diseño adaptativo y estándares web.

* **Estructura de Ficheros Relevante:**

```text
.
├── css/
│   └── styles.css
├── informes/
│   ├── informe-del-analista.md
│   ├── informe-del-curador.md
│   └── informe-del-facilitador.md
├── diseno_ui_BonJovi.pdf
├── index.html
├── README.md
└── roles.md
````
* **Artefactos Entregados:**

  * **`diseno_ui_BonJovi.pdf`**: Documento que recoge el diseño de la interfaz de usuario (UI). Incluye los wireframes para las vistas de Móvil, Tablet y Escritorio, justificando la evolución del diseño desde una lista vertical hasta un panel de control (dashboard).
  * **`index.html`**: Fichero principal de la aplicación. Contiene la estructura en HTML5 semántico del informe de gastos. Se han utilizado etiquetas apropiadas (`article`, `section`, `time`) y atributos ARIA para garantizar la accesibilidad.
  * **`css/styles.css`**: Hoja de estilos CSS3 que implementa la presentación visual. Sigue la metodología Mobile First e incluye Media Queries (`min-width: 768px`) para adaptar la disposición de los elementos (Grid y Flexbox) a pantallas de tablet y escritorio.

* **Resumen de Funcionalidades Implementadas:**

  * **Diseño Adaptativo (Responsive):** La interfaz transiciona fluidamente de una vista de lista vertical en móviles a un diseño de dos columnas (Maestro-Detalle) en pantallas más grandes.
  * **Simulación de Interactividad (CSS puro):** Se ha implementado una lógica de visualización mediante clases (`mobile-only`, `desktop-only`, `expanded`) que permite mostrar los detalles de un gasto desplegados dentro de la tarjeta en versión móvil, y en un panel lateral fijo en la versión de escritorio, sin utilizar JavaScript.
  * **Informe de Datos:** Visualización estática de un historial de gastos con datos ficticios coherentes, incluyendo importes, fechas, estados (pendiente/saldado) y participantes.
