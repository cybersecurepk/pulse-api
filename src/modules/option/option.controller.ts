import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { OptionService } from './option.service';
import { CreateOptionDto } from './dto/create-option-dto';
import { Option } from './entities/option.entity';
import { UpdateOptionDto } from './dto/update-option-dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Options')
@Controller('options')
export class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all options by question ID' })
  findAll(@Param('questionId') questionId: string): Promise<Option[]> {
    return this.optionService.findAllByQuestion(questionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an option by ID' })
  findOne(@Param('id') id: string): Promise<Option> {
    return this.optionService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new option' })
  create(
    @Param('questionId') questionId: string,
    @Body() createOptionDto: CreateOptionDto,
  ): Promise<Option> {
    return this.optionService.create(questionId, createOptionDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update an option by ID' })
  update(
    @Param('id') id: string,
    @Body() updateOptionDto: UpdateOptionDto,
  ): Promise<Option> {
    return this.optionService.update(id, updateOptionDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete an option by ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.optionService.remove(id);
  }
}
