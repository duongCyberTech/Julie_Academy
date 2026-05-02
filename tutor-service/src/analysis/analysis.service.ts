import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AnalyticsDto,
  ActionConfigDto,
  LevelConfigDto,
} from './dto/analysis.dto';

@Injectable()
export class AdminConfigService {
  constructor(private prisma: PrismaService) {}

  async createNewLevelConfig(exp_required: LevelConfigDto) {
    return await this.prisma.levelConfig.create({
      data: {
        ...exp_required,
      },
    });
  }

  async getAllLevelConfigs() {
    return await this.prisma.levelConfig.findMany({
      orderBy: {
        level: 'asc',
      },
    });
  }

  async createNewActionConfig(
    title: string,
    description: string,
    drops_claim: number,
  ) {
    return await this.prisma.actionConfig.create({
      data: {
        title,
        description,
        drops_claim,
      },
    });
  }

  async getAllActionConfigs() {
    return await this.prisma.actionConfig.findMany({
      orderBy: {
        title: 'asc',
      },
    });
  }

  async updateLevelConfig(level: number, data: LevelConfigDto) {
    return await this.prisma.levelConfig.update({
      where: { level },
      data: { ...data },
    });
  }

  async updateActionConfig(action_id: string, data: Partial<ActionConfigDto>) {
    return await this.prisma.actionConfig.update({
      where: { action_id },
      data: { ...data },
    });
  }
}

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateAnalytics(uid: string, data: Partial<AnalyticsDto>) {
    const { streak_trigger, ...newData } = data;
    const existingData = await this.prisma.student_analytics.findFirst({
      where: { student_id: uid },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const activityDate = existingData?.last_activity_at
      ? new Date(existingData.last_activity_at)
      : new Date();

    activityDate.setHours(0, 0, 0, 0);

    const diffInMs = now.getTime() - activityDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (streak_trigger && existingData && diffInDays <= 1) {
      return await this.prisma.student_analytics.update({
        where: { student_id: uid },
        data: {
          streak: { increment: 1 },
          water_drops: { increment: newData.water_drops ?? 0 },
          experience: { increment: newData.experience ?? 0 },
          last_activity_at: new Date(),
        },
      });
    }

    return await this.prisma.student_analytics.upsert({
      where: { student_id: uid },
      update: {
        water_drops: { increment: newData.water_drops ?? 0 },
        experience: { increment: newData.experience ?? 0 },
        last_activity_at: new Date(),
        ...(streak_trigger ? { streak: 1 } : {}),
      },
      create: {
        student: { connect: { uid } },
        streak: 1,
        last_activity_at: new Date(),
        ...newData,
      },
      select: {
        water_drops: true,
        experience: true,
        streak: true,
      },
    });
  }

  async getAnalytics(uid: string) {
    return await this.prisma.student_analytics.findUnique({
      where: { student_id: uid },
    });
  }
}

@Injectable()
export class TutorAnalysisService {
  constructor(private prisma: PrismaService) {}

  async getExamSessionDashboard(
    tutor_uid: string,
    class_id: string,
    exam_id: string,
    session_id: number,
  ) {
    const checkClass = await this.prisma.class.findFirst({
      where: { class_id, tutor_uid },
    });
    if (!checkClass)
      throw new ForbiddenException('Không có quyền truy cập lớp học này.');

    const examTakens = await this.prisma.exam_taken.findMany({
      where: {
        exam_id: exam_id.trim(),
        session_id: Number(session_id),
      },
      orderBy: { final_score: 'desc' },
      include: {
        student: { select: { user: { select: { fname: true, lname: true } } } },
        questions: { include: { question: true } },
      },
    });

    const enrolledStudents = await this.prisma.learning.findMany({
      where: { class_id },
      select: {
        student_uid: true,
        student: { select: { user: { select: { fname: true, lname: true } } } },
      },
    });

    const allUids = new Set<string>();
    enrolledStudents.forEach((s) => allUids.add(s.student_uid));
    examTakens.forEach((e) => allUids.add(e.student_uid));

    let submitted = 0;
    let pending = 0;
    let totalScore = 0;
    let maxScore = 0;
    const scoreDistribution = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0,
    };
    const questionStats = new Map<
      string,
      { title: string; fail_count: number; total_attempts: number }
    >();
    const difficultyStats = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    const studentList = Array.from(allUids).map((uid) => {
      const bestAttempt = examTakens.find((e) => e.student_uid === uid);
      const enrollData = enrolledStudents.find((e) => e.student_uid === uid);

      let status = 'Chưa làm';
      let scoreVal = null;
      let time_spent_mins = 0;

      if (bestAttempt) {
        if (bestAttempt.isDone) {
          status = 'Đã nộp';
          submitted++;

          scoreVal = Number(
            bestAttempt.final_score ? bestAttempt.final_score.toString() : 0,
          );
          totalScore += scoreVal;
          if (scoreVal > maxScore) maxScore = scoreVal;

          if (scoreVal <= 2) scoreDistribution['0-2']++;
          else if (scoreVal <= 4) scoreDistribution['2-4']++;
          else if (scoreVal <= 6) scoreDistribution['4-6']++;
          else if (scoreVal <= 8) scoreDistribution['6-8']++;
          else scoreDistribution['8-10']++;
        } else {
          status = 'Đang làm';
          pending++;
        }

        const timeDiff =
          new Date(bestAttempt.doneAt).getTime() -
          new Date(bestAttempt.startAt).getTime();
        time_spent_mins = isNaN(timeDiff) ? 0 : Math.round(timeDiff / 60000);

        if (bestAttempt.isDone && bestAttempt.questions) {
          bestAttempt.questions.forEach((qet) => {
            const q = qet.question;
            if (!q) return;

            if (!questionStats.has(q.ques_id)) {
              questionStats.set(q.ques_id, {
                title: q.title,
                fail_count: 0,
                total_attempts: 0,
              });
            }
            const qStat = questionStats.get(q.ques_id)!;
            qStat.total_attempts++;
            if (!qet.isCorrect) qStat.fail_count++;

            const lvl = q.level || 'medium';
            if (difficultyStats[lvl as keyof typeof difficultyStats]) {
              difficultyStats[lvl as keyof typeof difficultyStats].total++;
              if (qet.isCorrect)
                difficultyStats[lvl as keyof typeof difficultyStats].correct++;
            }
          });
        }
      }

      let name = 'Học sinh ẩn';
      if (bestAttempt?.student?.user) {
        name =
          `${bestAttempt.student.user.fname || ''} ${bestAttempt.student.user.lname || ''}`.trim();
      } else if (enrollData?.student?.user) {
        name =
          `${enrollData.student.user.fname || ''} ${enrollData.student.user.lname || ''}`.trim();
      }

      return {
        uid,
        name,
        score: scoreVal,
        status,
        time_spent: Math.max(0, time_spent_mins),
      };
    });

    const hardestQuestions = Array.from(questionStats.entries())
      .map(([ques_id, q]) => ({
        ques_id,
        title: q.title,
        fail_rate:
          q.total_attempts > 0
            ? Math.round((q.fail_count / q.total_attempts) * 100)
            : 0,
      }))
      .sort((a, b) => b.fail_rate - a.fail_rate)
      .slice(0, 3);

    const difficultyArray = Object.keys(difficultyStats).map((level) => {
      const stat = difficultyStats[level as keyof typeof difficultyStats];
      return {
        level,
        accuracy:
          stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
      };
    });

    return {
      overview: {
        average_score:
          submitted > 0 ? Number((totalScore / submitted).toFixed(2)) : 0,
        max_score: maxScore,
        submitted_count: submitted,
        total_enrolled: allUids.size,
      },
      charts: {
        submission_status: {
          submitted,
          pending,
          not_started: allUids.size - (submitted + pending),
        },
        score_distribution: scoreDistribution,
        hardest_questions: hardestQuestions,
        accuracy_by_difficulty: difficultyArray,
      },
      student_list: studentList,
    };
  }
}
