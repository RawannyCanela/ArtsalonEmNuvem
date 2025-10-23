/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProcedimentoService } from './procedimento.service';
import { Procedimento } from './procedimento.entity';

@Controller('procedimentos')
export class ProcedimentoController {
  constructor(private readonly service: ProcedimentoService) { }

  @Get()
  async getProced(): Promise<Procedimento[]> {
    return this.service.getProced();
  }

  @Get(':id')
  async getProcedId(@Param('id') id: string): Promise<Procedimento> {
    return this.service.getProcedId(Number(id));
  }

  @Post()
  async createProcedimento(@Body() data: Partial<Procedimento>): Promise<Procedimento> {
    return this.service.createProcedimento(data);
  }

  @Patch(':id')
  async updateProcedimento(
    @Param('id') id: string,
    @Body() data: Partial<Procedimento>,
  ): Promise<Procedimento> {
    return this.service.updateProcedimento(Number(id), data);
  }

  @Delete(':id')
  async deleteProcedimento(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.deleteProcedimento(Number(id));
  }
}
