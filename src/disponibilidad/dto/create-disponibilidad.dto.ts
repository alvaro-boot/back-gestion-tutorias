import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisponibilidadDto {
  @ApiProperty({ example: 1, description: 'ID del usuario (profesor)' })
  @IsNotEmpty()
  usuarioId: bigint;

  @ApiProperty({ example: 'lunes', description: 'Día de la semana' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)$/i, {
    message: 'Día de la semana inválido',
  })
  diaSemana: string;

  @ApiProperty({ example: '09:00', description: 'Hora de inicio (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (debe ser HH:mm)',
  })
  horaInicio: string;

  @ApiProperty({ example: '11:00', description: 'Hora de fin (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido (debe ser HH:mm)',
  })
  horaFin: string;
}
