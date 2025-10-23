/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clientes } from './cliente.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Clientes)
    private clienteRepo: Repository<Clientes>,
  ) {}

  async getClientes(): Promise<Clientes[]> {
    return this.clienteRepo.find();
  }

  async getClienteId(id: number): Promise<Clientes | { message: string }> {
    const cliente = await this.clienteRepo.findOneBy({ id });
    if (!cliente) {
      return { message: 'Cliente não encontrado.' };
    }
    return cliente;
  }
async createCliente(data: Partial<Clientes>): Promise<Clientes> {
  data.telefone = this.formatarTelefone(data.telefone);

  const clienteExistente = await this.clienteRepo.findOne({
    where: [
      { telefone: data.telefone },
      { nome: data.nome }          
    ],
  });

  if (clienteExistente) {
    throw new HttpException(
      'Já existe um cliente com este nome e telefone.',
      HttpStatus.BAD_REQUEST
    );
  }

  const novoCliente = this.clienteRepo.create(data);
  return this.clienteRepo.save(novoCliente);
}
  
  async updateCliente(id: number, dados: Partial<Clientes>): Promise<Clientes> {
    const cliente = await this.clienteRepo.findOneBy({ id });
    if (!cliente) {
            throw new HttpException('Cliente não encontrado',HttpStatus.BAD_REQUEST);
    }
  
    dados.telefone = this.formatarTelefone(dados.telefone);
  
    const clienteDuplicado = await this.clienteRepo
      .createQueryBuilder('c')
      .where('c.nome = :nome', { nome: dados.nome })
      .andWhere('c.telefone = :telefone', { telefone: dados.telefone })
      .andWhere('c.id != :id', { id })
      .getOne();

if (clienteDuplicado) {
  throw new HttpException('Já existe outro cliente com este nome e telefone.', HttpStatus.BAD_REQUEST);
}
    Object.assign(cliente, dados);
    return this.clienteRepo.save(cliente);
  }
  
  

  async deleteCliente(id: number): Promise<{ message: string }> {
    const result = await this.clienteRepo.delete(id);
    if (result.affected === 0) {
      return { message: 'Cliente não encontrado.' };
    }
    return { message: 'Cliente removido com sucesso.' };
  }

private formatarTelefone(telefone: string | undefined): string {
  if (!telefone) {
    throw new BadRequestException('Telefone é obrigatório.');
  }
  
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  if (apenasNumeros.length !== 11) {
    throw new BadRequestException('Telefone inválido. Deve conter exatamente 11 números.');
  }
    return apenasNumeros;
}

}
