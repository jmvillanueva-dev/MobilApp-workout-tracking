# Workout Tracking App (Expo + Supabase)

## Resumen
Aplicación móvil desarrollada con **React Native (Expo)** y organizada con una **arquitectura limpia (Clean Architecture)**. Permite la gestión de ejercicios, rutinas, planes de entrenamiento, seguimiento de progreso con fotos y comunicación en tiempo real entre entrenadores y usuarios mediante Supabase.

## Tecnologías principales
- Expo / React Native
- TypeScript
- Supabase (Auth, Storage, Realtime, Database)
- AsyncStorage
- Expo ImagePicker / AV / Video
- @expo/vector-icons

## Funcionalidades principales
- **Autenticación y perfiles**
  - Registro e inicio de sesión con Supabase.
  - Perfiles con avatar y datos del usuario.
  - Roles: `entrenador` y `usuario`.

- **Gestión de contenido (especialmente para entrenadores)**
  - Crear/editar/eliminar ejercicios (con soporte para video).
  - Crear/editar/eliminar rutinas y planes de entrenamiento.
  - Asignar rutinas/planes a usuarios.

- **Usuarios**
  - Ver rutinas y planes asignados.
  - Completar rutinas y registrar entrenamientos (workout logs).
  - Subir fotos de progreso (progress photos).

- **Chat en tiempo real**
  - Chat global usando Supabase Realtime.
  - Indicador de escritura y lista de mensajes con burbujas.

- **Dashboard dinámico**
  - Vista adaptada al rol del usuario (entrenador/usuario).
  - Estadísticas rápidas y acciones rápidas para crear contenido.

## Estructura del proyecto (resumen)
```
app/                # Rutas y pantallas (file-based routing de Expo Router)
src/
 ├─ domain/         # Modelos, interfaces y casos de uso
 ├─ data/           # Implementaciones de repositorios y cliente Supabase
 └─ presentation/   # Hooks, componentes, providers y pantallas
```

## Requisitos previos
- Node.js (v16+ recomendado)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`) o usar `npx expo`

## Instalación y ejecución
1. Instalar dependencias:
```bash
npm install
```
2. Crear archivo de entorno a partir del ejemplo y configurar Supabase:
```bash
cp .env.example .env
# Edita .env y coloca EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY
```
3. Iniciar la aplicación en modo desarrollo:
```bash
npx expo start
```

## Archivos importantes
- `app/` – Contiene las rutas y pantallas principales (index, tabs, auth, trainer, users).
- `src/presentation/hooks` – Hooks personalizados para Auth, Routines, Exercises, Profile, Chat, etc.
- `src/data/repositories` – Implementaciones que interactúan con Supabase y AsyncStorage.
- `src/data/services/supabaseClient.ts` – Cliente de conexión a Supabase.
- `.env.example` – Variables de entorno necesarias.

## Configuración de Supabase (resumen)
- Habilita Auth (correo/contraseña) y Storage (para imágenes/videos).
- Crea tablas necesarias para usuarios, ejercicios, rutinas, planes, mensajes y fotos de progreso (el código del proyecto maneja la estructura esperada).
- Obtén `anon key` y `url` y colócalos en el archivo `.env` como se indica en `.env.example`.

## Buenas prácticas y notas
- Mantén las claves sensibles fuera del repositorio público.
- Usa entornos separados para desarrollo y producción en Supabase.
- Revisa las políticas de RLS (Row Level Security) en Supabase cuando publiques datos sensibles o archivos en Storage.
- Las rutas y pantallas usan `expo-router` (file-based routing) — revisa `app/` para entender la navegación.

## Contribuciones
Si deseas contribuir:
1. Haz un fork del repositorio.
2. Crea una rama con tu cambio: `git checkout -b feat/mi-mejora`
3. Envía un Pull Request describiendo los cambios.

## Licencia
Este proyecto está abierto para uso y contribuciones.


**Autor:** Jhonny Villanueva Montoya

Repositorio: `jmvillanueva-dev/mobilapp-workout-tracking`