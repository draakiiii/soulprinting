# SoulPrinting - Tienda de Figuras 3D

Una tienda en línea moderna para la venta de figuras 3D personalizadas, construida con Next.js, TypeScript, Tailwind CSS y Firebase.

## Características

- 🛍️ Catálogo de productos con búsqueda y filtrado
- 🎨 Personalización de figuras
- 🛒 Carrito de compras
- 👤 Autenticación de usuarios
- 📦 Panel de administración para gestionar productos y pedidos
- 💳 Procesamiento de pagos (próximamente)
- 📱 Diseño responsive

## Tecnologías Utilizadas

- Next.js 13 con App Router
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- Zustand para gestión de estado
- React Hot Toast para notificaciones

## Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn
- Cuenta de Firebase

## Configuración

1. Clona el repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/soulprinting.git
cd soulprinting
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Crea un archivo .env.local en la raíz del proyecto y añade tus credenciales de Firebase:
\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

4. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en http://localhost:3000

## Estructura del Proyecto

\`\`\`
src/
  ├── app/              # Páginas y layouts de Next.js
  ├── components/       # Componentes React reutilizables
  ├── lib/             # Configuraciones y utilidades
  ├── store/           # Estado global con Zustand
  └── types/           # Definiciones de tipos TypeScript
\`\`\`

## Despliegue

El proyecto está configurado para ser desplegado en Vercel. Simplemente conecta tu repositorio de GitHub a Vercel y configura las variables de entorno necesarias.

## Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (\`git checkout -b feature/AmazingFeature\`)
3. Haz commit de tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles. 