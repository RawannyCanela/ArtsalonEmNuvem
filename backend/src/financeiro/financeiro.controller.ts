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
import { FinanceiroService } from './financeiro.service';
import { Financeiro } from './financeiro.entity';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get()
  async getFinanceiro(): Promise<Financeiro[]> {
    return this.service.getFinanceiro();
  }

  @Get(':id')
  async getFinanceiroId(@Param('id') id: string): Promise<Financeiro> {
    return this.service.getFinanceiroId(Number(id));
  }

  @Post()
  async createFinanceiro(@Body() data: Partial<Financeiro>): Promise<Financeiro> {
    return this.service.createFinanceiro(data);
  }

  @Patch(':id')
  async updateFinanceiro(
    @Param('id') id: string,
    @Body() data: Partial<Financeiro>,
  ): Promise<Financeiro> {
    return this.service.updateFinanceiro(Number(id), data);
  }

  @Delete(':id')
  async deleteFinanceiro(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.deleteFinanceiro(Number(id));
  }

  @Delete()
  async deleteAll(): Promise<{ message: string }> {
    return this.service.deleteAll();
  }
}
