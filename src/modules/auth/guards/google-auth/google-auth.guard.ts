import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Use the default AuthGuard behavior
  // It will either authenticate successfully or throw an exception
  // The controller will handle all redirects
}