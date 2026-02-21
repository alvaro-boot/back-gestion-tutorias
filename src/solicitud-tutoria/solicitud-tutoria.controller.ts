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
  Param as ParamDecorator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SolicitudTutoriaService } from './solicitud-tutoria.service';
import { CreateSolicitudTutoriaDto } from './dto/create-solicitud-tutoria.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado-solicitud.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Solicitudes de Tutoría')
@Controller('solicitudes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SolicitudTutoriaController {
  constructor(private readonly solicitudTutoriaService: SolicitudTutoriaService) {}

  @Post()
  @Roles('estudiante')
  @ApiOperation({ summary: 'Crear solicitud de tutoría (solo estudiantes)' })
  async create(
    @Body() createSolicitudDto: CreateSolicitudTutoriaDto,
    @CurrentUser() user: any,
  ) {
    return this.solicitudTutoriaService.create(createSolicitudDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes' })
  @ApiQuery({ name: 'estudianteId', required: false, type: Number })
  @ApiQuery({ name: 'materiaId', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false, enum: ['pendiente', 'aceptada', 'rechazada', 'cancelada'] })
  async findAll(
    @Query('estudianteId') estudianteId?: string,
    @Query('materiaId') materiaId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.solicitudTutoriaService.findAll({
      estudianteId: estudianteId ? BigInt(estudianteId) : undefined,
      materiaId: materiaId ? BigInt(materiaId) : undefined,
      estado,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  async findOne(@ParamDecorator('id', ParseIntPipe) id: string) {
    return this.solicitudTutoriaService.findOne(BigInt(id));
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de solicitud' })
  async updateEstado(
    @ParamDecorator('id', ParseIntPipe) id: string,
    @Body() updateEstadoDto: UpdateEstadoSolicitudDto,
    @CurrentUser() user: any,
  ) {
    return this.solicitudTutoriaService.updateEstado(
      BigInt(id),
      updateEstadoDto,
      user.id,
      user.roles || [],
    );
  }

  @Delete(':id')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Cancelar solicitud (solo estudiantes)' })
  async remove(
    @ParamDecorator('id', ParseIntPipe) id: string,
    @CurrentUser() user: any,
  ) {
    await this.solicitudTutoriaService.remove(BigInt(id), user.id);
    return { message: 'Solicitud cancelada exitosamente' };
  }
}
