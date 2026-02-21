import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Materia } from '../../materia/entities/materia.entity';
import { Tutoria } from '../../tutoria/entities/tutoria.entity';

@Entity('solicitudtutoria')
export class SolicitudTutoria extends BaseEntity {
  @Column({ type: 'bigint', name: 'estudianteid' })
  estudianteId: bigint;

  @Column({ type: 'bigint', name: 'materiaid' })
  materiaId: bigint;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', name: 'horainicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'horafin' })
  horaFin: string;

  @Column({ type: 'text', default: 'pendiente' })
  estado: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.solicitudes)
  @JoinColumn({ name: 'estudianteid' })
  estudiante: Usuario;

  @ManyToOne(() => Materia, (materia) => materia.solicitudes)
  @JoinColumn({ name: 'materiaid' })
  materia: Materia;

  @OneToOne(() => Tutoria, (tutoria) => tutoria.solicitud)
  tutoria: Tutoria;
}
