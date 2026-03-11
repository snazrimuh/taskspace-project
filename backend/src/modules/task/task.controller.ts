import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/tasks')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private prisma: PrismaService,
  ) {}

  @Get()
  getTasks(@Param('teamId') teamId: string) {
    return this.taskService.getTasks(teamId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  createTask(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.createTask(teamId, userId, dto);
  }

  @Get(':id')
  getTask(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.taskService.getTask(teamId, id);
  }

  @Patch(':id')
  async updateTask(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    const isManager = member?.role === TeamRole.MANAGER;
    return this.taskService.updateTask(teamId, id, userId, dto, isManager);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  deleteTask(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.taskService.deleteTask(teamId, id);
  }

  @Patch(':id/status')
  async updateTaskStatus(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    const isManager = member?.role === TeamRole.MANAGER;
    return this.taskService.updateTaskStatus(teamId, id, userId, dto, isManager);
  }
}
