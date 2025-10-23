/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Procedimento } from 'src/procedimento/procedimento.entity';
import { Clientes } from 'src/cliente/cliente.entity';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  @Column()
  horario: string;

  @Column()
  clienteId: number;

  @ManyToOne(() => Clientes)
  @JoinColumn({ name: 'clienteId' })
  cliente: Clientes;

  @Column()
  procedimentoId: number;

  @ManyToOne(() => Procedimento)
  @JoinColumn({ name: 'procedimentoId' })
  procedimento: Procedimento;

  @Column()
  tamanhoCabelo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ default: false }) 
  pago: boolean;
}
