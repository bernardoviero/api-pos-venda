import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_SERVICE = 'IN_SERVICE',
  DONE = 'DONE',
}

@Entity()
export class Queue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status!: QueueStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
