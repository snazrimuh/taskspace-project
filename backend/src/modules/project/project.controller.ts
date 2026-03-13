import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('teams/:teamId/projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  getProjects(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getProjects(teamId, userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  createProject(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(teamId, userId, dto);
  }

  @Get(':projectId')
  getProject(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.getProject(teamId, projectId, userId);
  }

  @Patch(':projectId')
  updateProject(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProject(teamId, projectId, userId, dto);
  }

  @Delete(':projectId')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  deleteProject(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectService.deleteProject(teamId, projectId, userId);
  }
}
