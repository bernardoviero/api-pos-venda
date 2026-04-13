import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue, QueueStatus } from './queue.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Queue)
    private repo: Repository<Queue>,
  ) {}

  create(name: string) {
    const item = this.repo.create({ name });
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'ASC' },
    });
  }

  updateStatus(id: number, status: QueueStatus) {
    return this.repo.update(id, { status });
  }
}
