import { PartialType } from '@nestjs/mapped-types';
import { CreateBatchTestDto } from './create-batch-test-dto';

export class UpdateBatchTestDto extends PartialType(CreateBatchTestDto) {}

