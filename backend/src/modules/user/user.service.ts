import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserTaskStats(userId: string) {
    // Get stats for the last 7 days based on UTC Date
    const today = new Date();
    const stats: { date: string; assigned: number; completed: number }[] = [];

    // Fetch all relevant tasks first (performance optimization: fetch only what's needed)
    // We look back approx 8 days to be safe with timezones
    const lookbackDate = new Date(today);
    lookbackDate.setDate(lookbackDate.getDate() - 8);

    const tasks = await this.prisma.task.findMany({
      where: {
        assigneeId: userId,
        OR: [
          { createdAt: { gte: lookbackDate } },
          { updatedAt: { gte: lookbackDate } },
        ],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD in UTC

      const assignedCount = tasks.filter((t) =>
        t.createdAt.toISOString().startsWith(dateKey),
      ).length;

      const completedCount = tasks.filter(
        (t) =>
          t.status === TaskStatus.DONE &&
          t.updatedAt.toISOString().startsWith(dateKey),
      ).length;

      stats.push({
        date: dateKey,
        assigned: assignedCount,
        completed: completedCount,
      });
    }

    return stats;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        isSystemAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, refreshToken: null },
    });

    return { message: 'Password changed successfully' };
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.length < 2) return [];

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 10,
    });

    return users;
  }
}
