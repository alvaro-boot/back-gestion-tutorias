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
import { MateriaService } from './materia.service';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Materias')
@Controller('materias')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear materia (solo admin)' })
  async create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiaService.create(createMateriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar materias' })
  async findAll() {
    return this.materiaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener materia por ID' })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.materiaService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar materia (solo admin)' })
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateMateriaDto: UpdateMateriaDto,
  ) {
    return this.materiaService.update(BigInt(id), updateMateriaDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar materia (solo admin)' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.materiaService.remove(BigInt(id));
    return { message: 'Materia eliminada exitosamente' };
  }
}
