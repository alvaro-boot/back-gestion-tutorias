import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('disponibilidad')
export class Disponibilidad extends BaseEntity {
  @Column({ type: 'bigint', name: 'usuarioid' })
  usuarioId: bigint;

  @Column({ type: 'text', name: 'diasemana' })
  diaSemana: string;

  @Column({ type: 'time', name: 'horainicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'horafin' })
  horaFin: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.disponibilidades)
  @JoinColumn({ name: 'usuarioid' })
  usuario: Usuario;
}
