Crea una aplicación web llamada GastoIA para el control de gastos personales.

Tecnologías

JavaScript
React + Vite
Supabase (PostgreSQL + Auth) como backend
IA mediante API externa (Google Gemini, usando clave gratuita)

Estructura del proyecto

Todos los archivos del proyecto (package.json, src/, index.html, etc.) deben quedar directamente en la raíz de la carpeta entregada, sin carpetas anidadas adicionales.
Voy a desplegar en Netlify conectado a un repositorio de GitHub: incluye un archivo netlify.toml con el comando de build y el directorio de publicación ya configurados, y un .gitignore que excluya node_modules, dist y .env.
Incluye un archivo .env.example con las variables necesarias, sin valores reales.

Autenticación y usuarios

Implementa autenticación con Supabase Auth (registro e inicio de sesión con correo y contraseña).
Cada usuario debe ver y gestionar únicamente sus propios gastos; los datos de un usuario no deben ser visibles ni editables por otro.
La aplicación debe iniciar en una pantalla de login/registro, y solo después de autenticarse debe entrar al dashboard.
Incluye una opción de "Cerrar sesión" visible en el dashboard.
No es necesario un sistema de roles ni permisos diferenciados (todos los usuarios tienen las mismas capacidades sobre sus propios datos); basta con separar la información por cuenta.

Seguridad de la información

La tabla gastos debe incluir una columna user_id (referenciando a auth.users) que se asigne automáticamente al crear cada gasto, según el usuario autenticado.
Activa Row Level Security en la tabla gastos, con políticas que solo permitan a cada usuario leer, insertar, actualizar y eliminar sus propios registros (comparando user_id con el usuario autenticado de la sesión).
La clave pública (anon) de Supabase puede vivir en el frontend, pero cualquier clave de proveedor de IA debe manejarse exclusivamente desde una Edge Function de Supabase, nunca expuesta en el código del cliente. La Edge Function debe verificar el token de sesión del usuario antes de analizar datos, para que el análisis siempre corresponda solo a los gastos de quien hace la solicitud.
Los formularios deben validar en el frontend que los campos obligatorios no queden vacíos y que los valores numéricos sean positivos, y la base de datos debe reforzar las mismas reglas con restricciones (CHECK, NOT NULL) a nivel de columna.

Diseño frontend

Interfaz moderna, limpia y minimalista, con enfoque tipo fintech: colores neutros con un color de acento para resaltar totales y montos, y buena jerarquía visual entre títulos, datos numéricos y texto secundario.
Tipografía legible, con los valores monetarios alineados y fáciles de leer de un vistazo.
Prioriza que se vea bien en móvil primero, no solo que sea "responsive" de forma genérica: los formularios, tablas y gráficos deben adaptarse correctamente a pantallas pequeñas sin perder usabilidad.

Funcionalidades

Crear un dashboard principal con:

Total de gastos del mes.
Total de gastos del año.
Cantidad de gastos.
Gráfico de gastos por categoría.
Gráfico de gastos por mes.
Comparación mes a mes: mostrar cuánto se gastó en el mes actual frente al mes anterior (en monto y en porcentaje de variación), y señalar en qué categoría hubo el mayor incremento o la mayor reducción de un mes a otro.

Crear un formulario para registrar gastos con:

Descripción
Valor
Categoría
Fecha
Método de pago
Observaciones

Crear una tabla para mostrar los gastos registrados con opciones de:

Editar
Eliminar
Buscar
Filtrar por categoría y por rango de fechas.

Base de datos Supabase

Crear una tabla gastos:

sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
descripcion TEXT NOT NULL,
valor NUMERIC(12,2) NOT NULL,
categoria TEXT NOT NULL,
fecha DATE NOT NULL,
metodo_pago TEXT,
observaciones TEXT,
created_at TIMESTAMP DEFAULT NOW()

Inteligencia artificial

Agregar un botón "Analizar mis gastos". La IA debe analizar los gastos almacenados en Supabase y mostrar un resumen indicando:

En qué categoría se gasta más.
Cuánto se ha gastado en total.
Cuál fue el gasto más alto.
Cómo cambió el gasto respecto al mes anterior.
Recomendaciones sencillas para ahorrar, basadas en los datos anteriores.

Entrega

Al final, incluye instrucciones de despliegue completas y detalladas, asumiendo que no tengo experiencia previa con la CLI de Supabase ni con Netlify, incluyendo cómo obtener la clave de la API de IA y cómo configurarla de forma segura.