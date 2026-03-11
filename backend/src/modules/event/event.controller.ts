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
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  getEvents(@Param('teamId') teamId: string) {
    return this.eventService.getEvents(teamId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  createEvent(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventService.createEvent(teamId, userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  updateEvent(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(teamId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  deleteEvent(@Param('teamId') teamId: string, @Param('id') id: string) {
    return this.eventService.deleteEvent(teamId, id);
  }
}
