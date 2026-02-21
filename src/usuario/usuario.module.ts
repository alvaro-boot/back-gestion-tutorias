import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity';
import { RolModule } from '../rol/rol.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioRol]),
    RolModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
