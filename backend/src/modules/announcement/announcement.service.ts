import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async getAnnouncements(teamId: string, userId: string) {
    const announcements = await this.prisma.announcement.findMany({
      where: { teamId, deletedAt: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        readBy: {
          where: { userId },
          select: { readAt: true },
        },
        _count: { select: { readBy: true } },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    return announcements.map((a) => ({
      ...a,
      isRead: a.readBy.length > 0,
    }));
  }

  async createAnnouncement(
    teamId: string,
    authorId: string,
    dto: CreateAnnouncementDto,
  ) {
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        pinned: dto.pinned ?? false,
        teamId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async updateAnnouncement(
    teamId: string,
    announcementId: string,
    dto: UpdateAnnouncementDto,
  ) {
    await this.findAnnouncementOrFail(announcementId, teamId);

    return this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async deleteAnnouncement(teamId: string, announcementId: string) {
    await this.findAnnouncementOrFail(announcementId, teamId);

    // Soft delete
    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Announcement deleted' };
  }

  async togglePin(teamId: string, announcementId: string) {
    const announcement = await this.findAnnouncementOrFail(announcementId, teamId);

    return this.prisma.announcement.update({
      where: { id: announcementId },
      data: { pinned: !announcement.pinned },
    });
  }

  async markAsRead(teamId: string, announcementId: string, userId: string) {
    await this.findAnnouncementOrFail(announcementId, teamId);

    await this.prisma.announcementRead.upsert({
      where: { announcementId_userId: { announcementId, userId } },
      create: { announcementId, userId },
      update: { readAt: new Date() },
    });

    return { message: 'Marked as read' };
  }

  private async findAnnouncementOrFail(announcementId: string, teamId: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id: announcementId, teamId, deletedAt: null },
    });

    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }
}
