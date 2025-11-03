import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { User, ApplicationStatus } from "../user/entities/user.entity";
import { randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "../token/token.service";
import { AuthResponseDto } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
          private tokenService: TokenService,
    ) {}

    private generateRefreshTokenPayload(userPayload: any) {
        return {
            ...userPayload,
            jti: randomBytes(16).toString("hex"), // unique token identifier (JWT ID)
            iat: Math.floor(Date.now() / 1000), // issued at timestamp
        };
    }

    async validateGoogleUser(googleUser: any): Promise<User> {
        // Check if user exists in database
        const user = await this.userService.findByEmail(googleUser.email);
        
        // If user doesn't exist, they haven't been registered as an applicant
        if (!user) {
            throw new UnauthorizedException('Email not found in applicant database');
        }
        
        // Check if user's application is approved
        if (user.applicationStatus !== ApplicationStatus.APPROVED) {
            throw new UnauthorizedException('Account not approved yet');
        }
        
        // User exists and is approved, return the user object
        return user;
    }
    
    async loginWithUser(user: User): Promise<AuthResponseDto> {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(
        this.generateRefreshTokenPayload(payload),
        { expiresIn: "7d" }
        );

        await this.tokenService.saveToken(refreshToken, user);
        
        // Return the user object with only the necessary fields
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            applicationStatus: user.applicationStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        
        return { accessToken, refreshToken, user: userResponse };
    }
}