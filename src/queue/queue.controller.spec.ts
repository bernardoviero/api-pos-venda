import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QueueStatus } from './queue.entity';

describe('QueueController', () => {
  let controller: QueueController;
  const queueServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: QueueService,
          useValue: queueServiceMock,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a queue item', async () => {
    queueServiceMock.create.mockResolvedValue({ id: 1, name: 'Maria' });

    await expect(controller.create({ name: 'Maria' })).resolves.toEqual({
      id: 1,
      name: 'Maria',
    });
    expect(queueServiceMock.create).toHaveBeenCalledWith('Maria');
  });

  it('should list queue items', async () => {
    queueServiceMock.findAll.mockResolvedValue([{ id: 1, name: 'Maria' }]);

    await expect(controller.findAll()).resolves.toEqual([
      { id: 1, name: 'Maria' },
    ]);
  });

  it('should update a queue status', async () => {
    queueServiceMock.updateStatus.mockResolvedValue({ affected: 1 });

    await expect(controller.update('1' as never, QueueStatus.DONE)).resolves.toEqual({
      affected: 1,
    });
    expect(queueServiceMock.updateStatus).toHaveBeenCalledWith(
      '1',
      QueueStatus.DONE,
    );
  });
});
