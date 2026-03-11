import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AblyService } from './ably.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ChatController {
  constructor(
    private chatService: ChatService,
    private ablyService: AblyService,
  ) {}

  /** Ably token auth — frontend calls this to get a short-lived token */
  @Get('ably/auth')
  async ablyAuth(@CurrentUser('id') userId: string) {
    const tokenRequest = await this.ablyService.createTokenRequest(userId);
    return tokenRequest;
  }

  /** Get messages with cursor-based pagination */
  @Get('teams/:teamId/messages')
  getMessages(
    @Param('teamId') teamId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(teamId, cursor, limit ? parseInt(limit) : 30);
  }

  /** Send a message — saves to DB then publishes to Ably */
  @Post('teams/:teamId/messages')
  async sendMessage(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    const isMember = await this.chatService.isTeamMember(teamId, userId);
    if (!isMember) {
      throw new ForbiddenException('Not a member of this team');
    }

    const saved = await this.chatService.saveMessage(
      teamId,
      userId,
      dto.message.trim(),
    );

    // Publish to Ably so all subscribers get it in real-time
    await this.ablyService.publish(`team:${teamId}:chat`, 'message', saved);

    return saved;
  }

  /** Publish a typing indicator (no DB persistence) */
  @Post('teams/:teamId/messages/typing')
  async typing(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.ablyService.publish(`team:${teamId}:chat`, 'typing', { userId });
    return { ok: true };
  }
}
