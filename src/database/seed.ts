import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Rol } from '../rol/entities/rol.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity';
import { Materia } from '../materia/entities/materia.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Disponibilidad } from '../disponibilidad/entities/disponibilidad.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);

  const rolRepository = dataSource.getRepository(Rol);
  const usuarioRepository = dataSource.getRepository(Usuario);
  const usuarioRolRepository = dataSource.getRepository(UsuarioRol);
  const materiaRepository = dataSource.getRepository(Materia);
  const especialidadRepository = dataSource.getRepository(Especialidad);
  const disponibilidadRepository = dataSource.getRepository(Disponibilidad);

  try {
    console.log('Iniciando seed de datos...\n');

    // 1. Crear roles base
    console.log('📋 Creando roles...');
    const rolesBase = ['admin', 'profesor', 'estudiante'];
    const rolesCreados: Rol[] = [];

    for (const nombreRol of rolesBase) {
      let rol = await rolRepository.findOne({ where: { nombre: nombreRol } });
      if (!rol) {
        rol = rolRepository.create({ nombre: nombreRol });
        rol = await rolRepository.save(rol);
        console.log(`  ✓ Rol '${nombreRol}' creado`);
      } else {
        console.log(`  ✓ Rol '${nombreRol}' ya existe`);
      }
      rolesCreados.push(rol);
    }

    // 2. Crear usuario administrador
    console.log('\n👤 Creando usuario administrador...');
    const adminEmail = configService.get<string>('ADMIN_EMAIL') || 'admin@universidad.edu';
    const adminPassword = configService.get<string>('ADMIN_PASSWORD') || 'admin123';
    const adminNombre = configService.get<string>('ADMIN_NOMBRE') || 'Administrador';

    let admin = await usuarioRepository.findOne({ where: { correo: adminEmail } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = usuarioRepository.create({
        nombre: adminNombre,
        correo: adminEmail,
        contraseña: hashedPassword,
        estado: 'activo',
      });
      admin = await usuarioRepository.save(admin);
      console.log(`  ✓ Usuario administrador creado: ${adminEmail}`);

      // Asignar rol de admin
      const rolAdmin = rolesCreados.find((r) => r.nombre === 'admin');
      if (rolAdmin) {
        const usuarioRol = usuarioRolRepository.create({
          usuarioId: admin.id,
          rolId: rolAdmin.id,
        });
        await usuarioRolRepository.save(usuarioRol);
        console.log(`  ✓ Rol 'admin' asignado al usuario administrador`);
      }
    } else {
      console.log(`  ✓ Usuario administrador ya existe: ${adminEmail}`);
    }

    // 3. Crear usuarios de ejemplo (profesores y estudiantes)
    console.log('\n👥 Creando usuarios de ejemplo...');
    const usuariosEjemplo = [
      {
        nombre: 'Prof. María González',
        correo: 'maria.gonzalez@universidad.edu',
        contraseña: 'profesor123',
        estado: 'activo',
        rol: 'profesor',
      },
      {
        nombre: 'Prof. Carlos Rodríguez',
        correo: 'carlos.rodriguez@universidad.edu',
        contraseña: 'profesor123',
        estado: 'activo',
        rol: 'profesor',
      },
      {
        nombre: 'Prof. Ana Martínez',
        correo: 'ana.martinez@universidad.edu',
        contraseña: 'profesor123',
        estado: 'activo',
        rol: 'profesor',
      },
      {
        nombre: 'Estudiante Juan Pérez',
        correo: 'juan.perez@universidad.edu',
        contraseña: 'estudiante123',
        estado: 'activo',
        rol: 'estudiante',
      },
      {
        nombre: 'Estudiante Laura Sánchez',
        correo: 'laura.sanchez@universidad.edu',
        contraseña: 'estudiante123',
        estado: 'activo',
        rol: 'estudiante',
      },
      {
        nombre: 'Estudiante Pedro López',
        correo: 'pedro.lopez@universidad.edu',
        contraseña: 'estudiante123',
        estado: 'activo',
        rol: 'estudiante',
      },
    ];

    const usuariosCreados: Usuario[] = [];
    for (const usuario of usuariosEjemplo) {
      let usuarioExistente = await usuarioRepository.findOne({ where: { correo: usuario.correo } });
      if (!usuarioExistente) {
        const hashedPassword = await bcrypt.hash(usuario.contraseña, 10);
        usuarioExistente = usuarioRepository.create({
          nombre: usuario.nombre,
          correo: usuario.correo,
          contraseña: hashedPassword,
          estado: usuario.estado,
        });
        usuarioExistente = await usuarioRepository.save(usuarioExistente);
        console.log(`  ✓ Usuario creado: ${usuario.nombre} (${usuario.correo})`);

        // Asignar rol
        const rol = rolesCreados.find((r) => r.nombre === usuario.rol);
        if (rol) {
          const usuarioRol = usuarioRolRepository.create({
            usuarioId: usuarioExistente.id,
            rolId: rol.id,
          });
          await usuarioRolRepository.save(usuarioRol);
        }
      } else {
        console.log(`  ✓ Usuario ya existe: ${usuario.nombre}`);
      }
      usuariosCreados.push(usuarioExistente);
    }

    // 4. Crear materias de ejemplo
    console.log('\n📚 Creando materias...');
    const materiasEjemplo = [
      { nombre: 'Matemáticas I', codigo: 'MAT101', estado: 'activo' },
      { nombre: 'Física General', codigo: 'FIS101', estado: 'activo' },
      { nombre: 'Programación I', codigo: 'PRO101', estado: 'activo' },
      { nombre: 'Base de Datos', codigo: 'BD201', estado: 'activo' },
      { nombre: 'Álgebra Lineal', codigo: 'ALG201', estado: 'activo' },
      { nombre: 'Cálculo Diferencial', codigo: 'CAL101', estado: 'activo' },
    ];

    const materiasCreadas: Materia[] = [];
    for (const materiaData of materiasEjemplo) {
      let materia = await materiaRepository.findOne({ where: { codigo: materiaData.codigo } });
      if (!materia) {
        materia = materiaRepository.create(materiaData);
        materia = await materiaRepository.save(materia);
        console.log(`  ✓ Materia creada: ${materiaData.nombre} (${materiaData.codigo})`);
      } else {
        console.log(`  ✓ Materia ya existe: ${materiaData.nombre}`);
      }
      materiasCreadas.push(materia);
    }

    // 5. Crear especialidades (asignar materias a profesores)
    console.log('\n🎓 Creando especialidades...');
    const profesores = usuariosCreados.filter((u) => {
      const usuarioData = usuariosEjemplo.find((ud) => ud.correo === u.correo);
      return usuarioData?.rol === 'profesor';
    });

    const especialidadesEjemplo = [
      { profesor: profesores[0], materias: [materiasCreadas[0], materiasCreadas[5]] }, // María: Matemáticas I, Cálculo
      { profesor: profesores[1], materias: [materiasCreadas[1], materiasCreadas[4]] }, // Carlos: Física, Álgebra
      { profesor: profesores[2], materias: [materiasCreadas[2], materiasCreadas[3]] }, // Ana: Programación, BD
    ];

    for (const especialidadData of especialidadesEjemplo) {
      if (!especialidadData.profesor) continue;
      
      for (const materia of especialidadData.materias) {
        const especialidadExistente = await especialidadRepository.findOne({
          where: {
            usuarioId: especialidadData.profesor.id,
            materiaId: materia.id,
          },
        });

        if (!especialidadExistente) {
          const especialidad = especialidadRepository.create({
            usuarioId: especialidadData.profesor.id,
            materiaId: materia.id,
          });
          await especialidadRepository.save(especialidad);
          console.log(`  ✓ Especialidad creada: ${especialidadData.profesor.nombre} - ${materia.nombre}`);
        }
      }
    }

    // 6. Crear disponibilidades de ejemplo para profesores
    console.log('\n⏰ Creando disponibilidades...');
    const disponibilidadesEjemplo = [
      { profesor: profesores[0], diaSemana: 'Lunes', horaInicio: '09:00', horaFin: '12:00' },
      { profesor: profesores[0], diaSemana: 'Miércoles', horaInicio: '14:00', horaFin: '17:00' },
      { profesor: profesores[1], diaSemana: 'Martes', horaInicio: '10:00', horaFin: '13:00' },
      { profesor: profesores[1], diaSemana: 'Jueves', horaInicio: '15:00', horaFin: '18:00' },
      { profesor: profesores[2], diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '11:00' },
      { profesor: profesores[2], diaSemana: 'Viernes', horaInicio: '13:00', horaFin: '16:00' },
    ];

    for (const dispData of disponibilidadesEjemplo) {
      if (!dispData.profesor) continue;

      const dispExistente = await disponibilidadRepository.findOne({
        where: {
          usuarioId: dispData.profesor.id,
          diaSemana: dispData.diaSemana,
          horaInicio: dispData.horaInicio,
        },
      });

      if (!dispExistente) {
        const disponibilidad = disponibilidadRepository.create({
          usuarioId: dispData.profesor.id,
          diaSemana: dispData.diaSemana,
          horaInicio: dispData.horaInicio,
          horaFin: dispData.horaFin,
        });
        await disponibilidadRepository.save(disponibilidad);
        console.log(`  ✓ Disponibilidad creada: ${dispData.profesor.nombre} - ${dispData.diaSemana} ${dispData.horaInicio}-${dispData.horaFin}`);
      }
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('\n👨‍💼 Administrador:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Contraseña: ${adminPassword}`);
    console.log('\n👨‍🏫 Profesores (todos con contraseña: profesor123):');
    usuariosEjemplo
      .filter((u) => u.rol === 'profesor')
      .forEach((u) => console.log(`   ${u.nombre}: ${u.correo}`));
    console.log('\n👨‍🎓 Estudiantes (todos con contraseña: estudiante123):');
    usuariosEjemplo
      .filter((u) => u.rol === 'estudiante')
      .forEach((u) => console.log(`   ${u.nombre}: ${u.correo}`));
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();
