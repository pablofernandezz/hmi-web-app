# Informe de Pruebas Exploratorias de Accesibilidad (Tarea 3)

**Objetivo:** Validar el cumplimiento de las pautas WAI-ARIA y WCAG 2.1 (Nivel AA) en la interfaz de "SplitWithMe".

## Metodología

Las pruebas se han realizado siguiendo una estrategia exploratoria manual centrada en tres puntos principales:

1.  **Navegación por Teclado:** Se verificca que todas las acciones se pueden realizar sin ratón.
2.  **Semántica y ARIA:** Se verifica que que la información visual se transmite correctamente a los lectores de pantalla.
3.  **Feedback y Estados:** Se verifica que los cambios dinámicos (carga, errores, modales) son anunciados.

---

## Lista de Pruebas y Resultados

### 1. Navegación y Gestión del Foco

| Prueba | Resultado Esperado | Resultado Observado (Análisis del código) | Estado |
|:---|:---|:---|:---|
| **Tabulación** | El foco debe seguir un orden lógico (Header -> Nav -> Main -> Footer). | El orden del DOM en `index.html` es correcto. No hay `tabindex` positivos que rompan el flujo natural. | ✅ PASADA |
| **Indicador de foco visible** | Todos los elementos interactivos deben tener un anillo de foco visible al tabular. | El CSS (`styles.css`) respeta el `outline` por defecto del navegador, permitiendo ver qué elemento está seleccionado. | ✅ PASADA |
| **Atrapar foco en Modales** | Al abrir "Nuevo Gasto", el foco no debe salir de la ventana modal al tabular. | Se utiliza la etiqueta nativa `<dialog>` y el método `.showModal()`, lo que garantiza que el navegador atrape el foco dentro del diálogo. | ✅ PASADA |
| **Cierre con ESC** | Las modales y menús desplegables deben cerrarse con la tecla ESC. | La etiqueta `<dialog>` implementa el cierre con la tecla ESC de forma nativa sin necesidad de JavaScript adicional. | ✅ PASADA |
| **Acordeones con Teclado** | Se deben poder expandir/colapsar los detalles de gasto (`<details>`) con Enter o Espacio. | Al usar los elementos semánticos `<details>` y `<summary>`, esta funcionalidad viene integrada y operativa. | ✅ PASADA |

### 2. Semántica y WAI-ARIA

| Prueba | Resultado Esperado | Resultado Observado (Análisis del código) | Estado |
|:---|:---|:---|:---|
| **Estructura de Pestañas** | Los botones de navegación deben indicar cuál está activo. | Se usa `role="tablist"` y `role="tab"`. El JavaScript actualiza correctamente el atributo `aria-selected="true/false"` al cambiar de vista. | ✅ PASADA |
| **Relación Etiqueta-Campo** | Todos los inputs de los formularios deben tener una etiqueta asociada. | Todos los inputs cuentan con un `<label for="...">` que coincide con su `id`, asegurando la lectura del nombre del campo. | ✅ PASADA |
| **Información de Iconos** | Los iconos decorativos no deben ser leídos por el lector de pantalla. | Los iconos visuales tienen el atributo `aria-hidden="true"`, evitando ruido innecesario en la navegación auditiva. | ✅ PASADA |
| **Fechas legibles** | Las fechas deben ser interpretables semánticamente por la máquina. | Se utiliza la etiqueta `<time datetime="...">` tanto en el HTML estático como en la generación dinámica de tarjetas. | ✅ PASADA |
| **Encabezados** | Las secciones deben tener encabezados para permitir navegación por estructura. | Se usan `h1`, `h2`, `h3` anidados correctamente. Se incluyen encabezados con clase `visually-hidden` para dar contexto a secciones visualmente limpias. | ✅ PASADA  |

### 3. Feedback y Estados Dinámicos

| Prueba | Resultado Esperado | Resultado Observado (Análisis del código) | Estado |
|:---|:---|:---|:---|
| **Anuncio de Balance** | Cuando se actualiza el total, el lector de pantalla debe notarlo automáticamente. | Los contenedores de resumen tienen `aria-live="polite"`. Los cambios numéricos se anuncian sin interrumpir al usuario. | ✅ PASADA |
| **Estado de Carga** | El usuario debe saber si la aplicación está procesando una acción. | El overlay de carga tiene `role="alert"` y `aria-label="Cargando contenido"`. Su aparición notifica al usuario del proceso en curso. | ✅ PASADA |
| **Validación de Errores** | Los mensajes de error deben tomar el foco para ser leídos inmediatamente. | Se usa un `<dialog>` modal para los errores en lugar de `alert()`. Al abrirse con `showModal()`, el foco se mueve al mensaje, garantizando su lectura. | ✅ PASADA |

---

## Revisión de Errores y Puntos de Mejora

Durante la fase de validación se detectaron y corrigieron los siguientes puntos:

1.  **Validación de Formularios (Inputs Numéricos):** Inicialmente, los campos de importe tenían un atributo `step="5"`, lo que impedía a los usuarios introducir cantidades decimales exactas (ej. 18,20 €) y generaba errores de validación confusos. Se corrigió estableciendo `step="0.01"` en todos los formularios para permitir una entrada de datos precisa y accesible.

2.  **Gestión del Foco en Actualizaciones:** Se identificó que, al guardar un gasto o editarlo, la lista completa se regeneraba, provocando que el usuario perdiera la posición del foco si estaba navegando con teclado. Se ha mitigado forzando el foco de vuelta al elemento editado o al contenedor principal tras la recarga, mejorando la continuidad en la navegación por teclado.

3.  **Depuración de Feedback de Errores:** Durante las pruebas de validación, se detectó que el modal de aviso no se desplegaba al intentar crear un gasto sin participantes, impidiendo el feedback al usuario. El error se debía a una discrepancia entre el identificador del título en el HTML (`title-message-modal`) y la referencia en el JavaScript (`message-title`). Se corrigió el selector en el código para restaurar la funcionalidad y garantizar que el foco se mueva correctamente al mensaje de error.

## Conclusión

La aplicación **SplitWithMe** ha superado satisfactoriamente las pruebas exploratorias de accesibilidad, cumpliendo con los requisitos WAI-ARIA y las pautas WCAG 2.1 (Nivel AA) establecidas para esta práctica.

El análisis confirma que la decisión de utilizar **HTML5 semántico nativo** (elementos `<dialog>`, `<details>`, `<time>`, `<main>`, `<nav>`) en lugar de emulaciones con JavaScript ha sido clave para garantizar una experiencia robusta y accesible "out-of-the-box". La navegación por teclado es fluida, cíclica y lógica, y la gestión del foco en ventanas modales impide errores de interacción.

Asimismo, la implementación de atributos ARIA dinámicos (`aria-live`, `aria-selected`, `role="alert"`) asegura que los usuarios de tecnologías de asistencia reciban feedback inmediato sobre los cambios en la interfaz (carga, errores, actualización de saldos).

Tras la corrección de los problemas de validación numérica y la depuración de los identificadores en los modales de error, la aplicación se considera apta para su uso por personas con diversidad funcional, respetando los estándares web modernos sin dependencias externas.
