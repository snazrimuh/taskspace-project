import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [ProjectModule],
  controllers: [TaskController],
  providers: [TaskService, RolesGuard],
  exports: [TaskService],
})
export class TaskModule {}
