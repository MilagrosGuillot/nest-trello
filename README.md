# GiraPoint - README

## Credenciales de ejemplo

- **Usuario:** pepito@ejemplo.com
- **Contraseña:** la que usaste al registrar (o crea el usuario desde el registro)

Puedes crear nuevos usuarios desde el formulario de registro.

---

## Credenciales de Base de Datos (Variables de entorno)

Tener un archivo `.env` en la carpeta `backend` con las siguientes variables:

```
DATABASE_URL="mongodb://localhost:27017/trello"

JWT_SECRET=""
---

## Endpoints principales (Backend)

### Autenticación
- `POST /auth/login` - Iniciar sesión (body: `{ email, password }`)
- `POST /auth/register` - Registrar usuario (body: `{ email, password, name }`)

### Usuarios
- `GET /users/search?email=...` - Buscar usuario por email
- `GET /users` - Listar todos los usuarios

### Tableros (Boards)
- `GET /boards` - Listar tableros del usuario autenticado
- `GET /boards/:id` - Obtener un tablero por ID
- `POST /boards` - Crear tablero (body: `{ title }`)
- `PATCH /boards/:id` - Editar título de tablero
- `DELETE /boards/:id` - Eliminar tablero
- `POST /boards/:id/members` - Agregar miembro a tablero (body: `{ userId }` o `{ email }` según implementación)
- `DELETE /boards/:id/members/:memberId` - Eliminar miembro

### Listas (Lists)
- `GET /lists/board/:boardId` - Listar listas de un tablero
- `POST /lists` - Crear lista (body: `{ title, order, boardId }`)
- `PUT /lists/:id` - Editar lista
- `DELETE /lists/:id` - Eliminar lista

### Tarjetas (Cards)
- `GET /cards/board/:boardId` - Listar tarjetas de un tablero
- `POST /cards` - Crear tarjeta (body: `{ title, description, order, listId }`)
- `PATCH /cards/:id` - Editar tarjeta
- `DELETE /cards/:id` - Eliminar tarjeta

---

> **Nota:** Todos los endpoints (excepto login, register y búsqueda de usuario) requieren autenticación mediante JWT en el header `Authorization: Bearer <token>`. 