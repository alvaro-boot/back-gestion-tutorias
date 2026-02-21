import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto): Promise<Rol> {
    const existingRol = await this.rolRepository.findOne({
      where: { nombre: createRolDto.nombre },
    });

    if (existingRol) {
      throw new ConflictException('El rol ya existe');
    }

    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return this.rolRepository.find();
  }

  async findOne(id: bigint): Promise<Rol> {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    return rol;
  }

  async findByNombre(nombre: string): Promise<Rol | null> {
    return this.rolRepository.findOne({ where: { nombre } });
  }

  async update(id: bigint, updateRolDto: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOne(id);
    Object.assign(rol, updateRolDto);
    return this.rolRepository.save(rol);
  }

  async remove(id: bigint): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.softRemove(rol);
  }
}
