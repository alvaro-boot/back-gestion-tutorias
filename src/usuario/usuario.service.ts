import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { RolService } from '../rol/rol.service';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepository: Repository<UsuarioRol>,
    private rolService: RolService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Verificar si el correo ya existe
    const existingUsuario = await this.usuarioRepository.findOne({
      where: { correo: createUsuarioDto.correo },
    });

    if (existingUsuario) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Generar contraseña si no se proporciona
    const contraseña = createUsuarioDto.contraseña || this.generatePassword();
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      nombre: createUsuarioDto.nombre,
      correo: createUsuarioDto.correo,
      contraseña: hashedPassword,
      estado: createUsuarioDto.estado || 'activo',
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Asignar roles
    if (createUsuarioDto.roles && createUsuarioDto.roles.length > 0) {
      for (const rolNombre of createUsuarioDto.roles) {
        const rol = await this.rolService.findByNombre(rolNombre);
        if (!rol) {
          throw new NotFoundException(`Rol '${rolNombre}' no encontrado`);
        }

        await this.usuarioRolRepository.save({
          usuarioId: savedUsuario.id,
          rolId: rol.id,
        });
      }
    }

    return this.findOneById(savedUsuario.id);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });
  }

  async findOneById(id: bigint): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { correo },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });
  }

  async update(id: bigint, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOneById(id);

    if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
      const existingUsuario = await this.findByCorreo(updateUsuarioDto.correo);
      if (existingUsuario && existingUsuario.id !== id) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: bigint): Promise<void> {
    const usuario = await this.findOneById(id);
    await this.usuarioRepository.softRemove(usuario);
  }

  async updatePassword(id: bigint, hashedPassword: string): Promise<void> {
    await this.usuarioRepository.update({ id }, { contraseña: hashedPassword });
  }

  async getUserRoles(usuarioId: bigint): Promise<UsuarioRol[]> {
    return this.usuarioRolRepository.find({
      where: { usuarioId },
      relations: ['rol'],
    });
  }

  async asignarRol(usuarioId: bigint, rolId: bigint): Promise<UsuarioRol> {
    const existing = await this.usuarioRolRepository.findOne({
      where: { usuarioId, rolId },
    });

    if (existing) {
      throw new ConflictException('El usuario ya tiene este rol asignado');
    }

    return this.usuarioRolRepository.save({ usuarioId, rolId });
  }

  async removerRol(usuarioId: bigint, rolId: bigint): Promise<void> {
    const usuarioRol = await this.usuarioRolRepository.findOne({
      where: { usuarioId, rolId },
    });

    if (!usuarioRol) {
      throw new NotFoundException('El usuario no tiene este rol asignado');
    }

    await this.usuarioRolRepository.softRemove(usuarioRol);
  }

  private generatePassword(): string {
    // Generar contraseña aleatoria de 12 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
