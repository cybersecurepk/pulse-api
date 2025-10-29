import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchInstructorDto } from './create-batch-instructor-dto';

export class UpdateBatchInstructorDto extends PartialType(CreateBatchInstructorDto) {}

