import {
    Injectable,
} from '@nestjs/common';
import { ClassStatus, ExamType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttentionIssue, ExamFilterType, FilterDTO, PartialFilterDTO, TimeRange } from '../dto/filter.dto';

@Injectable()
export class TutorDashboard {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async getNumStudentsOfTutor(tutor_id: string){
        const [total, ongoing] = await Promise.all([
            // 1. Đếm tổng học sinh ĐÃ ĐƯỢC DUYỆT (accepted) vào tất cả các lớp của Gia sư
            this.prisma.student.count({
                where: {
                    learning: {
                        some: { 
                            class: { tutor_uid: tutor_id },
                            status: "accepted" // Lọc học sinh đã được duyệt
                        }
                    }
                }
            }),
            // 2. Chỉ đếm học sinh ĐÃ ĐƯỢC DUYỆT trong các lớp ĐANG DIỄN RA (ongoing)
            this.prisma.student.count({
                where: {
                    learning: {
                        some: { 
                            class: { 
                                tutor_uid: tutor_id,
                                status: "ongoing" // Lớp đang diễn ra
                            },
                            status: "accepted" // Học sinh đã được duyệt
                        }
                    }
                }
            })
        ]);

        return { total, ongoing };
    }

    async getNumClasses(tutor_id: string){
        const [total, ongoing] = await this.prisma.class.groupBy({
            where: { tutor_uid: tutor_id },
            by: ['status'],
            _count: {
                class_id: true
            }
        }).then(res => [
            res.reduce((acc, cur) => acc + cur._count.class_id, 0) || 0, 
            res?.find(i => i.status == 'ongoing')?._count.class_id || 0
        ])

        return { total, ongoing };
    }

    async getNumLessonPlan(tutor_id: string){
        return this.prisma.lesson_Plan.count({
            where: {
                tutor: { uid: tutor_id }
            }
        })
    }

    async getNumMyQuestion(tutor_id: string){
        return this.prisma.questions.count({
            where: {
                tutor: {uid: tutor_id}
            }
        })
    }

    async getTodayUpcomingSchedule(tutor_id: string){
        try {
            const currentDate = new Date()

            const upcomingSchedules = await this.prisma.$queryRaw(
                Prisma.sql`
                    SELECT s.*, c."classname", c."subject", c."grade"
                    FROM public."Schedule" as s
                    join public."Class" as c on s."class_id" = c."class_id"
                    where
                        c."tutor_uid" = ${tutor_id} AND
                        s."meeting_date" = ${(currentDate.getDay() == 0 ? 8 : currentDate.getDay() + 1)}
                    order by s."startAt"
                `)

            return upcomingSchedules
        } catch (error) {
            return []
        }
    }

    async getWeeklyClassESProgress(tutor_id: string, class_id: string, day_range: number = 1) {
        try {
            const currentDate = new Date()
            const _ndaysAgo = new Date()
            _ndaysAgo.setDate(currentDate.getDate() - day_range)
            currentDate.setHours(23, 59, 59, 999)
            _ndaysAgo.setHours(0, 0, 0, 0)

            const cntClassStudent = await this.prisma.class.findUnique({
                where: {class_id},
                select: {
                    class_id: true,
                    classname: true,
                    _count: {
                        select: {
                            learning: {
                                where: {
                                    class_id,
                                    status: "accepted"
                                }
                            }
                        }
                    },
                    exam_open_in: {
                        select: {
                            exam_session: {
                                select: {
                                    exam_id: true,
                                    session_id: true,
                                    exam: {
                                        select: {
                                            title: true,
                                            description: true,
                                            level: true,
                                            duration: true,
                                            total_ques: true,
                                            total_score: true
                                        }
                                    },
                                    examTakens: {
                                        select: {
                                            student_uid: true
                                        },
                                        distinct: ['student_uid']
                                    }
                                }
                            }
                        }
                    }
                }
            }).then(res => ({
                class_id: res?.class_id,
                classname: res?.classname,
                total_students: res?._count.learning,
                es_mapper: res?.exam_open_in.map(item => {
                    return {
                        exam_session: item.exam_session,
                        number_of_students_done: item.exam_session.examTakens.length
                    }
                })
            }))

            return cntClassStudent
        } catch (error) {
            return []
        }
    }

    async getDangerCategories(tutor_id: string) {
        try {
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
                LEFT JOIN public."Questions" AS q ON c."category_id" = q."category_id"
                LEFT JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
                LEFT JOIN public."Exam_taken" AS et ON qet."et_id" = et."et_id"
                LEFT JOIN public."Exam_open_in" AS eoi ON et."exam_id" = eoi."exam_id" AND et."session_id" = eoi."session_id"
                LEFT JOIN public."Class" AS cl ON eoi."class_id" = cl."class_id"
                WHERE cl."tutor_uid" = ${tutor_id}
                GROUP BY c."category_id", c."category_name"
                HAVING COUNT(CASE WHEN qet."isCorrect" = true THEN 1 END) > 0 
                    OR COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END) > 0
                    
                ORDER BY fail_cnt DESC, correct_cnt ASC
                LIMIT 5;
            `

            return noticeCategories || []
        } catch (error) {
            return []
        }
    }

    async attentionRequiredStudents(tutor_id: string, query: PartialFilterDTO) {
        const page: number = Number(query?.page ?? 1)
        const limit: number = Number(query?.limit ?? 10)

        const grade_threshold: number = Number(query?.grade_threshold ?? 1.0)
        const test_miss_threshold: number = Number(query?.test_miss_threshold ?? 1)

        const examType: ExamFilterType = query?.exam_type ?? ExamFilterType.practice

        const examTypeCondition = examType == ExamFilterType.all ? {} : (
            examType == ExamFilterType.practice ?
            {exam_session: {exam_type: ExamType.practice}} : (
                examType == ExamFilterType.test ? 
                {exam_session: {exam_type: ExamType.test}} :
                {}
            )
        )

        const time_range: TimeRange = query?.group_time ?? TimeRange.week
        const now = new Date()
        let past = new Date(now)

        const issue: AttentionIssue = query?.issue ?? AttentionIssue.all

        let exam_score_report: any[] = []
        let exam_miss_report: any[] = []

        if (issue == AttentionIssue.all || issue == AttentionIssue.downgrade) {
            switch(time_range) {
                case TimeRange.month: {
                    past.setMonth(now.getMonth() - 2);
                    break;
                }
                case TimeRange.year: {
                    past.setFullYear(now.getFullYear() - 2);
                    break;
                }
                default: {
                    past.setDate(now.getDate() - 2 * 7)
                    break;
                }
            }

            let raw_score_report = await this.prisma.student.findMany({
                where: {
                    learning: { some: { class: { tutor_uid: tutor_id } } },
                    exam_taken: {
                        some: {
                            exam_id: { not: null },
                            isDone: true,
                            doneAt: { lte: now },
                            ...(examTypeCondition || {})
                        },
                    }
                },
                select: {
                    user: { select: { uid: true, fname: true, mname: true, lname: true } },
                    learning: {
                        select: {
                            class: {
                                select: {
                                    class_id: true,
                                    classname: true,
                                    exam_open_in: {
                                        select: {
                                            exam_id: true,
                                            session_id: true,
                                        }
                                    }
                                },
                            }
                        }
                    },
                    exam_taken: {
                        where: {
                            exam_id: { not: null },
                            exam_session: {
                                ...(examTypeCondition?.exam_session || {})
                            },
                            isDone: true,
                            doneAt: { lte: now },
                        },
                        orderBy: { doneAt: 'desc' },
                        select: {
                            exam_id: true,
                            session_id: true,
                            final_score: true,
                            doneAt: true
                        }
                    }
                },
                take: limit,
                skip: (page - 1) * limit,
            })
            
            const transformed_score_report = raw_score_report.map(student => ({
                info: student.user,
                learning: student.learning.map(l => ({
                    class_id: l.class.class_id,
                    classname: l.class.classname,
                    student_exams: l.class.exam_open_in.filter(eoi => student.exam_taken.some(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)).map(eoi => ({
                        exam_id: eoi.exam_id,
                        session_id: eoi.session_id,
                        final_score: student.exam_taken
                                    .filter(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)
                                    .sort((a, b) => Number(b.final_score) - Number(Number(a.final_score)))[0]?.final_score ?? null,
                        doneAt: student.exam_taken
                                    .filter(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)
                                    .sort((a, b) => Number(b.final_score) - Number(a.final_score))[0]?.doneAt ?? null,
                    }))
                }))
            }));

            exam_score_report = transformed_score_report.map(student => {
                
                // ==========================================
                // STEP 0: Tạo Map tra cứu Lớp học cho từng bài test
                // ==========================================
                const sessionToClassMap = new Map<string, { class_id: string, classname: string }>();

                for (const l of student.learning) {
                    for (const open_in of l.student_exams) {
                        // Khóa (Key) là tổ hợp exam_id và session_id
                        const key = `${open_in.exam_id}_${open_in.session_id}`;
                        sessionToClassMap.set(key, {
                            class_id: l.class_id,
                            classname: l.classname
                        });
                    }
                }

                // ==========================================
                // STEP 1: Lọc điểm cao nhất per {exam_id, session_id}
                // ==========================================
                const bestExamsMap = new Map();

                for (const l of student.learning) {
                    for (const exam of l.student_exams) {
                        const key = `${exam.exam_id}_${exam.session_id}`;
                        const existing = bestExamsMap.get(key);
                        
                        if (!existing || Number(exam.final_score) > Number(existing.final_score)) {
                            bestExamsMap.set(key, exam);
                        }
                    }
                }

                // Sort lại mảng các bài thi có điểm cao nhất theo đúng thứ tự thời gian nộp bài
                const filteredExams = Array.from(bestExamsMap.values())
                    .sort((a, b) => new Date(a.doneAt).getTime() - new Date(b.doneAt).getTime());

                // ==========================================
                // STEP 2: Phân nhóm theo Lớp -> Phân nhóm theo Thời gian
                // ==========================================

                const getGroupKey = (doneAt: Date): string => {
                    const d = new Date(doneAt);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    if (time_range === TimeRange.year) {
                        return `${year}-${month}`;
                    }
                    if (time_range === TimeRange.month) {
                        const firstDayOfMonth = new Date(year, d.getMonth(), 1);
                        const weekOfMonth = Math.ceil((d.getDate() + firstDayOfMonth.getDay()) / 7);
                        return `${year}-${month}-W${String(weekOfMonth).padStart(2, '0')}`;
                    }
                    return d.toISOString().split('T')[0];
                };

                const classesMap = new Map<string, { classname: string; timeGroups: Map<string, { totalScore: number; count: number }> }>();

                for (const exam of filteredExams) {
                    const key = `${exam.exam_id}_${exam.session_id}`;
                    const classInfo = sessionToClassMap.get(key);

                    if (!classInfo) continue;

                    const classId = classInfo.class_id;
                    const className = classInfo.classname;

                    if (!classesMap.has(classId)) {
                        classesMap.set(classId, { classname: className, timeGroups: new Map() });
                    }
                    const currentClass = classesMap.get(classId)!;

                    const timeKey = getGroupKey(exam.doneAt);

                    if (!currentClass.timeGroups.has(timeKey)) {
                        currentClass.timeGroups.set(timeKey, { totalScore: 0, count: 0 });
                    }

                    const tGroup = currentClass.timeGroups.get(timeKey)!;
                    tGroup.totalScore += Number(exam.final_score?.toNumber?.() ?? exam.final_score);
                    tGroup.count += 1;
                }

                // ==========================================
                // STEP 3 & 4: Tính trung bình & So sánh ngưỡng (Threshold)
                // ==========================================
                const flaggedClasses = [];

                for (const [classId, classData] of classesMap.entries()) {
                    const periods = Array.from(classData.timeGroups.entries())
                        .map(([period, group]) => ({
                            period,
                            avg_score: Number((group.totalScore / group.count).toFixed(2))
                        }))
                        .sort((a, b) => a.period.localeCompare(b.period));

                    const len = periods.length;

                    if (len > 1) {
                        const latestAvg = periods[len - 1].avg_score;
                        const previousAvg = periods[len - 2].avg_score;
                        const score_diff = Number((latestAvg - previousAvg).toFixed(2));

                        if (score_diff <= -grade_threshold) {
                            flaggedClasses.push({
                                class_id: classId,
                                classname: classData.classname,
                                score_diff,
                                history: periods
                            });
                        }
                    }
                }

                return {
                    info: student.info,
                    flagged_classes: flaggedClasses
                };
            });
        }

        if (issue == AttentionIssue.all || issue == AttentionIssue.test_miss) {
            const missFrom = new Date(now);
            switch(time_range) {
                case TimeRange.month: {
                    missFrom.setMonth(now.getMonth() - 1);
                    break;
                }
                case TimeRange.year: {
                    missFrom.setFullYear(now.getFullYear() - 1);
                    break;
                }
                default: {
                    missFrom.setDate(now.getDate() - 7);
                    break;
                }
            }

            const raw_miss_report = await this.prisma.student.findMany({
                where: {
                    learning: {
                        some: { class: { tutor_uid: tutor_id } }
                    }
                },
                select: {
                    user: {
                        select: { uid: true, fname: true, mname: true, lname: true }
                    },
                    exam_taken: {
                        where: {
                            exam_id: { not: null },
                            exam_session: { startAt: { gte: missFrom, lte: now } }
                        },
                        select: { exam_id: true, session_id: true }
                    },
                    learning: {
                        where: { class: { tutor_uid: tutor_id } },
                        select: {
                            class: {
                                select: {
                                    class_id: true,
                                    classname: true,
                                    exam_open_in: {
                                        where: {
                                            exam_session: {
                                                startAt: { gte: missFrom, lte: now },
                                                expireAt: { lte: now }
                                            }
                                        },
                                        select: { exam_id: true, session_id: true }
                                    }
                                }
                            }
                        }
                    }
                },
                take: limit,
                skip: (page - 1) * limit
            }).then(res => res.map(item => {
                const takenKeys = new Set(
                    item.exam_taken.map(et => `${et.exam_id}_${et.session_id}`)
                );
                return {
                    info: item.user,
                    num_test_missed: item.learning.map(l => ({
                        class_id: l.class.class_id,
                        classname: l.class.classname,
                        num_missed: l.class.exam_open_in.filter(
                            eoi => !takenKeys.has(`${eoi.exam_id}_${eoi.session_id}`)
                        ).length
                    })).filter(l => l.num_missed >= test_miss_threshold)
                };
            }).filter(item => item.num_test_missed.length > 0));

            exam_miss_report = raw_miss_report
        }

        return {
            exam_score_report,
            exam_miss_report
        }
    }
}