import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioRol } from './entities/usuario-rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioRol])],
  exports: [TypeOrmModule],
})
export class UsuarioRolModule {}
