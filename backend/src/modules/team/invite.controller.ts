import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InviteController {
  constructor(private teamService: TeamService) {}

  @Get()
  getUserInvites(@CurrentUser('id') userId: string) {
    return this.teamService.getUserInvites(userId);
  }

  @Post(':inviteId/accept')
  @HttpCode(HttpStatus.OK)
  acceptInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.acceptInvite(inviteId, userId);
  }

  @Post(':inviteId/decline')
  @HttpCode(HttpStatus.OK)
  declineInvite(
    @Param('inviteId') inviteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamService.declineInvite(inviteId, userId);
  }
}
