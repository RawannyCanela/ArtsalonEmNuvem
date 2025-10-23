/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AgendamentoService } from './agendamento.service';
import { Agendamento } from './agendamento.entity';

@Controller('agendamentos')  
export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  @Get()
  async getAgend() {
    return await this.service.findAll();
  }

  @Post()
  async createAgendamento(@Body() body: Agendamento) {
    return await this.service.createAgendamento(body);
  }

  @Patch(':id')
  async updateAgendamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Agendamento,
  ) {
    return await this.service.updateAgendamento(id, body);
  }

  @Delete(':id')
  async deleteAgendamento(@Param('id', ParseIntPipe) id: number) {
    return await this.service.deleteAgendamento(id);
  }

  @Patch(':id/pagar')
  async confirmarPagamento(@Param('id', ParseIntPipe) id: number) {
    return await this.service.confirmarPagamento(id);
  }
}
