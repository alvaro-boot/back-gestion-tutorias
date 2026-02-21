import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear usuario (solo admin)' })
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar usuarios (solo admin)' })
  async findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    const userId = BigInt(id);
    // Solo admin o el mismo usuario puede ver su perfil
    if (currentUser.roles?.includes('admin') || currentUser.id.toString() === userId.toString()) {
      return this.usuarioService.findOneById(userId);
    }
    throw new ForbiddenException('No autorizado');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = BigInt(id);
    // Solo admin o el mismo usuario puede actualizar
    if (currentUser.roles?.includes('admin') || currentUser.id.toString() === userId.toString()) {
      return this.usuarioService.update(userId, updateUsuarioDto);
    }
    throw new ForbiddenException('No autorizado');
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar usuario (solo admin)' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.usuarioService.remove(BigInt(id));
    return { message: 'Usuario eliminado exitosamente' };
  }

  @Post(':id/asignar-rol')
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar rol a usuario (solo admin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async asignarRol(
    @Param('id', ParseIntPipe) id: string,
    @Body('rolId', ParseIntPipe) rolId: string,
  ) {
    return this.usuarioService.asignarRol(BigInt(id), BigInt(rolId));
  }

  @Delete(':id/remover-rol/:rolId')
  @Roles('admin')
  @ApiOperation({ summary: 'Remover rol de usuario (solo admin)' })
  async removerRol(
    @Param('id', ParseIntPipe) id: string,
    @Param('rolId', ParseIntPipe) rolId: string,
  ) {
    await this.usuarioService.removerRol(BigInt(id), BigInt(rolId));
    return { message: 'Rol removido exitosamente' };
  }
}
