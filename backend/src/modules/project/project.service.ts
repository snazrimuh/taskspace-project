import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, ProjectStatus, TeamRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private projectInclude = {
    pic: { select: { id: true, name: true, avatar: true } },
    createdBy: { select: { id: true, name: true, avatar: true } },
    _count: { select: { tasks: { where: { deletedAt: null } } } },
  };

  async getProjects(teamId: string, userId: string) {
    await this.ensureMember(teamId, userId);

    return this.prisma.project.findMany({
      where: { teamId, deletedAt: null },
      include: this.projectInclude,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async createProject(teamId: string, createdById: string, dto: CreateProjectDto) {
    await this.ensureMember(teamId, createdById);

    if (dto.picId) {
      await this.ensureMember(teamId, dto.picId);
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status ?? ProjectStatus.NOT_STARTED,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        teamId,
        createdById,
        picId: dto.picId,
      },
      include: this.projectInclude,
    });

    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true },
    });

    await Promise.all(
      members.map((m) =>
        this.notificationService.create({
          userId: m.userId,
          type: NotificationType.PROJECT_CREATED,
          message: `New project created: ${project.name}`,
          referenceId: project.id,
          referenceType: 'project',
        }),
      ),
    );

    if (project.pic?.id) {
      await this.notificationService.create({
        userId: project.pic.id,
        type: NotificationType.PROJECT_PIC_ASSIGNED,
        message: `You are assigned as PIC for project ${project.name}`,
        referenceId: project.id,
        referenceType: 'project',
      });
    }

    return project;
  }

  async getProject(teamId: string, projectId: string, userId: string) {
    await this.ensureMember(teamId, userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, deletedAt: null },
      include: {
        ...this.projectInclude,
        tasks: {
          where: { deletedAt: null },
          orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
          include: {
            createdBy: { select: { id: true, name: true, avatar: true } },
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(
    teamId: string,
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ) {
    const member = await this.ensureMember(teamId, userId);
    const project = await this.findProjectOrFail(projectId, teamId);

    const isManager = member.role === TeamRole.MANAGER;
    const isPic = project.picId === userId;

    if (!isManager && !isPic) {
      throw new ForbiddenException('Only manager or project PIC can update this project');
    }

    if (dto.picId) {
      await this.ensureMember(teamId, dto.picId);
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
        ...(dto.picId !== undefined && { picId: dto.picId || null }),
      },
      include: this.projectInclude,
    });

    if (dto.picId && dto.picId !== project.picId) {
      await this.notificationService.create({
        userId: dto.picId,
        type: NotificationType.PROJECT_PIC_ASSIGNED,
        message: `You are assigned as PIC for project ${updated.name}`,
        referenceId: updated.id,
        referenceType: 'project',
      });
    }

    return updated;
  }

  async deleteProject(teamId: string, projectId: string, userId: string) {
    await this.ensureMember(teamId, userId);
    await this.findProjectOrFail(projectId, teamId);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Project deleted' };
  }

  async recalculateProgress(projectId: string) {
    const [total, done] = await Promise.all([
      this.prisma.task.count({ where: { projectId, deletedAt: null } }),
      this.prisma.task.count({
        where: { projectId, status: 'DONE', deletedAt: null },
      }),
    ]);

    const progress = total === 0 ? 0 : Number(((done / total) * 100).toFixed(2));

    const nextStatus =
      total === 0
        ? ProjectStatus.NOT_STARTED
        : done === total
          ? ProjectStatus.COMPLETED
          : ProjectStatus.IN_PROGRESS;

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        progress,
        status: nextStatus,
      },
      include: { pic: { select: { id: true } } },
    });

    if (project.picId && [25, 50, 75, 100].includes(Math.floor(progress))) {
      await this.notificationService.create({
        userId: project.picId,
        type: NotificationType.PROJECT_PROGRESS_UPDATED,
        message: `Project progress is now ${progress}%`,
        referenceId: projectId,
        referenceType: 'project',
      });
    }

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

  private async findProjectOrFail(projectId: string, teamId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, teamId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
