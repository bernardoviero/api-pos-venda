import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueService } from './queue.service';
import { Queue, QueueStatus } from './queue.entity';

describe('QueueService', () => {
  let service: QueueService;
  let repository: jest.Mocked<Repository<Queue>>;

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getRepositoryToken(Queue),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    repository = module.get(getRepositoryToken(Queue));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and save a queue item', async () => {
    const entity = { name: 'Maria' } as Queue;
    const saved = { id: 1, name: 'Maria', status: QueueStatus.WAITING } as Queue;

    repository.create.mockReturnValue(entity);
    repository.save.mockResolvedValue(saved);

    await expect(service.create('Maria')).resolves.toEqual(saved);
    expect(repository.create).toHaveBeenCalledWith({ name: 'Maria' });
    expect(repository.save).toHaveBeenCalledWith(entity);
  });

  it('should list queue items ordered by creation date', async () => {
    const items = [{ id: 1, name: 'Maria' }] as Queue[];
    repository.find.mockResolvedValue(items);

    await expect(service.findAll()).resolves.toEqual(items);
    expect(repository.find).toHaveBeenCalledWith({
      order: { createdAt: 'ASC' },
    });
  });

  it('should update a queue status', async () => {
    repository.update.mockResolvedValue({
      affected: 1,
      raw: [],
      generatedMaps: [],
    });

    await expect(service.updateStatus(1, QueueStatus.DONE)).resolves.toEqual({
      affected: 1,
      raw: [],
      generatedMaps: [],
    });
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: QueueStatus.DONE,
    });
  });
});
