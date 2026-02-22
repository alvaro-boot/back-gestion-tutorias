import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutoriaService } from './tutoria.service';
import { TutoriaController } from './tutoria.controller';
import { Tutoria } from './entities/tutoria.entity';
import { SolicitudTutoria } from '../solicitud-tutoria/entities/solicitud-tutoria.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Disponibilidad } from '../disponibilidad/entities/disponibilidad.entity';
import { SolicitudTutoriaModule } from '../solicitud-tutoria/solicitud-tutoria.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tutoria, SolicitudTutoria, Especialidad, Disponibilidad]),
    forwardRef(() => SolicitudTutoriaModule),
    UsuarioModule,
  ],
  controllers: [TutoriaController],
  providers: [TutoriaService],
  exports: [TutoriaService],
})
export class TutoriaModule {}
