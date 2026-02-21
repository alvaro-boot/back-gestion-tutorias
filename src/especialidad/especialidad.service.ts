import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especialidad } from './entities/especialidad.entity';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { MateriaService } from '../materia/materia.service';

@Injectable()
export class EspecialidadService {
  constructor(
    @InjectRepository(Especialidad)
    private especialidadRepository: Repository<Especialidad>,
    private usuarioService: UsuarioService,
    private materiaService: MateriaService,
  ) {}

  async create(createEspecialidadDto: CreateEspecialidadDto): Promise<Especialidad> {
    // Verificar que el usuario existe
    const usuario = await this.usuarioService.findOneById(createEspecialidadDto.usuarioId);
    
    // Verificar que la materia existe
    await this.materiaService.findOne(createEspecialidadDto.materiaId);

    // Verificar si ya existe esta especialidad
    const existing = await this.especialidadRepository.findOne({
      where: {
        usuarioId: createEspecialidadDto.usuarioId,
        materiaId: createEspecialidadDto.materiaId,
      },
    });

    if (existing) {
      throw new ConflictException('El profesor ya tiene esta especialidad asignada');
    }

    const especialidad = this.especialidadRepository.create(createEspecialidadDto);
    return this.especialidadRepository.save(especialidad);
  }

  async findAll(usuarioId?: bigint): Promise<Especialidad[]> {
    if (usuarioId) {
      return this.especialidadRepository.find({
        where: { usuarioId },
        relations: ['materia'],
      });
    }
    return this.especialidadRepository.find({ relations: ['usuario', 'materia'] });
  }

  async findOne(id: bigint): Promise<Especialidad> {
    const especialidad = await this.especialidadRepository.findOne({
      where: { id },
      relations: ['usuario', 'materia'],
    });
    if (!especialidad) {
      throw new NotFoundException('Especialidad no encontrada');
    }
    return especialidad;
  }

  async remove(id: bigint): Promise<void> {
    const especialidad = await this.findOne(id);
    await this.especialidadRepository.softRemove(especialidad);
  }
}
