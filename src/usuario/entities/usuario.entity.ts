import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UsuarioRol } from '../../usuario-rol/entities/usuario-rol.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';
import { Disponibilidad } from '../../disponibilidad/entities/disponibilidad.entity';
import { SolicitudTutoria } from '../../solicitud-tutoria/entities/solicitud-tutoria.entity';
import { Tutoria } from '../../tutoria/entities/tutoria.entity';

@Entity('usuario')
export class Usuario extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  nombre: string;

  @Column({ type: 'text', unique: true })
  correo: string;

  @Column({ type: 'text', name: 'contraseña' })
  contraseña: string;

  @Column({ type: 'text', nullable: true })
  estado: string;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => Especialidad, (especialidad) => especialidad.usuario)
  especialidades: Especialidad[];

  @OneToMany(() => Disponibilidad, (disponibilidad) => disponibilidad.usuario)
  disponibilidades: Disponibilidad[];

  @OneToMany(() => SolicitudTutoria, (solicitud) => solicitud.estudiante)
  solicitudes: SolicitudTutoria[];

  @OneToMany(() => Tutoria, (tutoria) => tutoria.tutorAsignado)
  tutorias: Tutoria[];
}
