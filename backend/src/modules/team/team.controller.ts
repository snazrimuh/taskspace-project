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
import { TeamService } from './team.service';
import {
  CreateTeamDto,
  UpdateTeamDto,
  CreateInviteDto,
  UpdateMemberRoleDto,
  TransferOwnershipDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  // ─── Teams ────────────────────────────────────────────────────────────

  @Get()
  getUserTeams(@CurrentUser('id') userId: string) {
    return this.teamService.getUserTeams(userId);
  }

  @Post()
  createTeam(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(userId, dto);
  }

  @Get(':teamId')
  getTeam(@Param('teamId') teamId: string, @CurrentUser('id') userId: string) {
    return this.teamService.getTeam(teamId, userId);
  }

  @Patch(':teamId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  updateTeam(@Param('teamId') teamId: string, @Body() dto: UpdateTeamDto) {
    return this.teamService.updateTeam(teamId, dto);
  }

  @Delete(':teamId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  deleteTeam(@Param('teamId') teamId: string) {
    return this.teamService.deleteTeam(teamId);
  }

  // ─── Members ──────────────────────────────────────────────────────────

  @Get(':teamId/members')
  getMembers(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.getMembers(teamId, userId);
  }

  @Patch(':teamId/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamService.updateMemberRole(teamId, targetUserId, currentUserId, dto);
  }

  @Delete(':teamId/members/:userId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.teamService.removeMember(teamId, targetUserId, currentUserId);
  }

  @Post(':teamId/leave')
  @HttpCode(HttpStatus.OK)
  leaveTeam(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.leaveTeam(teamId, userId);
  }

  @Post(':teamId/transfer')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  transferOwnership(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.teamService.transferOwnership(teamId, userId, dto);
  }

  // ─── Invites ──────────────────────────────────────────────────────────

  @Post(':teamId/invites')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  createInvite(
    @Param('teamId') teamId: string,
    @CurrentUser('id') senderId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.teamService.createInvite(teamId, senderId, dto);
  }

  @Get(':teamId/invites/pending')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  getPendingInvites(@Param('teamId') teamId: string) {
    return this.teamService.getPendingInvites(teamId);
  }

  @Delete(':teamId/invites/:inviteId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  cancelInvite(
    @Param('teamId') teamId: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.teamService.cancelInvite(teamId, inviteId);
  }
}
