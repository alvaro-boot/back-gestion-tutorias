import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarTutorManualDto {
  @ApiProperty({ example: 1, description: 'ID de la solicitud de tutoría' })
  @IsNumber()
  @IsNotEmpty()
  solicitudId: bigint;

  @ApiProperty({ example: 2, description: 'ID del tutor a asignar' })
  @IsNumber()
  @IsNotEmpty()
  tutorId: bigint;
}
