Crea una aplicación web sencilla llamada GastoIA para el control de gastos personales.
Tecnologías

JavaScript
React + Vite
Supabase
PostgreSQL
IA mediante API
Funcionalidades
Crear un dashboard principal con:

Total de gastos del mes.
Total de gastos del año.
Cantidad de gastos.
Gráfico de gastos por categoría.
Gráfico de gastos por mes.
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
Filtrar por categoría y fecha.
Base de datos Supabase
Crear una tabla gastos:

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
descripcion TEXT NOT NULL,
valor NUMERIC(12,2) NOT NULL,
categoria TEXT NOT NULL,
fecha DATE NOT NULL,
metodo_pago TEXT,
observaciones TEXT,
created_at TIMESTAMP DEFAULT NOW()
Inteligencia Artificial
Agregar un botón "Analizar mis gastos".
La IA debe analizar los gastos almacenados en Supabase y mostrar un pequeño resumen indicando:

En qué categoría gasto más.
Cuánto he gastado.
Cuál fue mi gasto más alto.
Recomendaciones sencillas para ahorrar.
No implementar login, usuarios, roles ni permisos. La aplicación debe entrar directamente al dashboard y trabajar directamente con la base de datos de Supabase.
Crear una interfaz moderna, limpia, sencilla y responsive.