import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDisponibilidadDto {
  @ApiProperty({ example: 'martes', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)$/i, {
    message: 'Día de la semana inválido',
  })
  diaSemana?: string;

  @ApiProperty({ example: '10:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (debe ser HH:mm)',
  })
  horaInicio?: string;

  @ApiProperty({ example: '12:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (debe ser HH:mm)',
  })
  horaFin?: string;
}
