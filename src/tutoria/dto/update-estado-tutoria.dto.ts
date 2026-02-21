import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEstadoTutoriaDto {
  @ApiProperty({ example: 'en_curso', enum: ['programada', 'en_curso', 'completada', 'cancelada'] })
  @IsString()
  @IsIn(['programada', 'en_curso', 'completada', 'cancelada'])
  estado: string;
}
