/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Agendamento } from './agendamento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Procedimento } from 'src/procedimento/procedimento.entity';
import { Financeiro } from 'src/financeiro/financeiro.entity';

@Injectable()
export class AgendamentoService {
  constructor(
    @InjectRepository(Agendamento)
    private readonly repo: Repository<Agendamento>,
    @InjectRepository(Procedimento)
    private readonly procedimentoRepo: Repository<Procedimento>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['cliente', 'procedimento'] });
  }

  async createAgendamento(body: Agendamento) {
    const procedimento = await this.procedimentoRepo.findOneBy({ id: body.procedimentoId });
    if (!procedimento) throw new NotFoundException('Procedimento não encontrado');

    let valor = 0;
    switch (body.tamanhoCabelo.toLowerCase()) {
      case 'pequeno':
        valor = Number(procedimento.valorPequeno);
        break;
      case 'medio':
        valor = Number(procedimento.valorMedio);
        break;
      case 'grande':
        valor = Number(procedimento.valorGrande);
        break;
      default:
        throw new Error('Tamanho de cabelo inválido (use pequeno, medio ou grande)');
    }

    const agendamento = this.repo.create({
      ...body,
      valor,
      pago: false,
    });
    await this.repo.save(agendamento);
    return { message: 'Agendamento criado com sucesso!', agendamento };
  }

async updateAgendamento(id: number, body: Agendamento) {
  const procedimento = await this.procedimentoRepo.findOneBy({ id: Number(body.procedimentoId) });
  if (!procedimento) throw new NotFoundException('Procedimento não encontrado');

  // normaliza tamanho (evita undefined.toLowerCase())
  const tamanho = String(body.tamanhoCabelo || '').toLowerCase();

  // recalcula valor
  let valor = 0;
  switch (tamanho) {
    case 'pequeno':
      valor = Number(procedimento.valorPequeno);
      break;
    case 'medio':
      valor = Number(procedimento.valorMedio);
      break;
    case 'grande':
      valor = Number(procedimento.valorGrande);
      break;
    default:
      valor = 0;
  }

  await this.repo.update(id, {
    data: body.data,
    horario: body.horario,
    clienteId: Number(body.clienteId),
    procedimentoId: Number(body.procedimentoId),
    tamanhoCabelo: tamanho,
    valor,
  });

  return { message: 'Agendamento atualizado com sucesso!' };
}


  async deleteAgendamento(id: number) {
    await this.repo.delete(id);
    return { message: 'Agendamento excluído com sucesso!' };
  }

  
  async confirmarPagamento(id: number) {
    const agendamento = await this.repo.findOne({
      where: { id },
      relations: ['cliente', 'procedimento'],
    });

    if (!agendamento) throw new NotFoundException('Agendamento não encontrado');

    if (agendamento.pago) {
      return { message: 'Pagamento já confirmado' };
    }

    agendamento.pago = true;
    await this.repo.save(agendamento);


    const financeiroRepo = this.repo.manager.getRepository(Financeiro);
    const entrada = financeiroRepo.create({
      descricao: `Pagamento de ${agendamento.procedimento.nome} - ${agendamento.cliente.nome}`,
      valor: agendamento.valor,
      tipo: true,
    });
    await financeiroRepo.save(entrada);

    return { message: 'Pagamento confirmado e registrado no financeiro!' };
  }
}
