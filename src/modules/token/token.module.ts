import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenService } from "./token.service";
import { JwtModule } from "@nestjs/jwt";
import { RefreshToken } from "../auth/entities/refresh-token.entity";
import { TokenCleanupService } from "./token.cleanup.service";
import { ConfigService } from "@nestjs/config";
import { getJwtOptions } from "../../utils/jwt-options";
import { AllConfigType } from "../../config/config.type";

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]), 
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<AllConfigType>) =>
        getJwtOptions(configService),
      inject: [ConfigService],
    })
  ],
  providers: [TokenService, TokenCleanupService],
  exports: [TokenService],
})
export class TokenModule {}