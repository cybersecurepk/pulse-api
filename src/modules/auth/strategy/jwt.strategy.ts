import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../user/user.service";
import { TokenService } from "../../token/token.service";
import { AllConfigType } from "../../../config/config.type";
import { Request } from "express";
import { getJwtOptions } from "../../../utils/jwt-options";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<AllConfigType>,
    private userService: UserService,
    private tokenService: TokenService // ✅ inject token service
  ) {
    // Get JWT options from the shared utility
    const jwtOptions = getJwtOptions(configService);
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtOptions.secret as string, // Type assertion to resolve the type issue
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // Check if token exists before checking if it's revoked
    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    const isRevoked = await this.tokenService.isTokenRevoked(token);
    if (isRevoked) {
      throw new UnauthorizedException("Token has been revoked");
    }

    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}