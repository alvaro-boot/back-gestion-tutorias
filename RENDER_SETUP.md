# Configuración de Render.com

## ⚠️ IMPORTANTE: Configuración Requerida

El proyecto **debe compilarse** antes de ejecutarse. Render necesita configurarse correctamente.

## Configuración en el Dashboard de Render

### 1. Build Command
```
npm run render:build
```

O alternativamente:
```
npm install && npm run build
```

### 2. Start Command
```
npm run start:prod
```

## Variables de Entorno

Configura estas variables de entorno en Render:

```
NODE_ENV=production
DB_HOST=dpg-d6d4e65m5p6s73f5dm0g-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=gestion_tutorias_user
DB_PASSWORD=7LFadVcxfbwy3A4VruL1jkKYrpiaWCZe
DB_NAME=gestion_tutorias
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h
```

**Nota:** Render asigna automáticamente el puerto, no necesitas configurar `PORT` manualmente.

## Pasos para Configurar

1. Ve a tu servicio web en Render
2. Haz clic en "Settings" o "Configuración"
3. En "Build Command", cambia de `npm install` a:
   ```
   npm run render:build
   ```
4. En "Start Command", asegúrate de que sea:
   ```
   npm run start:prod
   ```
5. Guarda los cambios
6. Render hará un nuevo despliegue automáticamente

## Verificación

Después del despliegue, verifica que:
- El build se complete sin errores
- La aplicación se inicie correctamente
- Puedas acceder a la API en la URL proporcionada por Render
