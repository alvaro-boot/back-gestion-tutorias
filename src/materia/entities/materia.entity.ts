import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Especialidad } from '../../especialidad/entities/especialidad.entity';
import { SolicitudTutoria } from '../../solicitud-tutoria/entities/solicitud-tutoria.entity';

@Entity('materia')
export class Materia extends BaseEntity {
  @Column({ type: 'text' })
  nombre: string;

  @Column({ type: 'text', unique: true })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  estado: string;

  @OneToMany(() => Especialidad, (especialidad) => especialidad.materia)
  especialidades: Especialidad[];

  @OneToMany(() => SolicitudTutoria, (solicitud) => solicitud.materia)
  solicitudes: SolicitudTutoria[];
}
