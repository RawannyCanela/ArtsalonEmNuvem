/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedimento } from './procedimento.entity';
import { ProcedimentoService } from './procedimento.service';
import { ProcedimentoController } from './procedimento.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Procedimento])], 
  controllers: [ProcedimentoController],
  providers: [ProcedimentoService],
})
export class ProcedimentoModule {}
