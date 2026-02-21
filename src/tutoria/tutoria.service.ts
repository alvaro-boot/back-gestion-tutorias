import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutoria } from './entities/tutoria.entity';
import { SolicitudTutoria } from '../solicitud-tutoria/entities/solicitud-tutoria.entity';
import { Especialidad } from '../especialidad/entities/especialidad.entity';
import { Disponibilidad } from '../disponibilidad/entities/disponibilidad.entity';
import { AsignarTutorManualDto } from './dto/asignar-tutor-manual.dto';
import { UpdateEstadoTutoriaDto } from './dto/update-estado-tutoria.dto';
import { SolicitudTutoriaService } from '../solicitud-tutoria/solicitud-tutoria.service';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class TutoriaService {
  constructor(
    @InjectRepository(Tutoria)
    private tutoriaRepository: Repository<Tutoria>,
    @InjectRepository(SolicitudTutoria)
    private solicitudRepository: Repository<SolicitudTutoria>,
    @InjectRepository(Especialidad)
    private especialidadRepository: Repository<Especialidad>,
    @InjectRepository(Disponibilidad)
    private disponibilidadRepository: Repository<Disponibilidad>,
    private solicitudTutoriaService: SolicitudTutoriaService,
    private usuarioService: UsuarioService,
  ) {}

  async asignarTutorAutomatico(solicitudId: bigint): Promise<Tutoria> {
    // Verificar que la solicitud existe y está pendiente
    const solicitud = await this.solicitudTutoriaService.findOne(solicitudId);
    
    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    // Verificar que no existe una tutoría para esta solicitud
    const tutoriaExistente = await this.tutoriaRepository.findOne({
      where: { solicitudId },
    });
    if (tutoriaExistente) {
      throw new ConflictException('Ya existe una tutoría asignada para esta solicitud');
    }

    // Obtener el día de la semana de la fecha
    const fecha = new Date(solicitud.fecha);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaSemana = diasSemana[fecha.getDay()];

    // 1. Buscar profesores con especialidad en la materia solicitada
    const especialidades = await this.especialidadRepository.find({
      where: { materiaId: solicitud.materiaId },
      relations: ['usuario'],
    });

    if (especialidades.length === 0) {
      throw new NotFoundException('No hay profesores con especialidad en esta materia');
    }

    const profesoresIds = especialidades.map((e) => e.usuarioId);

    // 2. Filtrar por disponibilidad en el día y hora solicitados
    const disponibilidades = await this.disponibilidadRepository
      .createQueryBuilder('disponibilidad')
      .where('disponibilidad.usuarioid IN (:...ids)', { ids: profesoresIds })
      .andWhere('LOWER(disponibilidad.diasemana) = LOWER(:dia)', { dia: diaSemana })
      .getMany();

    // Filtrar profesores disponibles en el horario
    const profesoresDisponibles = disponibilidades.filter((disp) => {
      return (
        disp.horaInicio <= solicitud.horaInicio &&
        disp.horaFin >= solicitud.horaFin
      );
    });

    if (profesoresDisponibles.length === 0) {
      throw new NotFoundException(
        'No hay profesores disponibles en el horario solicitado',
      );
    }

    // 3. Verificar que no tengan otra tutoría en ese horario
    const tutorDisponible = await this.buscarTutorSinConflicto(
      profesoresDisponibles.map((d) => d.usuarioId),
      solicitud.fecha,
      solicitud.horaInicio,
      solicitud.horaFin,
    );

    if (!tutorDisponible) {
      throw new NotFoundException(
        'No hay tutores disponibles sin conflictos de horario',
      );
    }

    // 4. Crear la tutoría
    const tutoria = this.tutoriaRepository.create({
      solicitudId,
      tutorAsignadoId: tutorDisponible,
      estado: 'programada',
    });

    const tutoriaGuardada = await this.tutoriaRepository.save(tutoria);

    // 5. Actualizar estado de la solicitud
    await this.solicitudTutoriaService.updateEstado(
      solicitudId,
      { estado: 'aceptada' },
      BigInt(0), // Admin
      ['admin'],
    );

    return this.findOne(tutoriaGuardada.id);
  }

  async asignarTutorManual(asignarTutorDto: AsignarTutorManualDto): Promise<Tutoria> {
    const solicitud = await this.solicitudTutoriaService.findOne(asignarTutorDto.solicitudId);

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    // Verificar que no existe una tutoría para esta solicitud
    const tutoriaExistente = await this.tutoriaRepository.findOne({
      where: { solicitudId: asignarTutorDto.solicitudId },
    });
    if (tutoriaExistente) {
      throw new ConflictException('Ya existe una tutoría asignada para esta solicitud');
    }

    // Verificar que el tutor tiene especialidad en la materia
    const especialidad = await this.especialidadRepository.findOne({
      where: {
        usuarioId: asignarTutorDto.tutorId,
        materiaId: solicitud.materiaId,
      },
    });

    if (!especialidad) {
      throw new BadRequestException('El tutor no tiene especialidad en esta materia');
    }

    // Verificar disponibilidad
    const fecha = new Date(solicitud.fecha);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaSemana = diasSemana[fecha.getDay()];

    const disponibilidad = await this.disponibilidadRepository.findOne({
      where: {
        usuarioId: asignarTutorDto.tutorId,
        diaSemana: diaSemana.toLowerCase(),
      },
    });

    if (
      !disponibilidad ||
      disponibilidad.horaInicio > solicitud.horaInicio ||
      disponibilidad.horaFin < solicitud.horaFin
    ) {
      throw new BadRequestException('El tutor no está disponible en el horario solicitado');
    }

    // Verificar conflictos
    const tieneConflicto = await this.tieneConflictoHorario(
      asignarTutorDto.tutorId,
      solicitud.fecha,
      solicitud.horaInicio,
      solicitud.horaFin,
    );

    if (tieneConflicto) {
      throw new ConflictException('El tutor tiene otra tutoría en ese horario');
    }

    const tutoria = this.tutoriaRepository.create({
      solicitudId: asignarTutorDto.solicitudId,
      tutorAsignadoId: asignarTutorDto.tutorId,
      estado: 'programada',
    });

    const tutoriaGuardada = await this.tutoriaRepository.save(tutoria);

    // Actualizar estado de la solicitud
    await this.solicitudTutoriaService.updateEstado(
      asignarTutorDto.solicitudId,
      { estado: 'aceptada' },
      BigInt(0),
      ['admin'],
    );

    return this.findOne(tutoriaGuardada.id);
  }

  async findAll(filters?: {
    tutorId?: bigint;
    estado?: string;
    fecha?: Date;
  }): Promise<Tutoria[]> {
    const where: any = {};
    if (filters?.tutorId) {
      where.tutorAsignadoId = filters.tutorId;
    }
    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const tutorias = await this.tutoriaRepository.find({
      where,
      relations: ['solicitud', 'solicitud.estudiante', 'solicitud.materia', 'tutorAsignado'],
      order: { created_at: 'DESC' },
    });

    // Filtrar por fecha si se proporciona
    if (filters?.fecha) {
      return tutorias.filter((t) => {
        const fechaTutoria = new Date(t.solicitud.fecha);
        return fechaTutoria.toDateString() === filters.fecha.toDateString();
      });
    }

    return tutorias;
  }

  async findOne(id: bigint): Promise<Tutoria> {
    const tutoria = await this.tutoriaRepository.findOne({
      where: { id },
      relations: [
        'solicitud',
        'solicitud.estudiante',
        'solicitud.materia',
        'tutorAsignado',
      ],
    });
    if (!tutoria) {
      throw new NotFoundException('Tutoría no encontrada');
    }
    return tutoria;
  }

  async updateEstado(id: bigint, updateEstadoDto: UpdateEstadoTutoriaDto): Promise<Tutoria> {
    const tutoria = await this.findOne(id);
    tutoria.estado = updateEstadoDto.estado;
    return this.tutoriaRepository.save(tutoria);
  }

  private async buscarTutorSinConflicto(
    profesoresIds: bigint[],
    fecha: Date,
    horaInicio: string,
    horaFin: string,
  ): Promise<bigint | null> {
    for (const profesorId of profesoresIds) {
      const tieneConflicto = await this.tieneConflictoHorario(
        profesorId,
        fecha,
        horaInicio,
        horaFin,
      );
      if (!tieneConflicto) {
        return profesorId;
      }
    }
    return null;
  }

  private async tieneConflictoHorario(
    tutorId: bigint,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
  ): Promise<boolean> {
    const tutorias = await this.tutoriaRepository.find({
      where: { tutorAsignadoId: tutorId },
      relations: ['solicitud'],
    });
    
    // Filtrar las canceladas
    const tutoriasActivas = tutorias.filter((t) => t.estado !== 'cancelada');

    for (const tutoria of tutoriasActivas) {
      const fechaTutoria = new Date(tutoria.solicitud.fecha);
      if (fechaTutoria.toDateString() === fecha.toDateString()) {
        // Mismo día, verificar horario
        if (
          (horaInicio >= tutoria.solicitud.horaInicio &&
            horaInicio < tutoria.solicitud.horaFin) ||
          (horaFin > tutoria.solicitud.horaInicio &&
            horaFin <= tutoria.solicitud.horaFin) ||
          (horaInicio <= tutoria.solicitud.horaInicio &&
            horaFin >= tutoria.solicitud.horaFin)
        ) {
          return true;
        }
      }
    }
    return false;
  }
}
