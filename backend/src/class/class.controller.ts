import { 
  Controller, 
  Get, Post, Patch, Delete,
  Body, Query, Param, 
  UseGuards 
} from '@nestjs/common';
import { ClassService, ScheduleService } from './class.service';
import { ClassDto, ScheduleDto } from './dto/class.dto';
import { ExceptionResponse } from 'src/exception/Exception.exception';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { DuplicatingObject } from 'src/mode/control.mode';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('create/:id')
  @Roles('tutor')
  async createClass(@Param('id') id: string, @Body() classDto: ClassDto) {
    return this.classService.createClass(id, classDto);
  }

  @Post('duplicate/:tutor_id/:class_id')
  duplicateClass(
    @Param('tutor_id') tutor_id: string,
    @Param('class_id') class_id: string,
    @Body('data') data: Partial<ClassDto>,
    @Body('dupLst') dupLst: DuplicatingObject[]
  ){
    return this.classService.duplicateClass(tutor_id, data, class_id, dupLst)
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

  @Post('enroll/:classId')
  @Roles('parents', 'tutor')
  async enrollClass(@Param('classId') classId: string, @Body('email') email: string) {
    return this.classService.enrollClass(classId, email);
  }

  @Patch(':class_id')
  @Roles('tutor', 'admin')
  updateClass(
    @Param('class_id') class_id: string,
    @Body() data : Partial<ClassDto>
  ){
    try {
      return this.classService.updateClass(class_id, data)
    } catch (e) {
      return new ExceptionResponse().returnError(e, `Class ${class_id}`)
    }
  }

  @Delete(':student_id/:class_id')
  cancelClass(
    @Param() param: any
  ){
    try {
      return this.classService.cancelClassAtStudentSide(param.student_id, param.class_id)
    } catch(e){
      return new ExceptionResponse().returnError(e, `Failure Canceling ${param.student_id} out class ${param.class_id}`)
    }
  }
}

@Controller('schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService){}

  @Post('create/:class_id')
  @Roles('tutor')
  createSchedule(
    @Param('class_id') class_id: string,
    @Body() data: ScheduleDto[] 
  ){
    return this.schedule.createSchedule(class_id, data)
  }

  @Post('delete/:class_id')
  @Roles('tutor')
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