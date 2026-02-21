import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMateriaDto {
  @ApiProperty({ example: 'Matemáticas I', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 'MAT101', required: false })
  @IsString()
  @IsOptional()
  codigo?: string;

  @ApiProperty({ example: 'activa', required: false })
  @IsString()
  @IsOptional()
  estado?: string;
}
