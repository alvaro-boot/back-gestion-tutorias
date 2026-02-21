import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMateriaDto {
  @ApiProperty({ example: 'Matemáticas I' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'MAT101' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'activa', required: false })
  @IsString()
  @IsOptional()
  estado?: string;
}
