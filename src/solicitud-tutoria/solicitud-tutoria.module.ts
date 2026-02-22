import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudTutoriaService } from './solicitud-tutoria.service';
import { SolicitudTutoriaController } from './solicitud-tutoria.controller';
import { SolicitudTutoria } from './entities/solicitud-tutoria.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { MateriaModule } from '../materia/materia.module';
import { TutoriaModule } from '../tutoria/tutoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudTutoria]),
    UsuarioModule,
    MateriaModule,
    forwardRef(() => TutoriaModule),
  ],
  controllers: [SolicitudTutoriaController],
  providers: [SolicitudTutoriaService],
  exports: [SolicitudTutoriaService],
})
export class SolicitudTutoriaModule {}
