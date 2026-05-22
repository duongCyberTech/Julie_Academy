import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentDashboard } from './student.dashboard';
import { AnalysisService } from 'src/analysis/analysis.service';
import { PartialFilterDTO } from '../dto/filter.dto';


@Injectable()
export class ParentDashboard {
  constructor(
    private readonly prisma: PrismaService,
    private readonly student: StudentDashboard,
    private readonly analysisService: AnalysisService,
  ) {}

  async getOverallStatsForChild(child_id: string) {
    const latestScore = await this.student.scoreOfLatestTest(child_id);
    const totalPracticeTime = await this.student.totalPracticeTime(child_id);
    const numJoinClassess = await this.student.currentClasses(child_id);
    const avgTestScore = await this.student.averageTestScore(child_id);
    const testStreak = await this.student.testStreak(child_id);
    const analytics = await this.analysisService.getAnalytics(child_id);
    const upcomingSchedules = await this.student.upcomingTodaySchedule(child_id);

    return {
      latestScore,
      totalPracticeTime,
      numJoinClassess,
      avgTestScore,
      testStreak,
      analytics,
      upcomingSchedules,
      // Đưa water_drops & experience ra mức root cho tiện UI
      water_drops: analytics?.water_drops ?? 0,
      experience: analytics?.experience ?? 0,
    };
  }

  async scoreTrendForChild(child_id: string, filter: PartialFilterDTO) {
    return this.student.scoreTrend(child_id, filter);
  }

  async skillsMapForChild(child_id: string, plan_id: string) {
    return this.student.skillsMap(child_id, plan_id);
  }

  async skillsMapDetailForChild(
    child_id: string,
    plan_id: string,
    chapter_id: string,
  ) {
    return this.student.skillsMapDetail(child_id, plan_id, chapter_id);
  }

  async currentActivitiesForChild(child_id: string, filter: PartialFilterDTO) {
    return this.student.currentActivities(child_id, filter);
  }

  async getPlansForChild(_child_id: string) {

    return this.prisma.lesson_Plan.findMany({
      where: { type: 'book' },
      orderBy: [{ type: 'desc' }, { title: 'asc' }],
    });
  }
}