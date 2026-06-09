# 💸 SplitWithMe - Cliente Web (HMI)

![Estado del proyecto](https://img.shields.io/badge/Estado-Completado-success)
![Contexto Académico](https://img.shields.io/badge/Contexto-UDC_FIC-blue)
![Asignatura](https://img.shields.io/badge/Asignatura-IPM-orange)

Aplicación web desarrollada para la gestión y división de gastos compartidos, diseñada con un enfoque responsivo y centrado en la usabilidad multiplataforma.

Este repositorio contiene exclusivamente el **Cliente Web**. Puedes consultar la versión nativa de escritorio de este mismo sistema en el siguiente enlace:
👉 **[SplitWithMe - Cliente de Escritorio](https://github.com/pablofernandezz/hmi-desktop-app)**

---

## 🛠️ Tecnologías Utilizadas

* **Estructura y Estilos:** HTML5, CSS3
* **Lógica de Cliente:** JavaScript
* **Comunicación:** API Fetch / peticiones HTTP a API RESTful

## 🏗️ Arquitectura del Sistema

Este proyecto es el cliente web que interactúa con un servidor backend externo. Mientras la API externa centraliza la persistencia de datos y el cálculo de deudas, esta aplicación web se encarga de renderizar la interfaz en el navegador y gestionar las interacciones del usuario de forma dinámica.

## ⚙️ Instalación y Despliegue Local

Para que la aplicación web funcione correctamente, la API backend debe estar operativa en tu máquina local.

### 1. Levantar la API Backend (Dependencia Externa)
La API requerida es `splitwithme`:
1. Clona el repositorio de la API: 
   `git clone https://github.com/nbarreira/splitwithme`
2. Sigue las instrucciones de ese repositorio para arrancar el servidor.

### 2. Ejecutar el Cliente Web
Una vez la API esté en marcha:

1. Clona este repositorio:
```bash
   git clone [https://github.com/pablofernandezz/hmi-web-app.git](https://github.com/pablofernandezz/hmi-web-app.git)
   cd hmi-web-app
``` 
2. Abre el archivo principal en tu navegador (o levanta un servidor de desarrollo ligero si utilizas módulos JS):
```bash
   # Ejemplo usando Python para servir la web en local rápidamente
   python -m http.server 8000
```
3. Accede a http://localhost:8000 en tu navegador.

🎓 Contexto Académico y Equipo

Este proyecto fue desarrollado de forma colaborativa como parte de la asignatura de Interacción Persona-Máquina (IPM) en la Facultade de Informática da Coruña (FIC - UDC), con el objetivo de diseñar interfaces web accesibles y amigables para el usuario.

Desarrollado por:

    Pablo Fernández Martí LinkedIn: www.linkedin.com/in/pablo-fernandez-marti-526320415

	Joel Ramos Carro

    Nicolás Domíguez Souto
