import { IsNotEmpty, IsDateString, IsString, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSolicitudTutoriaDto {
  @ApiProperty({ example: 1, description: 'ID del estudiante (opcional, se usa el usuario autenticado)', required: false })
  @IsOptional()
  estudianteId?: bigint;

  @ApiProperty({ example: 1, description: 'ID de la materia' })
  @IsNotEmpty()
  materiaId: bigint;

  @ApiProperty({ example: '2024-03-15', description: 'Fecha de la tutoría (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

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
