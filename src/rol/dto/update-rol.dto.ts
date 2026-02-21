import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolDto {
  @ApiProperty({ example: 'administrador', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;
}
