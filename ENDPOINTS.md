# Documentación de Endpoints - API Gestión de Tutorías

## Base URL
```
http://localhost:3000/api
```

## Autenticación
La mayoría de los endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticación (`/auth`)

### POST `/auth/login`
Iniciar sesión y obtener token JWT.

**Roles:** Público (no requiere autenticación)

**Request Body:**
```json
{
  "correo": "admin@universidad.edu",
  "contraseña": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "1",
    "nombre": "Administrador",
    "correo": "admin@universidad.edu",
    "roles": ["admin"]
  }
}
```

---

### GET `/auth/profile`
Obtener perfil del usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Response:**
```json
{
  "id": "1",
  "nombre": "Administrador",
  "correo": "admin@universidad.edu",
  "estado": "activo",
  "roles": ["admin"]
}
```

---

### POST `/auth/change-password`
Cambiar contraseña del usuario autenticado.

**Roles:** Todos los usuarios autenticados

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## 👥 Usuarios (`/usuarios`)

### POST `/usuarios`
Crear nuevo usuario (profesor o estudiante).

**Roles:** `admin`

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan.perez@universidad.edu",
  "contraseña": "password123",  // Opcional, se genera automáticamente si no se proporciona
  "estado": "activo",            // Opcional
  "roles": ["profesor"]          // Array con roles: "profesor" o "estudiante"
}
```

**Response:**
```json
{
  "id": "2",
  "nombre": "Juan Pérez",
  "correo": "juan.perez@universidad.edu",
  "estado": "activo",
  "usuarioRoles": [
    {
      "id": "1",
      "rol": {
        "id": "2",
        "nombre": "profesor"
      }
    }
  ]
}
```

---

### GET `/usuarios`
Listar todos los usuarios.

**Roles:** `admin`

**Response:**
```json
[
  {
    "id": "1",
    "nombre": "Administrador",
    "correo": "admin@universidad.edu",
    "estado": "activo",
    "usuarioRoles": [...]
  }
]
```

---

### GET `/usuarios/:id`
Obtener usuario por ID.

**Roles:** `admin` o el mismo usuario

**Response:**
```json
{
  "id": "2",
  "nombre": "Juan Pérez",
  "correo": "juan.perez@universidad.edu",
  "estado": "activo",
  "usuarioRoles": [...]
}
```

---

### PATCH `/usuarios/:id`
Actualizar usuario.

**Roles:** `admin` o el mismo usuario

**Request Body:**
```json
{
  "nombre": "Juan Carlos Pérez",  // Opcional
  "correo": "juan.carlos@universidad.edu",  // Opcional
  "estado": "inactivo"  // Opcional
}
```

---

### DELETE `/usuarios/:id`
Eliminar usuario (soft delete).

**Roles:** `admin`

**Response:**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

### POST `/usuarios/:id/asignar-rol`
Asignar rol a un usuario.

**Roles:** `admin`

**Request Body:**
```json
{
  "rolId": "2"
}
```

---

### DELETE `/usuarios/:id/remover-rol/:rolId`
Remover rol de un usuario.

**Roles:** `admin`

**Response:**
```json
{
  "message": "Rol removido exitosamente"
}
```

---

## 🎭 Roles (`/roles`)

### POST `/roles`
Crear nuevo rol.

**Roles:** `admin`

**Request Body:**
```json
{
  "nombre": "coordinador"
}
```

---

### GET `/roles`
Listar todos los roles.

**Roles:** `admin`

**Response:**
```json
[
  {
    "id": "1",
    "nombre": "admin"
  },
  {
    "id": "2",
    "nombre": "profesor"
  },
  {
    "id": "3",
    "nombre": "estudiante"
  }
]
```

---

### GET `/roles/:id`
Obtener rol por ID.

**Roles:** `admin`

---

### PATCH `/roles/:id`
Actualizar rol.

**Roles:** `admin`

**Request Body:**
```json
{
  "nombre": "administrador"
}
```

---

### DELETE `/roles/:id`
Eliminar rol.

**Roles:** `admin`

---

## 📚 Materias (`/materias`)

### POST `/materias`
Crear nueva materia.

**Roles:** `admin`

**Request Body:**
```json
{
  "nombre": "Matemáticas I",
  "codigo": "MAT101",
  "estado": "activa"  // Opcional
}
```

---

### GET `/materias`
Listar todas las materias.

**Roles:** Todos los usuarios autenticados

**Response:**
```json
[
  {
    "id": "1",
    "nombre": "Matemáticas I",
    "codigo": "MAT101",
    "estado": "activa"
  }
]
```

---

### GET `/materias/:id`
Obtener materia por ID.

**Roles:** Todos los usuarios autenticados

---

### PATCH `/materias/:id`
Actualizar materia.

**Roles:** `admin`

**Request Body:**
```json
{
  "nombre": "Matemáticas Avanzadas I",  // Opcional
  "codigo": "MAT101",  // Opcional
  "estado": "inactiva"  // Opcional
}
```

---

### DELETE `/materias/:id`
Eliminar materia.

**Roles:** `admin`

---

## 🎓 Especialidades (`/especialidades`)

### POST `/especialidades`
Asignar especialidad a un profesor.

**Roles:** `admin`

**Request Body:**
```json
{
  "usuarioId": 2,
  "materiaId": 1
}
```

**Response:**
```json
{
  "id": "1",
  "usuarioId": "2",
  "materiaId": "1",
  "usuario": {...},
  "materia": {...}
}
```

---

### GET `/especialidades`
Listar todas las especialidades.

**Query Parameters:**
- `usuarioId` (opcional): Filtrar por ID de usuario

**Ejemplo:** `/especialidades?usuarioId=2`

**Roles:** Todos los usuarios autenticados

---

### GET `/especialidades/:id`
Obtener especialidad por ID.

**Roles:** Todos los usuarios autenticados

---

### DELETE `/especialidades/:id`
Eliminar especialidad.

**Roles:** `admin`

---

## ⏰ Disponibilidad (`/disponibilidad`)

### POST `/disponibilidad`
Crear disponibilidad de horario para un profesor.

**Roles:** `admin`, `profesor`

**Request Body:**
```json
{
  "usuarioId": 2,
  "diaSemana": "lunes",
  "horaInicio": "09:00",
  "horaFin": "11:00"
}
```

**Días válidos:** `lunes`, `martes`, `miércoles`, `jueves`, `viernes`, `sábado`, `domingo`

**Formato de hora:** `HH:mm` (24 horas)

---

### GET `/disponibilidad`
Listar disponibilidades.

**Query Parameters:**
- `usuarioId` (opcional): Filtrar por ID de usuario

**Ejemplo:** `/disponibilidad?usuarioId=2`

**Roles:** Todos los usuarios autenticados

---

### GET `/disponibilidad/:id`
Obtener disponibilidad por ID.

**Roles:** Todos los usuarios autenticados

---

### PATCH `/disponibilidad/:id`
Actualizar disponibilidad.

**Roles:** `admin`, `profesor`

**Request Body:**
```json
{
  "diaSemana": "martes",  // Opcional
  "horaInicio": "10:00",  // Opcional
  "horaFin": "12:00"      // Opcional
}
```

---

### DELETE `/disponibilidad/:id`
Eliminar disponibilidad.

**Roles:** `admin`, `profesor`

---

## 📝 Solicitudes de Tutoría (`/solicitudes`)

### POST `/solicitudes`
Crear solicitud de tutoría.

**Roles:** `estudiante`

**Request Body:**
```json
{
  "estudianteId": 3,
  "materiaId": 1,
  "fecha": "2024-03-15",
  "horaInicio": "09:00",
  "horaFin": "11:00"
}
```

**Formato de fecha:** `YYYY-MM-DD`

**Estados posibles:** `pendiente`, `aceptada`, `rechazada`, `cancelada`

**Response:**
```json
{
  "id": "1",
  "estudianteId": "3",
  "materiaId": "1",
  "fecha": "2024-03-15",
  "horaInicio": "09:00",
  "horaFin": "11:00",
  "estado": "pendiente",
  "estudiante": {...},
  "materia": {...}
}
```

---

### GET `/solicitudes`
Listar solicitudes de tutoría.

**Query Parameters:**
- `estudianteId` (opcional): Filtrar por ID de estudiante
- `materiaId` (opcional): Filtrar por ID de materia
- `estado` (opcional): Filtrar por estado (`pendiente`, `aceptada`, `rechazada`, `cancelada`)

**Ejemplos:**
- `/solicitudes?estudianteId=3`
- `/solicitudes?estado=pendiente`
- `/solicitudes?materiaId=1&estado=aceptada`

**Roles:** Todos los usuarios autenticados

---

### GET `/solicitudes/:id`
Obtener solicitud por ID.

**Roles:** Todos los usuarios autenticados

---

### PATCH `/solicitudes/:id/estado`
Cambiar estado de la solicitud.

**Roles:** 
- `admin`: Puede cambiar a cualquier estado
- `estudiante`: Solo puede cambiar a `cancelada` (sus propias solicitudes)

**Request Body:**
```json
{
  "estado": "aceptada"  // "pendiente", "aceptada", "rechazada", "cancelada"
}
```

---

### DELETE `/solicitudes/:id`
Cancelar solicitud (solo solicitudes pendientes).

**Roles:** `estudiante` (solo sus propias solicitudes)

**Response:**
```json
{
  "message": "Solicitud cancelada exitosamente"
}
```

---

## 🎯 Tutorías (`/tutorias`)

### POST `/tutorias/asignar/:solicitudId`
Asignar tutor automáticamente a una solicitud.

**Roles:** `admin`

**Descripción:** Busca automáticamente un tutor disponible basándose en:
1. Especialidad en la materia solicitada
2. Disponibilidad en el día y hora solicitados
3. Sin conflictos con otras tutorías

**Response:**
```json
{
  "id": "1",
  "solicitudId": "1",
  "tutorAsignadoId": "2",
  "estado": "programada",
  "solicitud": {...},
  "tutorAsignado": {...}
}
```

**Errores posibles:**
- `404`: No hay profesores con especialidad en esta materia
- `404`: No hay profesores disponibles en el horario solicitado
- `404`: No hay tutores disponibles sin conflictos de horario

---

### POST `/tutorias/asignar-manual`
Asignar tutor manualmente a una solicitud.

**Roles:** `admin`

**Request Body:**
```json
{
  "solicitudId": 1,
  "tutorId": 2
}
```

**Validaciones:**
- El tutor debe tener especialidad en la materia
- El tutor debe estar disponible en el horario
- No debe tener conflictos con otras tutorías

---

### GET `/tutorias`
Listar tutorías.

**Query Parameters:**
- `tutorId` (opcional): Filtrar por ID del tutor
- `estado` (opcional): Filtrar por estado (`programada`, `en_curso`, `completada`, `cancelada`)
- `fecha` (opcional): Filtrar por fecha (`YYYY-MM-DD`)

**Ejemplos:**
- `/tutorias?tutorId=2`
- `/tutorias?estado=programada`
- `/tutorias?fecha=2024-03-15`

**Roles:** Todos los usuarios autenticados

**Response:**
```json
[
  {
    "id": "1",
    "solicitudId": "1",
    "tutorAsignadoId": "2",
    "estado": "programada",
    "solicitud": {
      "id": "1",
      "estudianteId": "3",
      "materiaId": "1",
      "fecha": "2024-03-15",
      "horaInicio": "09:00",
      "horaFin": "11:00",
      "estado": "aceptada",
      "estudiante": {...},
      "materia": {...}
    },
    "tutorAsignado": {...}
  }
]
```

---

### GET `/tutorias/:id`
Obtener tutoría por ID.

**Roles:** Todos los usuarios autenticados

---

### PATCH `/tutorias/:id/estado`
Actualizar estado de la tutoría.

**Roles:** Todos los usuarios autenticados

**Request Body:**
```json
{
  "estado": "en_curso"  // "programada", "en_curso", "completada", "cancelada"
}
```

**Estados posibles:**
- `programada`: Tutoría asignada pero aún no iniciada
- `en_curso`: Tutoría en progreso
- `completada`: Tutoría finalizada
- `cancelada`: Tutoría cancelada

---

## 📊 Resumen de Roles y Permisos

| Endpoint | Admin | Profesor | Estudiante | Público |
|----------|-------|----------|------------|---------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| GET /auth/profile | ✅ | ✅ | ✅ | ❌ |
| POST /auth/change-password | ✅ | ✅ | ✅ | ❌ |
| POST /usuarios | ✅ | ❌ | ❌ | ❌ |
| GET /usuarios | ✅ | ❌ | ❌ | ❌ |
| GET /usuarios/:id | ✅* | ✅* | ✅* | ❌ |
| PATCH /usuarios/:id | ✅* | ✅* | ✅* | ❌ |
| DELETE /usuarios/:id | ✅ | ❌ | ❌ | ❌ |
| POST /roles | ✅ | ❌ | ❌ | ❌ |
| GET /roles | ✅ | ❌ | ❌ | ❌ |
| POST /materias | ✅ | ❌ | ❌ | ❌ |
| GET /materias | ✅ | ✅ | ✅ | ❌ |
| PATCH /materias/:id | ✅ | ❌ | ❌ | ❌ |
| DELETE /materias/:id | ✅ | ❌ | ❌ | ❌ |
| POST /especialidades | ✅ | ❌ | ❌ | ❌ |
| GET /especialidades | ✅ | ✅ | ✅ | ❌ |
| DELETE /especialidades/:id | ✅ | ❌ | ❌ | ❌ |
| POST /disponibilidad | ✅ | ✅ | ❌ | ❌ |
| GET /disponibilidad | ✅ | ✅ | ✅ | ❌ |
| PATCH /disponibilidad/:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /disponibilidad/:id | ✅ | ✅ | ❌ | ❌ |
| POST /solicitudes | ❌ | ❌ | ✅ | ❌ |
| GET /solicitudes | ✅ | ✅ | ✅ | ❌ |
| PATCH /solicitudes/:id/estado | ✅** | ❌ | ✅*** | ❌ |
| DELETE /solicitudes/:id | ❌ | ❌ | ✅*** | ❌ |
| POST /tutorias/asignar/:solicitudId | ✅ | ❌ | ❌ | ❌ |
| POST /tutorias/asignar-manual | ✅ | ❌ | ❌ | ❌ |
| GET /tutorias | ✅ | ✅ | ✅ | ❌ |
| PATCH /tutorias/:id/estado | ✅ | ✅ | ✅ | ❌ |

**Leyenda:**
- ✅ = Permitido
- ❌ = No permitido
- ✅* = Solo admin o el mismo usuario
- ✅** = Admin puede cambiar a cualquier estado
- ✅*** = Solo sus propias solicitudes

---

## 🔄 Flujo de Trabajo Típico

### 1. Administrador registra usuarios
```
POST /usuarios
{
  "nombre": "Profesor Ejemplo",
  "correo": "profesor@universidad.edu",
  "roles": ["profesor"]
}
```

### 2. Administrador crea materias
```
POST /materias
{
  "nombre": "Matemáticas I",
  "codigo": "MAT101"
}
```

### 3. Administrador asigna especialidades a profesores
```
POST /especialidades
{
  "usuarioId": 2,
  "materiaId": 1
}
```

### 4. Profesor define su disponibilidad
```
POST /disponibilidad
{
  "usuarioId": 2,
  "diaSemana": "lunes",
  "horaInicio": "09:00",
  "horaFin": "11:00"
}
```

### 5. Estudiante crea solicitud de tutoría
```
POST /solicitudes
{
  "estudianteId": 3,
  "materiaId": 1,
  "fecha": "2024-03-15",
  "horaInicio": "09:00",
  "horaFin": "11:00"
}
```

### 6. Administrador asigna tutor automáticamente
```
POST /tutorias/asignar/1
```

### 7. Actualizar estado de la tutoría
```
PATCH /tutorias/1/estado
{
  "estado": "completada"
}
```

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints excepto `POST /auth/login` requieren el token JWT en el header `Authorization: Bearer <token>`

2. **Soft Delete**: Todas las entidades usan soft delete, por lo que los registros eliminados se marcan con `deleted_at` pero no se eliminan físicamente

3. **Asignación Automática**: El sistema busca tutores basándose en:
   - Especialidad en la materia
   - Disponibilidad en el día y hora
   - Sin conflictos con otras tutorías

4. **Validaciones**:
   - Las fechas no pueden ser en el pasado
   - La hora de inicio debe ser menor que la hora de fin
   - No se permiten solapamientos de horarios en disponibilidad
   - Solo se pueden eliminar solicitudes en estado "pendiente"

5. **Formato de Fechas y Horas**:
   - Fechas: `YYYY-MM-DD` (ejemplo: `2024-03-15`)
   - Horas: `HH:mm` en formato 24 horas (ejemplo: `09:00`, `14:30`)

---

## 📚 Documentación Swagger

Para una documentación interactiva completa, visita:
```
http://localhost:3000/api/docs
```

En Swagger puedes:
- Ver todos los endpoints
- Probar los endpoints directamente
- Ver ejemplos de requests y responses
- Autenticarte con el botón "Authorize"

---

## 🚀 Ejemplos de Uso con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@universidad.edu",
    "contraseña": "admin123"
  }'
```

### Crear Usuario (con token)
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@universidad.edu",
    "roles": ["profesor"]
  }'
```

### Listar Materias
```bash
curl -X GET http://localhost:3000/api/materias \
  -H "Authorization: Bearer <tu_token>"
```

---

**Última actualización:** 2024
