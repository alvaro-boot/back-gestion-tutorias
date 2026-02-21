import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { Materia } from './entities/materia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Materia])],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [MateriaService],
})
export class MateriaModule {}
