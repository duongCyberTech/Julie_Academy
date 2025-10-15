import { Controller, Get, Post, Body, Query, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassService } from './class.service';
import { ClassDto } from './dto/class.dto';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('create/:id')
  async createClass(@Param('id') id: string, @Body() classDto: ClassDto) {
    return this.classService.createClass(id, classDto);
  }

  @Get('get')
  async getAllClasses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('status') status?: string,
    @Query('startAt') startAt?: Date,
    @Query('endAt') endAt?: Date
  ) {
    return this.classService.getAllClasses(page, limit, search, status, startAt, endAt);
  }

  @Get('get/tutor/:id')
  async getClassesByTutor(@Param('id') id: string) {
    return this.classService.getClassesByTutor(id);
  }

  @Get('get/detail/:id')
  async getDetailedClass(@Param('id') id: string) {
    return this.classService.getDetailedClass(id);
  }

  @Post('enroll/:classId/:studentId')
  async enrollClass(@Param('classId') classId: string, @Param('studentId') studentId: string) {
    return this.classService.enrollClass(classId, studentId);
  }
}