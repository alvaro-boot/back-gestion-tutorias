import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilidadService } from './disponibilidad.service';
import { DisponibilidadController } from './disponibilidad.controller';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disponibilidad]),
    UsuarioModule,
  ],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
  exports: [DisponibilidadService],
})
export class DisponibilidadModule {}
