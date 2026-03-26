/**
 * Copia datos de PostgreSQL origen → destino (mismas tablas que la app).
 * Origen: archivo .env.source (credenciales de la base antigua, ej. Render).
 * Destino: .env actual (Railway u otra).
 *
 * Requisito: el esquema ya debe existir en destino (p. ej. arrancar el backend
 * una vez con NODE_ENV=development para que TypeORM sincronice tablas).
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

function loadEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  readFileSync(filePath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  });
  return out;
}

function sslForHost(host: string) {
  if (!host) return false;
  if (host.includes('render.com') || host.includes('rlwy.net')) {
    return { rejectUnauthorized: false };
  }
  return false;
}

function clientFromEnv(env: Record<string, string>, label: string): Client {
  const host = env.DB_HOST;
  const port = parseInt(env.DB_PORT || '5432', 10);
  const user = env.DB_USERNAME;
  const password = env.DB_PASSWORD;
  const database = env.DB_NAME;
  if (!host || !user || password === undefined || !database) {
    throw new Error(
      `Faltan DB_HOST, DB_USERNAME, DB_PASSWORD o DB_NAME en la configuración (${label}).`,
    );
  }
  return new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: sslForHost(host),
    connectionTimeoutMillis: 30_000,
  });
}

const TABLES_ORDER = [
  'rol',
  'usuario',
  'materia',
  'usuariorol',
  'especialidad',
  'disponibilidad',
  'solicitudtutoria',
  'tutoria',
] as const;

async function resetSequenceForTable(client: Client, table: string) {
  const allowed = new Set<string>(TABLES_ORDER);
  if (!allowed.has(table)) return;
  const qualified = `public.${table}`;
  await client.query(
    `
    SELECT setval(
      (pg_get_serial_sequence($1::text, $2::text))::regclass,
      COALESCE((SELECT MAX(id) FROM ${table}), 1),
      true
    )
    `,
    [qualified, 'id'],
  );
}

async function migrate() {
  const root = join(__dirname, '../..');
  // Solo .env (no mezclar process.env para no pisar credenciales con variables vacías)
  const targetEnv = loadEnvFile(join(root, '.env'));
  const sourceEnv = loadEnvFile(join(root, '.env.source'));

  if (!sourceEnv.DB_HOST) {
    console.error(
      'No se encontró backend/.env.source con las credenciales de la base ORIGEN.',
    );
    console.error(
      'Copia .env.source.example a .env.source y rellena DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME (ej. Render).',
    );
    process.exit(1);
  }

  const sameDb =
    (sourceEnv.DB_HOST || '').trim() === (targetEnv.DB_HOST || '').trim() &&
    (sourceEnv.DB_PORT || '5432').trim() === (targetEnv.DB_PORT || '5432').trim() &&
    (sourceEnv.DB_NAME || '').trim() === (targetEnv.DB_NAME || '').trim() &&
    (sourceEnv.DB_USERNAME || '').trim() === (targetEnv.DB_USERNAME || '').trim();
  if (sameDb) {
    console.error(
      'ORIGEN y DESTINO apuntan a la misma base de datos (.env.source === .env).',
    );
    console.error(
      'Eso vaciaría la base y copiaría 0 filas. Pon en .env.source solo la base ANTIGUA (ej. Render), distinta de Railway.',
    );
    process.exit(1);
  }

  const source = clientFromEnv(sourceEnv, 'origen');
  const target = clientFromEnv(targetEnv, 'destino (.env)');

  try {
    console.log('Conectando a base ORIGEN...');
    await source.connect();
    console.log('Conectando a base DESTINO...');
    await target.connect();
    console.log('Conectado. Vaciando tablas en destino...');

    await target.query(`
      TRUNCATE TABLE
        tutoria,
        solicitudtutoria,
        especialidad,
        disponibilidad,
        usuariorol,
        usuario,
        materia,
        rol
      RESTART IDENTITY CASCADE;
    `);

    const { rows: roles } = await source.query(
      'SELECT id, nombre, created_at, updated_at, deleted_at FROM rol ORDER BY id',
    );
    for (const r of roles) {
      await target.query(
        `INSERT INTO rol (id, nombre, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5)`,
        [r.id, r.nombre, r.created_at, r.updated_at, r.deleted_at],
      );
    }
    console.log(`  rol: ${roles.length} filas`);

    const { rows: usuarios } = await source.query(
      `SELECT id, nombre, correo, "contraseña", estado, created_at, updated_at, deleted_at
       FROM usuario ORDER BY id`,
    );
    for (const r of usuarios) {
      await target.query(
        `INSERT INTO usuario (id, nombre, correo, "contraseña", estado, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          r.id,
          r.nombre,
          r.correo,
          r.contraseña,
          r.estado,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  usuario: ${usuarios.length} filas`);

    const { rows: materias } = await source.query(
      'SELECT id, nombre, codigo, estado, created_at, updated_at, deleted_at FROM materia ORDER BY id',
    );
    for (const r of materias) {
      await target.query(
        `INSERT INTO materia (id, nombre, codigo, estado, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          r.id,
          r.nombre,
          r.codigo,
          r.estado,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  materia: ${materias.length} filas`);

    const { rows: usuarioRoles } = await source.query(
      'SELECT id, usuarioid, rolid, created_at, updated_at, deleted_at FROM usuariorol ORDER BY id',
    );
    for (const r of usuarioRoles) {
      await target.query(
        `INSERT INTO usuariorol (id, usuarioid, rolid, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          r.id,
          r.usuarioid,
          r.rolid,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  usuariorol: ${usuarioRoles.length} filas`);

    const { rows: especialidades } = await source.query(
      'SELECT id, usuarioid, materiaid, created_at, updated_at, deleted_at FROM especialidad ORDER BY id',
    );
    for (const r of especialidades) {
      await target.query(
        `INSERT INTO especialidad (id, usuarioid, materiaid, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          r.id,
          r.usuarioid,
          r.materiaid,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  especialidad: ${especialidades.length} filas`);

    const { rows: disponibilidades } = await source.query(
      'SELECT id, usuarioid, diasemana, horainicio, horafin, created_at, updated_at, deleted_at FROM disponibilidad ORDER BY id',
    );
    for (const r of disponibilidades) {
      await target.query(
        `INSERT INTO disponibilidad (id, usuarioid, diasemana, horainicio, horafin, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          r.id,
          r.usuarioid,
          r.diasemana,
          r.horainicio,
          r.horafin,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  disponibilidad: ${disponibilidades.length} filas`);

    const { rows: solicitudes } = await source.query(
      `SELECT id, estudianteid, materiaid, fecha, horainicio, horafin, estado, created_at, updated_at, deleted_at
       FROM solicitudtutoria ORDER BY id`,
    );
    for (const r of solicitudes) {
      await target.query(
        `INSERT INTO solicitudtutoria (id, estudianteid, materiaid, fecha, horainicio, horafin, estado, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          r.id,
          r.estudianteid,
          r.materiaid,
          r.fecha,
          r.horainicio,
          r.horafin,
          r.estado,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  solicitudtutoria: ${solicitudes.length} filas`);

    const { rows: tutorias } = await source.query(
      'SELECT id, solicitudid, tutorasignadoid, estado, created_at, updated_at, deleted_at FROM tutoria ORDER BY id',
    );
    for (const r of tutorias) {
      await target.query(
        `INSERT INTO tutoria (id, solicitudid, tutorasignadoid, estado, created_at, updated_at, deleted_at)
         OVERRIDING SYSTEM VALUE VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          r.id,
          r.solicitudid,
          r.tutorasignadoid,
          r.estado,
          r.created_at,
          r.updated_at,
          r.deleted_at,
        ],
      );
    }
    console.log(`  tutoria: ${tutorias.length} filas`);

    console.log('Ajustando secuencias de IDs...');
    for (const t of TABLES_ORDER) {
      await resetSequenceForTable(target, t);
    }

    console.log('\nMigración de datos completada.');
  } finally {
    try {
      await source.end();
    } catch {
      /* no conectó */
    }
    try {
      await target.end();
    } catch {
      /* no conectó */
    }
  }
}

migrate().catch((err) => {
  console.error(
    '\nSi falla el ORIGEN: la base en Render puede estar suspendida o las credenciales cambiaron.',
  );
  console.error(
    'Si falla el DESTINO: revisa host/puerto SSL de Railway en .env.\n',
  );
  console.error(err);
  process.exit(1);
});
