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
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/announcements')
export class AnnouncementController {
  constructor(private announcementService: AnnouncementService) {}

  @Get()
  getAnnouncements(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.announcementService.getAnnouncements(teamId, userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  createAnnouncement(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementService.createAnnouncement(teamId, userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  updateAnnouncement(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.updateAnnouncement(teamId, id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  deleteAnnouncement(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ) {
    return this.announcementService.deleteAnnouncement(teamId, id);
  }

  @Patch(':id/pin')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  togglePin(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
  ) {
    return this.announcementService.togglePin(teamId, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @Param('teamId') teamId: string,
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.announcementService.markAsRead(teamId, id, userId);
  }
}
