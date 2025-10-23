/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Procedimento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorPequeno: number;

  @Column()
  tempoPequeno: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorMedio: number;

  @Column()
  tempoMedio: string;

  @Column('decimal', { precision: 10, scale: 2 })
  valorGrande: number;

  @Column()
  tempoGrande: string;
}
