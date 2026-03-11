import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getEvents(teamId: string) {
    return this.prisma.event.findMany({
      where: { teamId },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async createEvent(teamId: string, createdById: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        teamId,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async updateEvent(teamId: string, eventId: string, dto: UpdateEventDto) {
    await this.findEventOrFail(eventId, teamId);

    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type && { type: dto.type }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
      },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async deleteEvent(teamId: string, eventId: string) {
    await this.findEventOrFail(eventId, teamId);

    await this.prisma.event.delete({ where: { id: eventId } });
    return { message: 'Event deleted' };
  }

  private async findEventOrFail(eventId: string, teamId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, teamId },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }
}
