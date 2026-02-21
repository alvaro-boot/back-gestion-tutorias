# Backend - Gestión de Tutorías

Backend desarrollado con NestJS para la gestión de tutorías universitarias. Permite a los administradores registrar profesores y estudiantes, gestionar materias, especialidades, disponibilidad de profesores, y asignar automáticamente tutores a las solicitudes de tutoría de los estudiantes.

## Características

- ✅ Autenticación JWT con control de roles
- ✅ Solo administradores pueden registrar usuarios (profesores y estudiantes)
- ✅ Gestión completa de materias y especialidades
- ✅ Sistema de disponibilidad de profesores
- ✅ Solicitudes de tutoría por estudiantes
- ✅ Asignación automática de tutores basada en especialidad y disponibilidad
- ✅ Documentación Swagger/OpenAPI
- ✅ Soft delete en todas las entidades
- ✅ Validaciones completas con class-validator

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio y navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales de base de datos:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=gestion_tutorias
JWT_SECRET=tu_secret_key_super_segura
```

5. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE gestion_tutorias;
```

6. Ejecutar el seed para crear roles y usuario administrador inicial:
```bash
npm run seed
```

7. Iniciar el servidor:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Credenciales del Administrador Inicial

Después de ejecutar el seed, puedes iniciar sesión con:

- **Email**: `admin@universidad.edu` (o el configurado en `.env`)
- **Contraseña**: `admin123` (o la configurada en `.env`)

**⚠️ IMPORTANTE**: Cambia estas credenciales después del primer inicio de sesión.

## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
├── usuario/                 # Módulo de usuarios
├── rol/                     # Módulo de roles
├── materia/                 # Módulo de materias
├── especialidad/            # Módulo de especialidades
├── disponibilidad/          # Módulo de disponibilidad
├── solicitud-tutoria/       # Módulo de solicitudes
├── tutoria/                 # Módulo de tutorías
├── common/                  # Módulos compartidos (guards, decorators, filters)
├── config/                  # Configuraciones
└── database/                # Scripts de seed
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado
- `POST /api/auth/change-password` - Cambiar contraseña

### Usuarios (Solo Admin)
- `POST /api/usuarios` - Crear usuario (con roles)
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `PATCH /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `POST /api/usuarios/:id/asignar-rol` - Asignar rol
- `DELETE /api/usuarios/:id/remover-rol/:rolId` - Remover rol

### Materias
- `POST /api/materias` - Crear materia (Admin)
- `GET /api/materias` - Listar materias
- `GET /api/materias/:id` - Obtener materia
- `PATCH /api/materias/:id` - Actualizar materia (Admin)
- `DELETE /api/materias/:id` - Eliminar materia (Admin)

### Especialidades
- `POST /api/especialidades` - Asignar especialidad a profesor (Admin)
- `GET /api/especialidades?usuarioId=X` - Listar especialidades
- `DELETE /api/especialidades/:id` - Eliminar especialidad (Admin)

### Disponibilidad
- `POST /api/disponibilidad` - Crear disponibilidad (Admin/Profesor)
- `GET /api/disponibilidad?usuarioId=X` - Listar disponibilidades
- `PATCH /api/disponibilidad/:id` - Actualizar disponibilidad
- `DELETE /api/disponibilidad/:id` - Eliminar disponibilidad

### Solicitudes de Tutoría
- `POST /api/solicitudes` - Crear solicitud (Estudiante)
- `GET /api/solicitudes` - Listar solicitudes
- `GET /api/solicitudes/:id` - Obtener solicitud
- `PATCH /api/solicitudes/:id/estado` - Cambiar estado
- `DELETE /api/solicitudes/:id` - Cancelar solicitud (Estudiante)

### Tutorías
- `POST /api/tutorias/asignar/:solicitudId` - Asignar tutor automáticamente (Admin)
- `POST /api/tutorias/asignar-manual` - Asignar tutor manualmente (Admin)
- `GET /api/tutorias` - Listar tutorías
- `GET /api/tutorias/:id` - Obtener tutoría
- `PATCH /api/tutorias/:id/estado` - Actualizar estado

## Documentación Swagger

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/api/docs
```

## Roles del Sistema

- **admin**: Administrador del sistema. Puede gestionar usuarios, materias, roles y asignar tutorías.
- **profesor**: Profesor que puede dar tutorías. Puede gestionar su disponibilidad.
- **estudiante**: Estudiante que puede solicitar tutorías.

## Flujo de Asignación Automática de Tutores

1. El estudiante crea una solicitud de tutoría para una materia en una fecha y hora específica.
2. El administrador ejecuta la asignación automática.
3. El sistema busca profesores con especialidad en la materia solicitada.
4. Filtra por disponibilidad en el día y hora solicitados.
5. Verifica que no tengan conflictos con otras tutorías.
6. Asigna al primer tutor disponible.
7. Actualiza el estado de la solicitud a "aceptada".

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Seed de datos iniciales
npm run seed
```

## Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | - |
| `DB_NAME` | Nombre de la base de datos | `gestion_tutorias` |
| `JWT_SECRET` | Secret key para JWT | - |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `ADMIN_EMAIL` | Email del admin inicial | `admin@universidad.edu` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial | `admin123` |
| `ADMIN_NOMBRE` | Nombre del admin inicial | `Administrador` |

## Notas Importantes

- **Registro de Usuarios**: Solo los administradores pueden crear nuevos usuarios. No hay registro público.
- **Soft Delete**: Todas las entidades implementan soft delete, por lo que los registros eliminados se marcan con `deleted_at` en lugar de eliminarse físicamente.
- **Asignación de Tutores**: La asignación automática busca el primer tutor disponible que cumpla con los criterios (especialidad + disponibilidad + sin conflictos).

## Licencia

ISC
# back-gestion-tutorias
