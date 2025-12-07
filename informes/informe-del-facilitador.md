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

# Informe del Facilitador-Administrador

A continuación se ofrece una plantilla del informe que debe generar la persona encargada de este role cada semana.

## Registro de tareas llevadas a cabo durante la semana 2

**Tarea 1: Integración de Lógica Dinámica y Conexión con API**

* **Descripción de la tarea:** Se ha evolucionado la aplicación de una maqueta estática a una Single Page Application (SPA) dinámica. Se ha implementado la capa de lógica en JavaScript (`js/main.js`) para consumir la API REST del backend (`http://127.0.0.1:8000`). Se han sustituido los datos "dummy" del HTML por datos reales obtenidos mediante peticiones asíncronas (`fetch`), permitiendo la visualización en tiempo real del listado de gastos, el cálculo de totales en el dashboard y la carga de detalles de amigos y gastos específicos.
* **Asignación de responsables:** Tarea conjunta del equipo de desarrollo.
* **Estado de completud:** 100% Completado.
* **Conflictos, desviaciones, etc.:** Nos enfrentamos a un problema de "descuadre visual" (layout shift) en la vista de escritorio al cargar la página, que se solucionó implementando estados de visibilidad (`hidden-at-start`) controlados por JavaScript para el panel lateral.

**Tarea 2: Implementación de Interactividad (CRUD) y Mejora de UX**

* **Descripción de la tarea:** Se ha completado la funcionalidad de gestión de gastos (Crear, Editar, Eliminar). Se ha mejorado significativamente la Experiencia de Usuario (UX) sustituyendo las interacciones básicas por ventanas modales nativas (`<dialog>`). Se ha implementado lógica compleja para la gestión de participantes (añadir/quitar amigos de un gasto), validación de importes (decimales) y protección de integridad de datos (impedir desmarcar amigos que ya han aportado). Se ha añadido un sistema de feedback visual ("Pantalla de Carga" no bloqueante) para informar al usuario durante las operaciones de red.
* **Asignación de responsables:** Tarea conjunta del equipo de desarrollo.
* **Estado de completud:** 100% Completado.
* **Conflictos, desviaciones, etc.:** El principal desafío fue la sincronización entre el estado del servidor y la interfaz de usuario (UI). Específicamente, los cambios en los participantes no se reflejaban inmediatamente en el panel de detalles tras guardar. Se solucionó forzando una recarga parcial del panel derecho tras una operación exitosa. También se corrigió un error en el envío de datos `PUT`, donde se enviaban campos residuales que el servidor rechazaba; se optó por construir objetos JSON limpios antes del envío.

## Estado del repositorio en la semana 2

Al cierre de la semana 2, el repositorio ha migrado de ser una estructura puramente visual a una aplicación funcional conectada a base de datos, cumpliendo los requisitos de interactividad de la Tarea 2.

* **Estructura de Ficheros Relevante:**

```text
.
├── css/
│   └── styles.css
├── informes/
│   ├── informe-del-analista.md
│   ├── informe-del-curador.md
│   └── informe-del-facilitador.md
├── js/
│   └── main.js
├── LICENSE
├── README.md
├── diseno_ui_BonJovi.pdf
├── enunciado.md
├── index.html
├── life-b4-autocad.jpeg
└── roles.md
└── rubricas.md
````

* **Artefactos Entregados:**

  * **`js/main.js`**: Fichero que contiene toda la lógica de cliente. Gestiona el ciclo de vida de la aplicación, las llamadas `async/await` a la API, la manipulación del DOM para renderizar tarjetas y detalles, y la lógica de los formularios modales.
  * **`index.html`**: Actualizado para incluir los elementos `<dialog>` (ventanas modales para Crear y Editar) y el contenedor de la pantalla de carga (`loading-overlay`). Se han limpiado los datos estáticos para ser inyectados dinámicamente.
  * **`css/styles.css`**: Actualizado con estilos para las ventanas modales (centrado, backdrop), el botón de acción flotante (FAB) rediseñado, y los indicadores de carga. Se han añadido utilidades de visibilidad para corregir parpadeos de carga.

* **Resumen de Funcionalidades Implementadas:**

  * **Comunicación Cliente-Servidor:** La web consume datos reales de una base de datos SQLite a través de una API REST local.
  * **Gestión Avanzada de Gastos:** Capacidad para crear nuevos gastos y editar los existentes mediante formularios modales que permiten modificar concepto, importe, fecha y la lista de participantes activos.
  * **Sincronización de Interfaz:** Actualización inmediata de los totales, listas y paneles de detalle tras realizar operaciones de modificación o borrado, sin necesidad de recargar la página completa.
  * **Feedback de Usuario:** Implementación de pantallas de carga "Procesando..." para mejorar la percepción de rendimiento durante las peticiones al servidor.
