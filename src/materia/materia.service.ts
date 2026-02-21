import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from './entities/materia.entity';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { UpdateMateriaDto } from './dto/update-materia.dto';

@Injectable()
export class MateriaService {
  constructor(
    @InjectRepository(Materia)
    private materiaRepository: Repository<Materia>,
  ) {}

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    const existingMateria = await this.materiaRepository.findOne({
      where: { codigo: createMateriaDto.codigo },
    });

    if (existingMateria) {
      throw new ConflictException('El código de materia ya existe');
    }

    const materia = this.materiaRepository.create({
      ...createMateriaDto,
      estado: createMateriaDto.estado || 'activa',
    });
    return this.materiaRepository.save(materia);
  }

  async findAll(): Promise<Materia[]> {
    return this.materiaRepository.find();
  }

  async findOne(id: bigint): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({ where: { id } });
    if (!materia) {
      throw new NotFoundException('Materia no encontrada');
    }
    return materia;
  }

  async update(id: bigint, updateMateriaDto: UpdateMateriaDto): Promise<Materia> {
    const materia = await this.findOne(id);

    if (updateMateriaDto.codigo && updateMateriaDto.codigo !== materia.codigo) {
      const existingMateria = await this.materiaRepository.findOne({
        where: { codigo: updateMateriaDto.codigo },
      });
      if (existingMateria && existingMateria.id !== id) {
        throw new ConflictException('El código de materia ya existe');
      }
    }

    Object.assign(materia, updateMateriaDto);
    return this.materiaRepository.save(materia);
  }

  async remove(id: bigint): Promise<void> {
    const materia = await this.findOne(id);
    await this.materiaRepository.softRemove(materia);
  }
}
