import {
    Injectable,
} from '@nestjs/common';
import { ExamType, PlanType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExamFilterType, FilterDTO, TimeRange } from 'src/dashboard/dto/filter.dto';
import { CategoryService } from 'src/question/question.service';

@Injectable()
export class StudentDashboard {
    constructor(
        private readonly prisma: PrismaService,
        private readonly category: CategoryService
    ) {}

    async scoreOfLatestTest(student_id: string) {
        return await this.prisma.exam_taken.findFirst({
            where: {isDone: true, student_uid: student_id, exam_session: { exam_type: ExamType.test }},
            select: {final_score: true},
            orderBy: {doneAt: "desc"}
        }).then(res => res?.final_score || 0)
    }
    
    async averageTestScore(student_id: string) {
      // 1. Lấy tất cả các bài Test đã nộp
      const scoreSet = await this.prisma.exam_taken.findMany({
        where: {
          student_uid: student_id,
          isDone: true,
          exam_id: { not: null },
          session_id: { not: null },
          exam_session: { exam_type: ExamType.test }, // Chỉ lấy bài Test
        },
        select: {
          final_score: true,
          exam_id: true,
          session_id: true,
        },
      });

      if (scoreSet.length === 0) return 0.0;

      // 2. Nhóm lại để lấy điểm cao nhất của mỗi bài
      const groupedScores = new Map();
      scoreSet.forEach((record) => {
        const key = `${record.exam_id}_${record.session_id}`;
        const currentScore = record.final_score.toNumber();
        if (!groupedScores.has(key)) {
          groupedScores.set(key, currentScore);
        } else {
          const existingScore = groupedScores.get(key);
          if (currentScore > existingScore) {
            groupedScores.set(key, currentScore);
          }
        }
      });

      // 3. Tính điểm trung bình
      let sum = 0;
      groupedScores.forEach((score) => (sum += score));
      return Number((sum / groupedScores.size).toFixed(2));
    }

    async currentClasses(student_id: string) {
        return await this.prisma.class.findMany({
            where: {
                learning: {some: {student_uid: student_id, status: "accepted"}},
                status: {in: ["pending", "ongoing"]}
            },
            select: {
                subject: true
            }
        }).then(res => ({
            total_classes: res.length,
            subjects: [...new Set(res.map(klass => klass.subject))] 
        }))
    }

    async totalPracticeTime(student_id: string) {
        return await this.prisma.exam_taken.findMany({
            where: {
                isDone: true, 
                student_uid: student_id,
                exam_id: null,
                session_id: null
            },
            select: {
                doneAt: true,
                startAt: true
            }
        }).then(res => res.reduce((acc, cur) => acc + (cur.doneAt.getTime() - cur.startAt.getTime()), 0) / (1000 * 60 * 60))
    }

    async currentActivities(student_id: string, filter: Partial<FilterDTO>) {
        const take: number = Number(filter.limit ?? 10)
        const skip: number = ((filter.page ?? 1) - 1) * (filter.limit ?? 10)

        return await this.prisma.exam_taken.findMany({
            where: {
                student_uid: student_id,
                isDone: true,
                // Lọc theo loại bài thi 
                ...(filter.exam_type && filter.exam_type !== 'all' ? {
                    exam_session: { exam_type: filter.exam_type as any }
                } : {}),

                ...(filter.startAt ? {startAt: {gte: filter.startAt}} : {}),
                ...(filter.endAt ? {doneAt: {lte: filter.endAt}} : {})
            },
            select: {
                exam_session: {
                    select: {
                        exam_type: true,
                        exam: {
                            select: {
                                title: true
                            }
                        },
                        exam_open_in: {
                            select: {
                                class: {
                                    select: {
                                        subject: true
                                    }
                                }
                            }
                        }
                    }
                },
                final_score: true,
                doneAt: true
            },
            orderBy: [
                {doneAt: "desc"},
                {startAt: "desc"}
            ],
            take,
            skip
        }).then(res => res.map(ex => ({
            title: ex.exam_session.exam.title,
            subject: ex.exam_session.exam_open_in[0].class.subject,
            exam_type: ex.exam_session.exam_type,
            score: ex.final_score,
            doneAt: ex.doneAt
        })))
    }

    async scoreTrend(student_id: string, filter: Partial<FilterDTO>) {
        const timeRange: TimeRange = filter?.group_time ?? TimeRange.week
        const examType: ExamFilterType = filter?.exam_type ?? ExamFilterType.practice

        const examTypeCondition = examType == ExamFilterType.all ? {} : (
            examType == ExamFilterType.practice ?
            {exam_session: {exam_type: ExamType.practice}, exam_id: {not: null}, session_id: {not: null}} : (
                examType == ExamFilterType.test ? 
                {exam_session: {exam_type: ExamType.test}, exam_id: {not: null}, session_id: {not: null}} :
                {exam_id: null, session_id: null}
            )
        ) 

        const currentDate = new Date()
        const dateAgo = new Date(currentDate)
        dateAgo.setDate(
            timeRange == TimeRange.week ? currentDate.getDate() - 7 : 
            timeRange == TimeRange.month ? currentDate.getDate() - 30 : 
            timeRange == TimeRange.term ? currentDate.getDate() - 112 : 
            currentDate.getDate() - 365
        )

        currentDate.setHours(23, 59, 59, 999)
        dateAgo.setHours(0, 0, 0, 0)

        const scoreSet = await this.prisma.exam_taken.findMany({
            where: {
                student_uid: student_id,
                isDone: true,
                doneAt: { gte: dateAgo, lte: currentDate },
                ...(examTypeCondition)
            },
            select: {
                final_score: true,
                doneAt: true,
                exam_id: true,
                session_id: true
            },
            orderBy: { doneAt: 'asc' }
        });

        const groupedScores = new Map();
        const nullRecords = [];

        scoreSet.forEach(record => {
            const { exam_id, session_id, final_score } = record;

            if (exam_id === null && session_id === null) {
                nullRecords.push(record);
                return;
            }

            const key = `${exam_id}_${session_id}`;

            if (!groupedScores.has(key)) {
                groupedScores.set(key, record);
            } else {
                const existingRecord = groupedScores.get(key);
                if (final_score > existingRecord.final_score) {
                    groupedScores.set(key, record);
                }
            }
        });

        const finalResults = [...Array.from(groupedScores.values()), ...nullRecords];

        const getGroupKey = (date: Date, range: TimeRange): string => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');

            if (range == TimeRange.week) {
                return d.toISOString().split('T')[0];
            } 
            
            if (range == TimeRange.month) {
                const firstDayOfMonth = new Date(year, d.getMonth(), 1);
                const weekOfMonth = Math.ceil((d.getDate() + firstDayOfMonth.getDay()) / 7);
                return `Tháng ${month} - Tuần ${weekOfMonth}`;
            } 

            if (range == TimeRange.term) {
                const diffTime = Math.abs(currentDate.getTime() - d.getTime());
                const weekNum = 16 - Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
                return `Tuần ${weekNum > 0 ? weekNum : 1}`;
            }

            return `${year}-${month}`; 
        };

        const grouped: Record<string, { sum: number; count: number }> = finalResults.reduce((acc, curr) => {
            const key = getGroupKey(curr.doneAt, timeRange);
            if (!acc[key]) acc[key] = { sum: 0, count: 0 };

            acc[key].sum += curr.final_score.toNumber(); 
            acc[key].count += 1;
            
            return acc;
        }, {} as Record<string, { sum: number; count: number }>);

        const result = Object.entries(grouped).map(([label, data]) => ({
            label,
            averageScore: data.sum / data.count
        }));

        return {score_trend: result, total: finalResults.length}
    }

    async skillsMap(student_id: string, plan_id: string) {
        const noticeCategories: {
            category_id: string,
            category_name: string,
            correct_cnt: number,
            fail_cnt: number
        }[] = await this.prisma.$queryRaw`
            SELECT 
                c."category_id", 
                c."category_name",
                COUNT(CASE WHEN qet."isCorrect" = true THEN 1 END) AS correct_cnt,
                COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END) AS fail_cnt
            FROM public."Categories" AS c
            JOIN public."Structure" AS st ON c."category_id" = st."cate_id"
            JOIN public."Lesson_Plan" AS lp ON st."plan_id" = lp."plan_id"
            JOIN public."Questions" AS q ON c."category_id" = q."category_id"
            JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
            JOIN public."Exam_taken" as et on et."et_id" = qet."et_id"
            WHERE 
                lp."plan_id" = ${plan_id} 
                AND lp."type" = ${PlanType.book} 
                AND et."student_uid" = ${student_id} 
                AND et."exam_id" = NULL
                AND et."session_id" = NULL
            GROUP BY c."category_id", c."category_name";
        `

        const list = await Promise.all(
            noticeCategories.map(async (item) => {
                const rootCategory = await this.category.getRoot(item.category_id);
                return {
                    category_id: rootCategory.category_id,
                    category_name: rootCategory.category_name,
                    correct_cnt: item.correct_cnt,
                    fail_cnt: item.fail_cnt
                };
            })
        );

        const groupedList = Object.values(
            list.reduce((acc, curr) => {
                const id = curr.category_id;
                
                if (!acc[id]) {
                    acc[id] = {
                        category_id: id,
                        category_name: curr.category_name,
                        correct_cnt: 0,
                        fail_cnt: 0
                    };
                }

                acc[id].correct_cnt += curr.correct_cnt;
                acc[id].fail_cnt += curr.fail_cnt;
                
                return acc;
            }, {} as Record<string, any>)
        );

        return groupedList || []
    }

    // Lấy chi tiết các chủ đề khi click vào 1 chương
    async skillsMapDetail(student_id: string, plan_id: string, chapter_id: string) {
        const detailCategories: {
            category_id: string,
            category_name: string,
            correct_cnt: number,
            fail_cnt: number
        }[] = await this.prisma.$queryRaw`
            SELECT 
                c."category_id", 
                c."category_name",
                COUNT(CASE WHEN qet."isCorrect" = true THEN 1 END) AS correct_cnt,
                COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END) AS fail_cnt
            FROM public."Categories" AS c
            JOIN public."Structure" AS st ON c."category_id" = st."cate_id"
            JOIN public."Lesson_Plan" AS lp ON st."plan_id" = lp."plan_id"
            JOIN public."Questions" AS q ON c."category_id" = q."category_id"
            JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
            JOIN public."Exam_taken" as et on et."et_id" = qet."et_id"
            WHERE 
                lp."plan_id" = ${plan_id} 
                AND c."parent_id" = ${chapter_id} -- Lọc lấy các chủ đề con của Chương được click
                AND et."student_uid" = ${student_id} 
                AND et."exam_id" IS NULL
                AND et."session_id" IS NULL
            GROUP BY c."category_id", c."category_name";
        `
        
        return detailCategories.map(item => ({
            category_id: item.category_id,
            category_name: item.category_name,
            correct_cnt: Number(item.correct_cnt),
            fail_cnt: Number(item.fail_cnt)
        })) || [];
    }
}

