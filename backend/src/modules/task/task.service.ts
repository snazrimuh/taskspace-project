import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto';
import { ProjectService } from '../project/project.service';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
  ) {}

  private taskInclude = {
    createdBy: { select: { id: true, name: true, avatar: true } },
    assignee: { select: { id: true, name: true, avatar: true } },
    project: { select: { id: true, name: true, progress: true, picId: true } },
  };

  async getTasks(teamId: string, userId: string, projectId?: string) {
    await this.ensureMember(teamId, userId);

    if (projectId) {
      await this.ensureProjectInTeam(projectId, teamId);
    }

    const tasks = await this.prisma.task.findMany({
      where: { teamId, deletedAt: null, ...(projectId && { projectId }) },
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
    await this.ensureProjectInTeam(dto.projectId, teamId);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        teamId,
        projectId: dto.projectId,
        createdById,
        assigneeId: dto.assigneeId,
      },
      include: this.taskInclude,
    });

    await this.projectService.recalculateProgress(dto.projectId);

    return task;
  }

  async getTask(teamId: string, taskId: string, userId: string) {
    await this.ensureMember(teamId, userId);

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
    const task = await this.getTask(teamId, taskId, userId);

    if (!isManager && task.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee or manager can update this task');
    }

    if (dto.projectId) {
      await this.ensureProjectInTeam(dto.projectId, teamId);
    }

    const previousProjectId = task.projectId;

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.projectId && { projectId: dto.projectId }),
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

    await this.projectService.recalculateProgress(updated.projectId);
    if (dto.projectId && dto.projectId !== previousProjectId) {
      await this.projectService.recalculateProgress(previousProjectId);
    }

    return updated;
  }

  async deleteTask(teamId: string, taskId: string, userId: string) {
    const task = await this.getTask(teamId, taskId, userId);

    await this.prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    await this.projectService.recalculateProgress(task.projectId);

    return { message: 'Task deleted' };
  }

  async updateTaskStatus(
    teamId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskStatusDto,
    isManager: boolean,
  ) {
    const task = await this.getTask(teamId, taskId, userId);

    if (!isManager && task.assigneeId !== userId) {
      throw new ForbiddenException('Only the assignee or manager can update this task status');
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: dto.status },
      include: this.taskInclude,
    });

    await this.projectService.recalculateProgress(task.projectId);

    return updated;
  }

  async ensureProjectInTeam(projectId: string, teamId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async ensureMember(teamId: string, userId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return member;
  }
}
