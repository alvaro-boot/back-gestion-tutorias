import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoSolicitudDto {
  @ApiProperty({ example: 'aceptada', enum: ['pendiente', 'aceptada', 'rechazada', 'cancelada'] })
  @IsString()
  @IsIn(['pendiente', 'aceptada', 'rechazada', 'cancelada'])
  estado: string;
}
