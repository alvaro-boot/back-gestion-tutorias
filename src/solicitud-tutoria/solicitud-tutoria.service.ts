import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudTutoria } from './entities/solicitud-tutoria.entity';
import { CreateSolicitudTutoriaDto } from './dto/create-solicitud-tutoria.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado-solicitud.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { MateriaService } from '../materia/materia.service';
import { TutoriaService } from '../tutoria/tutoria.service';

@Injectable()
export class SolicitudTutoriaService {
  private readonly logger = new Logger(SolicitudTutoriaService.name);

  constructor(
    @InjectRepository(SolicitudTutoria)
    private solicitudRepository: Repository<SolicitudTutoria>,
    private usuarioService: UsuarioService,
    private materiaService: MateriaService,
    @Inject(forwardRef(() => TutoriaService))
    private tutoriaService: TutoriaService,
  ) {}

  async create(
    createSolicitudDto: CreateSolicitudTutoriaDto,
    estudianteId: bigint,
  ): Promise<SolicitudTutoria> {
    // Validar que el estudiante existe
    const estudiante = await this.usuarioService.findOneById(estudianteId);
    
    // Validar que la materia existe
    await this.materiaService.findOne(createSolicitudDto.materiaId);

    // Validar que la fecha no sea en el pasado
    const fecha = new Date(createSolicitudDto.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha < hoy) {
      throw new BadRequestException('La fecha no puede ser en el pasado');
    }

    // Validar que horaInicio < horaFin
    if (createSolicitudDto.horaInicio >= createSolicitudDto.horaFin) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de fin');
    }

    const solicitud = this.solicitudRepository.create({
      estudianteId,
      materiaId: createSolicitudDto.materiaId,
      fecha,
      horaInicio: createSolicitudDto.horaInicio,
      horaFin: createSolicitudDto.horaFin,
      estado: 'pendiente',
    });

    const solicitudGuardada = await this.solicitudRepository.save(solicitud);

    // Intentar asignar tutor automáticamente
    try {
      await this.tutoriaService.asignarTutorAutomatico(solicitudGuardada.id);
      this.logger.log(`Tutor asignado automáticamente para la solicitud ${solicitudGuardada.id}`);
    } catch (error) {
      // Si no se puede asignar tutor, la solicitud queda pendiente
      this.logger.warn(
        `No se pudo asignar tutor automáticamente para la solicitud ${solicitudGuardada.id}: ${error.message}`,
      );
      // La solicitud permanece en estado 'pendiente' para que un admin la revise manualmente
    }

    // Retornar la solicitud actualizada con sus relaciones
    return this.findOne(solicitudGuardada.id);
  }

  async findAll(filters?: {
    estudianteId?: bigint;
    materiaId?: bigint;
    estado?: string;
  }): Promise<SolicitudTutoria[]> {
    const where: any = {};
    if (filters?.estudianteId) {
      where.estudianteId = filters.estudianteId;
    }
    if (filters?.materiaId) {
      where.materiaId = filters.materiaId;
    }
    if (filters?.estado) {
      where.estado = filters.estado;
    }

    return this.solicitudRepository.find({
      where,
      relations: ['estudiante', 'materia'],
      order: { fecha: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(id: bigint): Promise<SolicitudTutoria> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: ['estudiante', 'materia', 'tutoria', 'tutoria.tutorAsignado'],
    });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  async updateEstado(
    id: bigint,
    updateEstadoDto: UpdateEstadoSolicitudDto,
    userId: bigint,
    userRoles: string[],
  ): Promise<SolicitudTutoria> {
    const solicitud = await this.findOne(id);

    // Solo admin puede cambiar a aceptada/rechazada
    if (
      (updateEstadoDto.estado === 'aceptada' || updateEstadoDto.estado === 'rechazada') &&
      !userRoles.includes('admin')
    ) {
      throw new ForbiddenException('Solo el administrador puede aceptar o rechazar solicitudes');
    }

    // Solo el estudiante puede cancelar su propia solicitud
    if (updateEstadoDto.estado === 'cancelada' && solicitud.estudianteId !== userId) {
      throw new ForbiddenException('Solo puedes cancelar tus propias solicitudes');
    }

    solicitud.estado = updateEstadoDto.estado;
    return this.solicitudRepository.save(solicitud);
  }

  async remove(id: bigint, userId: bigint): Promise<void> {
    const solicitud = await this.findOne(id);

    // Solo el estudiante puede eliminar su propia solicitud
    if (solicitud.estudianteId !== userId) {
      throw new ForbiddenException('Solo puedes eliminar tus propias solicitudes');
    }

    // Solo se pueden eliminar solicitudes pendientes
    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar solicitudes pendientes');
    }

    await this.solicitudRepository.softRemove(solicitud);
  }
}
