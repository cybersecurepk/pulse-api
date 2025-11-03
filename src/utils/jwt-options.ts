import { ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";
import { AllConfigType } from "../config/config.type";

export const OPTIONS = "JWT_OPTIONS";

export const getJwtOptions = (
  configService: ConfigService<AllConfigType>
): JwtModuleOptions => ({
  secret: configService.get<string>("app.jwtSecret", { infer: true }) || "default-secret",
  signOptions: {
    expiresIn: configService.get("app.jwtExpiry", { infer: true }) || "1h",
  },
});