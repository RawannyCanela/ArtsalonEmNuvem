/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedimento } from './procedimento.entity';

@Injectable()
export class ProcedimentoService {
  constructor(
    @InjectRepository(Procedimento)
    private procedimentoRepo: Repository<Procedimento>,
  ) {}

  async getProced(): Promise<Procedimento[]> {
    return this.procedimentoRepo.find();
  }

  async getProcedId(id: number): Promise<Procedimento> {
    const procedimento = await this.procedimentoRepo.findOneBy({ id });
    if (!procedimento) {
      throw new NotFoundException('Procedimento não encontrado.');
    }
    return procedimento;
  }

  async createProcedimento(data: Partial<Procedimento>): Promise<Procedimento> {
    const procedimento = this.procedimentoRepo.create(data);
    return this.procedimentoRepo.save(procedimento);
  }

  async updateProcedimento(id: number, data: Partial<Procedimento>): Promise<Procedimento> {
    const procedimento = await this.getProcedId(id);
    Object.assign(procedimento, data);
    return this.procedimentoRepo.save(procedimento);
  }

  async deleteProcedimento(id: number): Promise<{ message: string }> {
    const result = await this.procedimentoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Procedimento não encontrado.');
    }
    return { message: 'Procedimento removido com sucesso.' };
  }
}
