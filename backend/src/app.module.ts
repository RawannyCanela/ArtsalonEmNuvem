/* eslint-disable no-irregular-whitespace */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from './cliente/cliente.module';
import { Clientes } from './cliente/cliente.entity';
import { ProcedimentoModule } from './procedimento/procedimento.module';
import { Procedimento } from './procedimento/procedimento.entity';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { Financeiro } from './financeiro/financeiro.entity';
import { AgendamentoModule } from './agendamento/agendamento.module';
import { Agendamento } from './agendamento/agendamento.entity';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '26082004',
      database: 'artsalon',
      entities: [Clientes, Procedimento, Financeiro, Agendamento],
      synchronize: true,
    }),
    ClienteModule, ProcedimentoModule, FinanceiroModule, AgendamentoModule,
  ],
})
export class AppModule {}