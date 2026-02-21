import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TutoriaService } from './tutoria.service';
import { AsignarTutorManualDto } from './dto/asignar-tutor-manual.dto';
import { UpdateEstadoTutoriaDto } from './dto/update-estado-tutoria.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Tutorías')
@Controller('tutorias')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TutoriaController {
  constructor(private readonly tutoriaService: TutoriaService) {}

  @Post('asignar/:solicitudId')
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar tutor automáticamente (solo admin)' })
  async asignarTutorAutomatico(@Param('solicitudId', ParseIntPipe) solicitudId: string) {
    return this.tutoriaService.asignarTutorAutomatico(BigInt(solicitudId));
  }

  @Post('asignar-manual')
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar tutor manualmente (solo admin)' })
  async asignarTutorManual(@Body() asignarTutorDto: AsignarTutorManualDto) {
    return this.tutoriaService.asignarTutorManual(asignarTutorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tutorías' })
  @ApiQuery({ name: 'tutorId', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false, enum: ['programada', 'en_curso', 'completada', 'cancelada'] })
  @ApiQuery({ name: 'fecha', required: false, type: String })
  async findAll(
    @Query('tutorId') tutorId?: string,
    @Query('estado') estado?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.tutoriaService.findAll({
      tutorId: tutorId ? BigInt(tutorId) : undefined,
      estado,
      fecha: fecha ? new Date(fecha) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tutoría por ID' })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.tutoriaService.findOne(BigInt(id));
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de tutoría' })
  async updateEstado(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateEstadoDto: UpdateEstadoTutoriaDto,
  ) {
    return this.tutoriaService.updateEstado(BigInt(id), updateEstadoDto);
  }
}
