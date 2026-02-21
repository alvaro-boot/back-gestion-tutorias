import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadController } from './especialidad.controller';
import { Especialidad } from './entities/especialidad.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { MateriaModule } from '../materia/materia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Especialidad]),
    UsuarioModule,
    MateriaModule,
  ],
  controllers: [EspecialidadController],
  providers: [EspecialidadService],
  exports: [EspecialidadService],
})
export class EspecialidadModule {}
