import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../../usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuarioService: UsuarioService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuarioService.findOneById(BigInt(payload.sub));
    if (!usuario) {
      throw new UnauthorizedException();
    }
    // Obtener roles del usuario
    const roles = await this.usuarioService.getUserRoles(usuario.id);
    return {
      ...usuario,
      roles: roles.map((r) => r.rol.nombre),
    };
  }
}
