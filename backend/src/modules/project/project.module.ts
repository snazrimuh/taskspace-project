import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [ProjectController],
  providers: [ProjectService, RolesGuard],
  exports: [ProjectService],
})
export class ProjectModule {}
