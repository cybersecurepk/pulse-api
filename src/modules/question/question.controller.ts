import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question-dto';
import { Question } from './entities/question.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all questions by test ID' })
  findAll(@Param('testId') testId: string): Promise<Question[]> {
    return this.questionService.findAllByTest(testId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  findOne(@Param('id') id: string): Promise<Question> {
    return this.questionService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new question' })
  create(
    @Param('testId') testId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.create(testId, createQuestionDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a question by ID' })
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a question by ID' })
  remove(@Param('id') id: string): Promise<void> {
    return this.questionService.remove(id);
  }
}
