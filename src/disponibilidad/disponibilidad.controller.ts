import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Disponibilidad')
@Controller('disponibilidad')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DisponibilidadController {
  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Post()
  @Roles('admin', 'profesor')
  @ApiOperation({ summary: 'Crear disponibilidad' })
  async create(@Body() createDisponibilidadDto: CreateDisponibilidadDto) {
    return this.disponibilidadService.create(createDisponibilidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar disponibilidades' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number })
  async findAll(@Query('usuarioId') usuarioId?: string) {
    return this.disponibilidadService.findAll(
      usuarioId ? BigInt(usuarioId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener disponibilidad por ID' })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.disponibilidadService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles('admin', 'profesor')
  @ApiOperation({ summary: 'Actualizar disponibilidad' })
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateDisponibilidadDto: UpdateDisponibilidadDto,
  ) {
    return this.disponibilidadService.update(BigInt(id), updateDisponibilidadDto);
  }

  @Delete(':id')
  @Roles('admin', 'profesor')
  @ApiOperation({ summary: 'Eliminar disponibilidad' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.disponibilidadService.remove(BigInt(id));
    return { message: 'Disponibilidad eliminada exitosamente' };
  }
}
