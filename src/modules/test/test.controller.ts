import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test-dto';
import { Test } from './entities/test.entity';
import { UpdateTestDto } from './dto/update-test-dto';
import { CreateScreenshotDto } from './dto/create-screenshot-dto';
import { TestScreenshot } from './entities/test-screenshot.entity';
import { UserRole } from 'src/enums/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmitTestAttemptDto } from './dto/submit-test-attempt-dto';
import { TestAttemptResultDto } from './dto/test-attempt-result-dto';

@Controller('tests')
@ApiBearerAuth('JWT-auth')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all tests' })
  findAll(): Promise<Test[]> {
    return this.testService.findAll();
  }

   @Get('attempts')
  @ApiOperation({ summary: 'Get all test attempts for admin panel' })
  async getAllTestAttempts() {
    return this.testService.getAllTestAttempts();
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Get a single test attempt by ID with full details' })
  @ApiResponse({ status: 200, description: 'Test attempt data with full details' })
  async getTestAttemptById(@Param('id') attemptId: string) {
    return this.testService.getTestAttemptById(attemptId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test by ID' })
  findOne(@Param('id') id: string): Promise<Test> {
    return this.testService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new test' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTestDto: CreateTestDto): Promise<Test> {
    return this.testService.create(createTestDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a test by ID' })
  update(
    @Param('id') id: string,
    @Body() updateTestDto: UpdateTestDto,
  ): Promise<Test> {
    return this.testService.update(id, updateTestDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a test by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.testService.remove(id);
  }

  @Post(':id/screenshots')
  @ApiOperation({ summary: 'Add a screenshot to a test' })
  @HttpCode(HttpStatus.CREATED)
  addScreenshot(
    @Param('id') testId: string,
    @Body() createScreenshotDto: CreateScreenshotDto,
  ): Promise<TestScreenshot> {
    return this.testService.addScreenshot(testId, createScreenshotDto);
  }

  @Get(':id/screenshots')
  @ApiOperation({ summary: 'Get all screenshots for a test' })
  getScreenshots(@Param('id') testId: string): Promise<TestScreenshot[]> {
    return this.testService.getScreenshotsByTestId(testId);
  }

  @Get(':id/attempt')
  @ApiOperation({ summary: 'Get test for user attempt (without correct answers)' })
  @ApiResponse({ status: 200, description: 'Test data without correct answer flags' })
  getTestForAttempt(@Param('id') testId: string) {
    return this.testService.getTestForAttempt(testId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit test attempt and get results' })
  @ApiResponse({ status: 200, description: 'Test attempt results with score' })
  @HttpCode(HttpStatus.OK)
  submitTestAttempt(
    @Param('id') testId: string,
    @Body() submitTestAttemptDto: SubmitTestAttemptDto,
  ): Promise<TestAttemptResultDto> {
    return this.testService.submitTestAttempt(
      testId,
      submitTestAttemptDto.userId,
      submitTestAttemptDto.answers,
      submitTestAttemptDto.timeSpent,
      submitTestAttemptDto.proctoringImages,
    );
  }

  @Get('user/:userId/unattempted')
  @ApiOperation({ summary: 'Get unattempted tests for a user' })
  async getUnattemptedTestsForUser(@Param('userId') userId: string) {
    return this.testService.getUnattemptedTestsForUser(userId);
  }

  @Get('user/:userId/unattempted-from-closed-batches')
  @ApiOperation({ summary: 'Get unattempted tests for a user from closed batches' })
  async getUnattemptedTestsFromClosedBatchesForUser(@Param('userId') userId: string) {
    return this.testService.getUnattemptedTestsFromClosedBatchesForUser(userId);
  }

  @Get('user/:userId/attempts')
  @ApiOperation({ summary: 'Get test attempts for a user' })
  async getUserTestAttempts(@Param('userId') userId: string) {
    return this.testService.getUserTestAttempts(userId);
  }

 
}
