import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RolModule } from './rol/rol.module';
import { MateriaModule } from './materia/materia.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { SolicitudTutoriaModule } from './solicitud-tutoria/solicitud-tutoria.module';
import { TutoriaModule } from './tutoria/tutoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    UsuarioModule,
    RolModule,
    MateriaModule,
    EspecialidadModule,
    DisponibilidadModule,
    SolicitudTutoriaModule,
    TutoriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
