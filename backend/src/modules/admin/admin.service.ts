import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isSystemAdmin: true,
          createdAt: true,
          _count: { select: { teamMembers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Remove refresh token to force logout
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'User deactivated' };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted' };
  }

  async getAllTeams(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.team.count(),
    ]);

    return {
      teams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    await this.prisma.team.delete({ where: { id: teamId } });
    return { message: 'Team deleted' };
  }
}
