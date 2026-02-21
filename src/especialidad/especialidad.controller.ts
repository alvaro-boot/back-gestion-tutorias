import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Especialidades')
@Controller('especialidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar especialidad a profesor (solo admin)' })
  async create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadService.create(createEspecialidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar especialidades' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number })
  async findAll(@Query('usuarioId') usuarioId?: string) {
    return this.especialidadService.findAll(
      usuarioId ? BigInt(usuarioId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener especialidad por ID' })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.especialidadService.findOne(BigInt(id));
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar especialidad (solo admin)' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.especialidadService.remove(BigInt(id));
    return { message: 'Especialidad eliminada exitosamente' };
  }
}
