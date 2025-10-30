import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user-dto';

// No changes needed – UpdateUserDto just extends CreateUserDto (which is now minimal).
export class UpdateUserDto extends PartialType(CreateUserDto) {}
