import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
