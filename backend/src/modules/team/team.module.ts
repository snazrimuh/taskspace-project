import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { InviteController } from './invite.controller';
import { TeamService } from './team.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [TeamController, InviteController],
  providers: [TeamService, RolesGuard],
  exports: [TeamService],
})
export class TeamModule {}
