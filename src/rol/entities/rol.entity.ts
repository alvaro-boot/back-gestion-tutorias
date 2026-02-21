import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UsuarioRol } from '../../usuario-rol/entities/usuario-rol.entity';

@Entity('rol')
export class Rol extends BaseEntity {
  @Column({ type: 'text' })
  nombre: string;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarioRoles: UsuarioRol[];
}
