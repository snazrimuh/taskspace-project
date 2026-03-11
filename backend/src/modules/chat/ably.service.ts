import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Rest } from 'ably';
import type { TokenRequest } from 'ably';

@Injectable()
export class AblyService implements OnModuleInit {
  private client: Rest;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ABLY_API_KEY');
    if (!apiKey) {
      throw new Error('ABLY_API_KEY is not configured');
    }
    this.client = new Rest(apiKey);
  }

  async createTokenRequest(clientId: string): Promise<TokenRequest> {
    return this.client.auth.createTokenRequest({
      clientId,
      capability: { '*': ['subscribe', 'publish', 'presence'] },
    });
  }

  async publish(channel: string, event: string, data: unknown): Promise<void> {
    const ch = this.client.channels.get(channel);
    await ch.publish(event, data);
  }
}
