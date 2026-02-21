import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Materia } from '../../materia/entities/materia.entity';

@Entity('especialidad')
export class Especialidad extends BaseEntity {
  @Column({ type: 'bigint', name: 'usuarioid' })
  usuarioId: bigint;

  @Column({ type: 'bigint', name: 'materiaid' })
  materiaId: bigint;

  @ManyToOne(() => Usuario, (usuario) => usuario.especialidades)
  @JoinColumn({ name: 'usuarioid' })
  usuario: Usuario;

  @ManyToOne(() => Materia, (materia) => materia.especialidades)
  @JoinColumn({ name: 'materiaid' })
  materia: Materia;
}
