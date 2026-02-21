import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validateUser(correo: string, contraseña: string): Promise<any> {
    const usuario = await this.usuarioService.findByCorreo(correo);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.deleted_at) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    return usuario;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.correo, loginDto.contraseña);
    
    // Obtener roles del usuario
    const roles = await this.usuarioService.getUserRoles(usuario.id);

    const payload = {
      sub: usuario.id.toString(),
      correo: usuario.correo,
      roles: roles.map((r) => r.rol.nombre),
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        roles: payload.roles,
      },
    };
  }

  async changePassword(userId: bigint, changePasswordDto: ChangePasswordDto) {
    const usuario = await this.usuarioService.findOneById(userId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      usuario.contraseña,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usuarioService.updatePassword(userId, hashedPassword);

    return { message: 'Contraseña actualizada exitosamente' };
  }
}
