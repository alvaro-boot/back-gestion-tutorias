import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 'juan.perez@universidad.edu', required: false })
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: 'activo', required: false })
  @IsString()
  @IsOptional()
  estado?: string;
}
