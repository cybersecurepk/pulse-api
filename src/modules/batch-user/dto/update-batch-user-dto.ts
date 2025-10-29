import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchUserDto } from './create-batch-user-dto';

export class UpdateBatchUserDto extends PartialType(CreateBatchUserDto) {}

