import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId;

    if (!user || !teamId) {
      throw new ForbiddenException('Access denied');
    }

    const teamMember = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: user.id,
          teamId,
        },
      },
    });

    if (!teamMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    if (!requiredRoles.includes(teamMember.role)) {
      throw new ForbiddenException(
        'You do not have the required role for this action',
      );
    }

    // Attach teamMember to request for downstream use
    request.teamMember = teamMember;

    return true;
  }
}
