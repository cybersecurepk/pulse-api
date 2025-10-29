import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class LoginRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'An email is required' })
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'A password is required to login' })
  readonly password: string;
}

export class TokenVerificationRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'A token is required' })
  readonly token: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'id is required' })
  readonly secretId: string;
}

export class ForgetPasswordEmailRequest {
  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly secretToken: string;
}

export class ResendOtpRequest {
  @ApiProperty()
  readonly secretId: string;
}

export class UpdatePasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'A password is required' })
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'An email is required' })
  readonly email: string;
}

export class UpdatePasswordForUserRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'A password is required' })
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'An email is required' })
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'An secret key is required' })
  readonly secretKey: string;
}

export class SetPasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'Old password is required' })
  readonly oldPassword: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'An password is required' })
  readonly password: string;
}
export class ResetPasswordRequest {
  @ApiProperty()
  @IsNotEmpty({ message: 'An password is required' })
  readonly password: string;
}
