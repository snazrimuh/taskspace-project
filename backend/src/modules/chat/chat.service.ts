import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(teamId: string, cursor?: string, limit = 30) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { teamId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0]?.id : null,
    };
  }

  async saveMessage(teamId: string, senderId: string, message: string) {
    return this.prisma.chatMessage.create({
      data: { teamId, senderId, message },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    return !!member;
  }
}
