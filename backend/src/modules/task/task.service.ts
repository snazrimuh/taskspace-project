import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  private taskInclude = {
    createdBy: { select: { id: true, name: true, avatar: true } },
    assignee: { select: { id: true, name: true, avatar: true } },
  };

  async getTasks(teamId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { teamId, deletedAt: null },
      include: this.taskInclude,
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Group by status for Kanban board
    const board: Record<string, typeof tasks> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    for (const task of tasks) {
      board[task.status].push(task);
    }

    return board;
  }

  async createTask(teamId: string, createdById: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        teamId,
        createdById,
        assigneeId: dto.assigneeId,
      },
      include: this.taskInclude,
    });

    return task;
  }

  async getTask(teamId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, teamId, deletedAt: null },
      include: this.taskInclude,
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateTask(
    teamId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
    isManager: boolean,
  ) {
    const task = await this.getTask(teamId, taskId);

    if (!isManager && task.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee or manager can update this task');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId || null }),
      },
      include: this.taskInclude,
    });
  }

  async deleteTask(teamId: string, taskId: string) {
    await this.getTask(teamId, taskId);

    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Task deleted' };
  }

  async updateTaskStatus(
    teamId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskStatusDto,
    isManager: boolean,
  ) {
    const task = await this.getTask(teamId, taskId);

    if (!isManager && task.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee or manager can update this task status');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
      include: this.taskInclude,
    });
  }
}
