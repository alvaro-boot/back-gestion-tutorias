import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Rol } from '../../rol/entities/rol.entity';

@Entity('usuariorol')
export class UsuarioRol extends BaseEntity {
  @Column({ type: 'bigint', name: 'usuarioid' })
  usuarioId: bigint;

  @Column({ type: 'bigint', name: 'rolid' })
  rolId: bigint;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles)
  @JoinColumn({ name: 'usuarioid' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles)
  @JoinColumn({ name: 'rolid' })
  rol: Rol;
}
