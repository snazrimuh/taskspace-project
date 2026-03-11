import { Module } from '@nestjs/common';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [AnnouncementController],
  providers: [AnnouncementService, RolesGuard],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
