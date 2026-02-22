# Configuración para Render.com

## Configuración del Servicio Web

### Build Command
```
npm install && npm run build
```

**Nota:** El script `postinstall` también intentará compilar automáticamente si detecta que está en Render o producción, pero es recomendable usar el Build Command explícito.

### Start Command
```
npm run start:prod
```

## Variables de Entorno Requeridas

Asegúrate de configurar las siguientes variables de entorno en Render:

```
NODE_ENV=production
DB_HOST=dpg-d6d4e65m5p6s73f5dm0g-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=gestion_tutorias_user
DB_PASSWORD=7LFadVcxfbwy3A4VruL1jkKYrpiaWCZe
DB_NAME=gestion_tutorias
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h
PORT=10000
```

## Notas Importantes

1. **Puerto:** Render asigna automáticamente un puerto. La aplicación usa `process.env.PORT` que Render proporciona automáticamente.

2. **SSL:** La conexión a la base de datos PostgreSQL de Render requiere SSL, que está configurado automáticamente en `database.config.ts`.

3. **Build:** El proyecto debe compilarse antes de ejecutarse. El script `postinstall` intentará compilar automáticamente, pero es mejor usar el Build Command explícito.

4. **Dependencias:** Asegúrate de que Render instale las devDependencies durante el build (esto es el comportamiento por defecto).
