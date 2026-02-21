import { IsEmail, IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@universidad.edu' })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  contraseña?: string;

  @ApiProperty({ example: 'activo', required: false })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ example: ['profesor'], description: 'Roles a asignar al usuario' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  roles: string[];
}
