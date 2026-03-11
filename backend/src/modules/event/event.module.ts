import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [EventController],
  providers: [EventService, RolesGuard],
  exports: [EventService],
})
export class EventModule {}
