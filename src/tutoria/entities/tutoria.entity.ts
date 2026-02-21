import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SolicitudTutoria } from '../../solicitud-tutoria/entities/solicitud-tutoria.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('tutoria')
export class Tutoria extends BaseEntity {
  @Column({ type: 'bigint', name: 'solicitudid', unique: true })
  solicitudId: bigint;

  @Column({ type: 'bigint', name: 'tutorasignadoid' })
  tutorAsignadoId: bigint;

  @Column({ type: 'text', default: 'programada' })
  estado: string;

  @ManyToOne(() => SolicitudTutoria, (solicitud) => solicitud.tutoria)
  @JoinColumn({ name: 'solicitudid' })
  solicitud: SolicitudTutoria;

  @ManyToOne(() => Usuario, (usuario) => usuario.tutorias)
  @JoinColumn({ name: 'tutorasignadoid' })
  tutorAsignado: Usuario;
}
