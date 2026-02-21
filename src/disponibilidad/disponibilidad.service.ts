import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Disponibilidad)
    private disponibilidadRepository: Repository<Disponibilidad>,
    private usuarioService: UsuarioService,
  ) {}

  async create(createDisponibilidadDto: CreateDisponibilidadDto): Promise<Disponibilidad> {
    // Verificar que el usuario existe
    await this.usuarioService.findOneById(createDisponibilidadDto.usuarioId);

    // Validar que horaInicio < horaFin
    if (createDisponibilidadDto.horaInicio >= createDisponibilidadDto.horaFin) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de fin');
    }

    // Verificar solapamientos de horarios
    await this.validarSolapamiento(
      createDisponibilidadDto.usuarioId,
      createDisponibilidadDto.diaSemana,
      createDisponibilidadDto.horaInicio,
      createDisponibilidadDto.horaFin,
    );

    const disponibilidad = this.disponibilidadRepository.create(createDisponibilidadDto);
    return this.disponibilidadRepository.save(disponibilidad);
  }

  async findAll(usuarioId?: bigint): Promise<Disponibilidad[]> {
    if (usuarioId) {
      return this.disponibilidadRepository.find({
        where: { usuarioId },
        order: { diaSemana: 'ASC', horaInicio: 'ASC' },
      });
    }
    return this.disponibilidadRepository.find({
      relations: ['usuario'],
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
  }

  async findOne(id: bigint): Promise<Disponibilidad> {
    const disponibilidad = await this.disponibilidadRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!disponibilidad) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }
    return disponibilidad;
  }

  async update(id: bigint, updateDisponibilidadDto: UpdateDisponibilidadDto): Promise<Disponibilidad> {
    const disponibilidad = await this.findOne(id);

    // Validar horas si se actualizan
    const horaInicio = updateDisponibilidadDto.horaInicio || disponibilidad.horaInicio;
    const horaFin = updateDisponibilidadDto.horaFin || disponibilidad.horaFin;

    if (horaInicio >= horaFin) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de fin');
    }

    // Verificar solapamientos si se actualiza día u hora
    if (
      updateDisponibilidadDto.diaSemana ||
      updateDisponibilidadDto.horaInicio ||
      updateDisponibilidadDto.horaFin
    ) {
      await this.validarSolapamiento(
        disponibilidad.usuarioId,
        updateDisponibilidadDto.diaSemana || disponibilidad.diaSemana,
        horaInicio,
        horaFin,
        id,
      );
    }

    Object.assign(disponibilidad, updateDisponibilidadDto);
    return this.disponibilidadRepository.save(disponibilidad);
  }

  async remove(id: bigint): Promise<void> {
    const disponibilidad = await this.findOne(id);
    await this.disponibilidadRepository.softRemove(disponibilidad);
  }

  private async validarSolapamiento(
    usuarioId: bigint,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
    excludeId?: bigint,
  ): Promise<void> {
    const disponibilidades = await this.disponibilidadRepository.find({
      where: {
        usuarioId,
        diaSemana: diaSemana.toLowerCase(),
      },
    });

    for (const disp of disponibilidades) {
      if (excludeId && disp.id === excludeId) {
        continue;
      }

      // Verificar solapamiento
      if (
        (horaInicio >= disp.horaInicio && horaInicio < disp.horaFin) ||
        (horaFin > disp.horaInicio && horaFin <= disp.horaFin) ||
        (horaInicio <= disp.horaInicio && horaFin >= disp.horaFin)
      ) {
        throw new BadRequestException(
          `Hay un solapamiento con otra disponibilidad: ${disp.horaInicio} - ${disp.horaFin}`,
        );
      }
    }
  }
}
