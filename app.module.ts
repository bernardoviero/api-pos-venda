import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueModule } from './src/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres', // docker
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'atendimento',
      autoLoadEntities: true,
      synchronize: true,
    }),
    QueueModule,
  ],
})
export class AppModule {}
