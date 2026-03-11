import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  CreateInviteDto,
  UpdateMemberRoleDto,
  TransferOwnershipDto,
} from './dto';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  // ─── Teams ────────────────────────────────────────────────────────────

  async getUserTeams(userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.team,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async createTeam(userId: string, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        avatar: dto.avatar,
        createdById: userId,
        members: {
          create: {
            userId,
            role: TeamRole.MANAGER,
          },
        },
      },
      include: {
        _count: { select: { members: true } },
      },
    });

    return team;
  }

  async getTeam(teamId: string, userId: string) {
    await this.ensureMember(teamId, userId);

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: { select: { members: true, tasks: true, announcements: true } },
      },
    });

    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async updateTeam(teamId: string, dto: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
      },
    });
  }

  async deleteTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    await this.prisma.team.delete({ where: { id: teamId } });
    return { message: 'Team deleted successfully' };
  }

  // ─── Members ──────────────────────────────────────────────────────────

  async getMembers(teamId: string, userId: string) {
    await this.ensureMember(teamId, userId);

    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, bio: true },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });
  }

  async updateMemberRole(
    teamId: string,
    targetUserId: string,
    currentUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: targetUserId, teamId } },
    });

    if (!member) throw new NotFoundException('Member not found in this team');

    return this.prisma.teamMember.update({
      where: { userId_teamId: { userId: targetUserId, teamId } },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async removeMember(teamId: string, targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot remove yourself, use leave instead');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: targetUserId, teamId } },
    });

    if (!member) throw new NotFoundException('Member not found in this team');

    await this.prisma.teamMember.delete({
      where: { userId_teamId: { userId: targetUserId, teamId } },
    });

    return { message: 'Member removed successfully' };
  }

  async leaveTeam(teamId: string, userId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) throw new NotFoundException('You are not a member of this team');

    if (member.role === TeamRole.MANAGER) {
      const managerCount = await this.prisma.teamMember.count({
        where: { teamId, role: TeamRole.MANAGER },
      });

      if (managerCount <= 1) {
        throw new BadRequestException(
          'Cannot leave as the only manager. Transfer ownership first.',
        );
      }
    }

    await this.prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } },
    });

    return { message: 'Left the team successfully' };
  }

  async transferOwnership(teamId: string, currentUserId: string, dto: TransferOwnershipDto) {
    const newOwner = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: dto.newOwnerId, teamId } },
    });

    if (!newOwner) {
      throw new NotFoundException('Target user is not a member of this team');
    }

    await this.prisma.$transaction([
      this.prisma.teamMember.update({
        where: { userId_teamId: { userId: dto.newOwnerId, teamId } },
        data: { role: TeamRole.MANAGER },
      }),
      this.prisma.team.update({
        where: { id: teamId },
        data: { createdById: dto.newOwnerId },
      }),
    ]);

    return { message: 'Ownership transferred successfully' };
  }

  // ─── Invites ──────────────────────────────────────────────────────────

  async createInvite(teamId: string, senderId: string, dto: CreateInviteDto) {
    const receiver = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!receiver) {
      throw new NotFoundException('User with this email not found');
    }

    if (receiver.id === senderId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    // Check if already a member
    const existingMember = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: receiver.id, teamId } },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this team');
    }

    // Check for existing pending invite
    const existingInvite = await this.prisma.teamInvite.findUnique({
      where: { teamId_receiverId: { teamId, receiverId: receiver.id } },
    });

    if (existingInvite && existingInvite.accepted === null) {
      throw new ConflictException('An invite is already pending for this user');
    }

    // Upsert invite (re-invite if previously declined)
    const invite = await this.prisma.teamInvite.upsert({
      where: { teamId_receiverId: { teamId, receiverId: receiver.id } },
      create: {
        teamId,
        senderId,
        receiverId: receiver.id,
        role: dto.role || TeamRole.MEMBER,
      },
      update: {
        senderId,
        role: dto.role || TeamRole.MEMBER,
        accepted: null,
        respondedAt: null,
        createdAt: new Date(),
      },
      include: {
        team: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });

    return invite;
  }

  async getPendingInvites(teamId: string) {
    return this.prisma.teamInvite.findMany({
      where: { teamId, accepted: null },
      include: {
        receiver: { select: { id: true, name: true, email: true, avatar: true } },
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelInvite(teamId: string, inviteId: string) {
    const invite = await this.prisma.teamInvite.findFirst({
      where: { id: inviteId, teamId },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    await this.prisma.teamInvite.delete({ where: { id: inviteId } });
    return { message: 'Invite cancelled' };
  }

  async getUserInvites(userId: string) {
    return this.prisma.teamInvite.findMany({
      where: { receiverId: userId, accepted: null },
      include: {
        team: { select: { id: true, name: true, avatar: true, description: true } },
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvite(inviteId: string, userId: string) {
    const invite = await this.getInviteOrFail(inviteId, userId);

    await this.prisma.$transaction([
      this.prisma.teamInvite.update({
        where: { id: inviteId },
        data: { accepted: true, respondedAt: new Date() },
      }),
      this.prisma.teamMember.create({
        data: {
          userId,
          teamId: invite.teamId,
          role: invite.role,
        },
      }),
    ]);

    return { message: 'Invite accepted' };
  }

  async declineInvite(inviteId: string, userId: string) {
    await this.getInviteOrFail(inviteId, userId);

    await this.prisma.teamInvite.update({
      where: { id: inviteId },
      data: { accepted: false, respondedAt: new Date() },
    });

    return { message: 'Invite declined' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  async ensureMember(teamId: string, userId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return member;
  }

  private async getInviteOrFail(inviteId: string, userId: string) {
    const invite = await this.prisma.teamInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.receiverId !== userId) throw new ForbiddenException('Access denied');
    if (invite.accepted !== null) throw new BadRequestException('Invite already responded to');

    return invite;
  }
}
