/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Financeiro } from './financeiro.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private repo: Repository<Financeiro>,
  ) {}

  async getFinanceiro(): Promise<Financeiro[]> {
    return this.repo.find();
  }

  async getFinanceiroId(id: number): Promise<Financeiro> {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Registro não encontrado');
    return item;
  }

  async createFinanceiro(data: Partial<Financeiro>): Promise<Financeiro> {
    const novo = this.repo.create(data);
    return this.repo.save(novo);
  }

  async updateFinanceiro(id: number, data: Partial<Financeiro>): Promise<Financeiro> {
    const item = await this.getFinanceiroId(id);
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async deleteFinanceiro(id: number): Promise<{ message: string }> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Registro não encontrado');
    }
    return { message: 'Registro excluído com sucesso' };
  }

  async deleteAll(): Promise<{ message: string }> {
    await this.repo.clear();
    return { message: 'Todos os registros foram excluídos' };
  }
}
