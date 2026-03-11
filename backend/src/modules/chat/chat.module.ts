import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AblyService } from './ably.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, AblyService],
  exports: [ChatService, AblyService],
})
export class ChatModule {}
