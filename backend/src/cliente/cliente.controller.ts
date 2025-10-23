/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { Clientes } from './cliente.entity';

@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  async getClientes(): Promise<Clientes[]> {
    return this.clienteService.getClientes();
  }

  @Get(':id')
  async getClienteId(@Param('id') id: string): Promise<Clientes | { message: string }> {
    return this.clienteService.getClienteId(Number(id));
  }

  @Post()
  async createCliente(@Body() cliente: Partial<Clientes>): Promise<Clientes> {
    return this.clienteService.createCliente(cliente);
  }

  @Patch(':id')
  async updateCliente(
    @Param('id') id: string,
    @Body() dados: Partial<Clientes>,
  ): Promise<Clientes | { message: string }> {
    return this.clienteService.updateCliente(Number(id), dados);
  }

  @Delete(':id')
  async deleteCliente(@Param('id') id: string): Promise<{ message: string }> {
    return this.clienteService.deleteCliente(Number(id));
  }
}