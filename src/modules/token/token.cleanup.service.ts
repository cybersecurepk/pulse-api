import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TokenService } from "./token.service";

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private readonly tokenService: TokenService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCleanup(): Promise<void> {
    const removed = await this.tokenService.deleteExpiredTokens();
    if (removed > 0) {
      this.logger.log(`Removed ${removed} expired tokens`);
    }
  }
}


