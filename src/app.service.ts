import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Gestión de Tutorías API - Backend NestJS';
  }
}
