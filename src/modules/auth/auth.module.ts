import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import googleOauthConfig from '../../config/google-oauth.config';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { getJwtOptions } from "../../utils/jwt-options";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";  
import { JwtStrategy } from "./strategy/jwt.strategy";
import appConfig from '../../config/app.config';

@Module({
  imports: [
    UserModule,
    TokenModule,
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(appConfig),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        getJwtOptions(configService),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}