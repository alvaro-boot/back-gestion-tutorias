import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEspecialidadDto {
  @ApiProperty({ example: 1, description: 'ID del usuario (profesor)' })
  @IsNumber()
  @IsNotEmpty()
  usuarioId: bigint;

  @ApiProperty({ example: 1, description: 'ID de la materia' })
  @IsNumber()
  @IsNotEmpty()
  materiaId: bigint;
}
