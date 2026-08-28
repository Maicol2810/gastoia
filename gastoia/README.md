# GastoIA

Aplicación web sencilla para el control de gastos personales. Sin login, sin usuarios: entra directo al dashboard y trabaja contra tu propia base de datos de Supabase.

**Stack:** React + Vite, Supabase (PostgreSQL), gráficos con Recharts, análisis con IA vía una Edge Function de Supabase.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql` para crear la tabla `gastos`.
3. En **Project Settings → API** copia la `Project URL` y la clave `anon public`.

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Completa `.env` con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`.

## 5. Botón "Analizar mis gastos" (IA)

El resumen numérico (categoría con más gasto, total, gasto más alto) se calcula en el propio navegador a partir de tus datos en Supabase. Las **recomendaciones de ahorro** las genera un modelo de IA a través de una Edge Function de Supabase, para no exponer ninguna clave de IA en el frontend.

Para activarla:

```bash
# Instala la CLI de Supabase si no la tienes: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase functions deploy analizar-gastos
supabase secrets set ANTHROPIC_API_KEY=sk-ant-tu-clave
```

Si prefieres usar otro proveedor de IA (OpenAI, etc.), edita `supabase/functions/analizar-gastos/index.ts`: solo cambia la llamada `fetch` al endpoint de ese proveedor y el nombre de la variable de entorno en `supabase secrets set`.

Mientras la función no esté desplegada, el resto de la aplicación (dashboard, registro, historial) funciona con normalidad; solo el botón de IA mostrará un aviso.

## 6. Compilar para producción

```bash
npm run build
```

Los archivos listos para desplegar quedan en `dist/` (puedes subirlos a Vercel, Netlify, Cloudflare Pages, etc.).

## Estructura del proyecto

```
src/
  App.jsx                 Navegación por pestañas (Dashboard / Registrar / Historial)
  supabaseClient.js       Cliente de Supabase + catálogos de categorías y métodos de pago
  components/
    Dashboard.jsx          KPIs + gráficos (categoría y mensual)
    ExpenseForm.jsx         Formulario de registro/edición
    ExpenseTable.jsx        Tabla con búsqueda, filtros, editar y eliminar
    AIAnalysis.jsx           Botón "Analizar mis gastos"
  hooks/
    useExpenses.js          Lectura y mutaciones (crear/editar/eliminar) contra Supabase
supabase/
  schema.sql               Definición de la tabla gastos
  functions/analizar-gastos/  Edge Function que genera las recomendaciones con IA
```
