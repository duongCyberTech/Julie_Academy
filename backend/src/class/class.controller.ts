import { Controller, Get, Post, Body, Query, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClassService, ScheduleService } from './class.service';
import { ClassDto, ScheduleDto } from './dto/class.dto';

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

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService){}

  @Post('create/:class_id')
  createSchedule(
    @Param('class_id') class_id: string,
    @Body() data: ScheduleDto[] 
  ){
    return this.schedule.createSchedule(class_id, data)
  }

  @Post('delete/:class_id')
  deleteSchedule(
    @Param('class_id') class_id: string,
    @Query('mode') mode: boolean,
    @Body('data') data: number[]
  ){
    return this.schedule.deleteSchedule(class_id, mode, data)
  }

  @Get('get/all')
  getAllSchedule(){
    return this.schedule.getAllSchedule()
  }

  @Get('get/class/:class_id')
  getScheduleByClass(
    @Param('class_id') class_id: string 
  ){
    return this.schedule.getScheduleByClass(class_id)
  }
}