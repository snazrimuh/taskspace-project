import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  getNotifications(@CurrentUser('id') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
