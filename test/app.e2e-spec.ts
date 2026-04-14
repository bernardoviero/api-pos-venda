import { ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { QueueController } from '../src/queue/queue.controller';
import { QueueService } from '../src/queue/queue.service';
import { QueueStatus } from '../src/queue/queue.entity';

describe('Routes (e2e)', () => {
  let app: INestApplication<App>;

  const queueServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.AUTH_USERNAME = 'admin';
    process.env.AUTH_PASSWORD = 'admin';
    process.env.JWT_EXPIRES_IN = '1h';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' as never },
        }),
      ],
      controllers: [AppController, AuthController, QueueController],
      providers: [
        AppService,
        AuthService,
        {
          provide: QueueService,
          useValue: queueServiceMock,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns hello world', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /auth/login returns a JWT for valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });

  it('POST /auth/login returns 401 for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrong' })
      .expect(401);
  });

  it('GET /queue returns 401 without a bearer token', () => {
    return request(app.getHttpServer()).get('/queue').expect(401);
  });

  it('GET /queue returns queue items with a valid bearer token', async () => {
    queueServiceMock.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Maria',
        status: QueueStatus.WAITING,
        createdAt: new Date('2026-04-14T12:00:00.000Z'),
      },
    ]);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const response = await request(app.getHttpServer())
      .get('/queue')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .expect(200);

    expect(queueServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 1,
        name: 'Maria',
        status: QueueStatus.WAITING,
      }),
    ]);
  });

  it('POST /queue creates a queue item with a valid bearer token', async () => {
    queueServiceMock.create.mockResolvedValue({
      id: 2,
      name: 'Joao',
      status: QueueStatus.WAITING,
      createdAt: new Date('2026-04-14T12:10:00.000Z'),
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const response = await request(app.getHttpServer())
      .post('/queue')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .send({ name: 'Joao' })
      .expect(201);

    expect(queueServiceMock.create).toHaveBeenCalledWith('Joao');
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 2,
        name: 'Joao',
        status: QueueStatus.WAITING,
      }),
    );
  });

  it('PATCH /queue/:id updates the queue status with a valid bearer token', async () => {
    queueServiceMock.updateStatus.mockResolvedValue({
      affected: 1,
      generatedMaps: [],
      raw: [],
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });

    const response = await request(app.getHttpServer())
      .patch('/queue/1')
      .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
      .send({ status: QueueStatus.DONE })
      .expect(200);

    expect(queueServiceMock.updateStatus).toHaveBeenCalledWith(
      '1',
      QueueStatus.DONE,
    );
    expect(response.body).toEqual({
      affected: 1,
      generatedMaps: [],
      raw: [],
    });
  });
});
