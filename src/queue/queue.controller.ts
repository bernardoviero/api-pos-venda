import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueStatus } from './queue.entity';
import { CreateQueueDto } from './create-queue.dto';

@Controller('queue')
export class QueueController {
  constructor(private readonly service: QueueService) {}

  @Post()
  create(@Body() dto: CreateQueueDto) {
    return this.service.create(dto.name);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: QueueStatus,
  ) {
    return this.service.updateStatus(id, status);
  }
}
