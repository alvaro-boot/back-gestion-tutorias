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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear rol (solo admin)' })
  async create(@Body() createRolDto: CreateRolDto) {
    return this.rolService.create(createRolDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar roles (solo admin)' })
  async findAll() {
    return this.rolService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener rol por ID (solo admin)' })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.rolService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar rol (solo admin)' })
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    return this.rolService.update(BigInt(id), updateRolDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar rol (solo admin)' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.rolService.remove(BigInt(id));
    return { message: 'Rol eliminado exitosamente' };
  }
}
