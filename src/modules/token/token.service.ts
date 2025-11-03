import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { RefreshToken } from "../auth/entities/refresh-token.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private tokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService
  ) {}

  async saveToken(token: string, user: User): Promise<void> {
    const payload = this.jwtService.decode(token) as any;
    const expiry = payload?.exp ? new Date(payload.exp * 1000) : null;
    
    const tokenRecord = this.tokenRepo.create({
      token,
      isRevoked: false,
      tokenExpiry: expiry,
      userId: user.id,
    } as RefreshToken);

    await this.tokenRepo.save(tokenRecord);
  }

  async revokeToken(token: string): Promise<void> {
    const record = await this.tokenRepo.findOne({
      where: { token, isRevoked: false },
    });

    if (record) {
      record.isRevoked = true;
      await this.tokenRepo.save(record);
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const record = await this.tokenRepo.findOne({ where: { token } });
    return record?.isRevoked ?? false;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const activeTokens = await this.tokenRepo.find({
      where: { isRevoked: false, userId },
    });

    if (activeTokens.length === 0) return;

    for (const token of activeTokens) {
      token.isRevoked = true;
    }

    await this.tokenRepo.save(activeTokens);
  }

  async deleteExpiredTokens(now: Date = new Date()): Promise<number> {
    const result = await this.tokenRepo
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('tokenExpiry IS NOT NULL AND tokenExpiry < :now', { now })
      .execute();

    return result.affected ?? 0;
  }
}