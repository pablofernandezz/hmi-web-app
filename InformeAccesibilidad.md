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
| **Tabulación** | El foco debe seguir un orden lógico (Header -> Nav -> Main -> Footer). | El orden del DOM en `index.html` es correcto. No hay `tabindex` positivos que rompan el flujo natural. |  |
| **Indicador de foco visible** | Todos los elementos interactivos deben tener un anillo de foco visible al tabular. | El CSS (`styles.css`) respeta el `outline` por defecto del navegador, permitiendo ver qué elemento está seleccionado. |  |
| **Atrapar foco en Modales** | Al abrir "Nuevo Gasto", el foco no debe salir de la ventana modal al tabular. | Se utiliza la etiqueta nativa `<dialog>` y el método `.showModal()`, lo que garantiza que el navegador atrape el foco dentro del diálogo. |  |
| **Cierre con ESC** | Las modales y menús desplegables deben cerrarse con la tecla ESC. | La etiqueta `<dialog>` implementa el cierre con la tecla ESC de forma nativa sin necesidad de JavaScript adicional. |  |
| **Acordeones con Teclado** | Se deben poder expandir/colapsar los detalles de gasto (`<details>`) con Enter o Espacio. | Al usar los elementos semánticos `<details>` y `<summary>`, esta funcionalidad viene integrada y operativa. |  |

### 2. Semántica y WAI-ARIA

| Prueba | Resultado Esperado | Resultado Observado (Análisis del código) | Estado |
|:---|:---|:---|:---|
| **Estructura de Pestañas** | Los botones de navegación deben indicar cuál está activo. | Se usa `role="tablist"` y `role="tab"`. El JavaScript actualiza correctamente el atributo `aria-selected="true/false"` al cambiar de vista. |  |
| **Relación Etiqueta-Campo** | Todos los inputs de los formularios deben tener una etiqueta asociada. | Todos los inputs cuentan con un `<label for="...">` que coincide con su `id`, asegurando la lectura del nombre del campo. |  |
| **Información de Iconos** | Los iconos decorativos no deben ser leídos por el lector de pantalla. | Los iconos visuales tienen el atributo `aria-hidden="true"`, evitando ruido innecesario en la navegación auditiva. |  |
| **Fechas legibles** | Las fechas deben ser interpretables semánticamente por la máquina. | Se utiliza la etiqueta `<time datetime="...">` tanto en el HTML estático como en la generación dinámica de tarjetas. |  |
| **Encabezados** | Las secciones deben tener encabezados para permitir navegación por estructura. | Se usan `h1`, `h2`, `h3` anidados correctamente. Se incluyen encabezados con clase `visually-hidden` para dar contexto a secciones visualmente limpias. |  |

### 3. Feedback y Estados Dinámicos

| Prueba | Resultado Esperado | Resultado Observado (Análisis del código) | Estado |
|:---|:---|:---|:---|
| **Anuncio de Balance** | Cuando se actualiza el total, el lector de pantalla debe notarlo automáticamente. | Los contenedores de resumen tienen `aria-live="polite"`. Los cambios numéricos se anuncian sin interrumpir al usuario. |  |
| **Estado de Carga** | El usuario debe saber si la aplicación está procesando una acción. | El overlay de carga tiene `role="alert"` y `aria-label="Cargando contenido"`. Su aparición notifica al usuario del proceso en curso. |  |
| **Validación de Errores** | Los mensajes de error deben tomar el foco para ser leídos inmediatamente. | Se usa un `<dialog>` modal para los errores en lugar de `alert()`. Al abrirse con `showModal()`, el foco se mueve al mensaje, garantizando su lectura. |  |

---

## Revisión de Errores y Puntos de Mejora

parte de nico

## Conclusión

parte de nico