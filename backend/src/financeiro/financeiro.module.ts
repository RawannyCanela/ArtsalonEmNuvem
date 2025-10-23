/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Financeiro } from './financeiro.entity';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Financeiro])],
    controllers: [FinanceiroController],
    providers: [FinanceiroService],
})
export class FinanceiroModule { }
