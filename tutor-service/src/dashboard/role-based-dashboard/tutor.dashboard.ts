import {
    Injectable,
} from '@nestjs/common';
import { ClassStatus, ExamType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttentionIssue, ExamFilterType, FilterDTO, TimeRange } from '../dto/filter.dto';

@Injectable()
export class TutorDashboard {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async getNumStudentsOfTutor(tutor_id: string){
        return this.prisma.student.count({
            where: {
                learning: {
                    some: { class: {tutor: { uid: tutor_id }} }
                }
            }
        })
    }

    async getNumClasses(tutor_id: string){
        return this.prisma.class.count({
            where: {tutor: {uid: tutor_id}}
        })
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

            return upcomingSchedules || []
        } catch (error) {
            return []
        }
    }

    async getWeeklyClassESProgress(tutor_id: string, day_range: number = 1) {
        try {
            const currentDate = new Date()
            const _ndaysAgo = new Date()
            _ndaysAgo.setDate(currentDate.getDate() - day_range)
            currentDate.setHours(23, 59, 59, 999)
            _ndaysAgo.setHours(0, 0, 0, 0)

            const cntClassStudent: {
                class_id: string,
                classname: string
                total_students: number
            }[] = await this.prisma.$queryRaw`
                SELECT 
                    c.class_id, 
                    c.classname
                    COUNT(DISTINCT s.uid) as total_students
                FROM public."Student" as s
                JOIN public."Learning" as l on s."uid" = l."student_uid"
                JOIN public."Class" as c on c."class_id" = l."class_id"
                WHERE c."tutor_uid" = ${tutor_id}
                GROUP BY c.class_id, c.classname
            `

            const cntESDone: {
                class_id: string,
                exam_id: string,
                session_id: number,
                total_students_done: number
            }[] = await this.prisma.$queryRaw`
                SELECT 
                    c.class_id, 
                    es."exam_id", es."session_id",
                    COUNT(DISTINCT s.uid) as total_students_done
                FROM public."Student" as s
                JOIN public."Exam_taken" as et on et."student_uid" = s."uid"
                JOIN public."Exam_session" as es on et."session_id" = es."session_id" and et."exam_id" = es."exam_id"
                JOIN public."Exam_open_in" as eoi on eoi."session_id" = es."session_id" and eoi."exam_id" = es."exam_id"
                JOIN public."Class" as c on eoi."class_id" = c."class_id"
                WHERE c."tutor_uid" = ${tutor_id}
                GROUP BY c.class_id, es."exam_id", es."session_id"
            `

            const cntMapper = cntESDone.map(item => ({
                class_id: item.class_id,
                classname: cntClassStudent.find(i => i.class_id == item.class_id).classname,
                exam_id: item.exam_id,
                session_id: item.session_id,
                num_students_done: item.total_students_done,
                total_class_students: cntClassStudent.find(i => i.class_id == item.class_id).total_students
            }))

            return cntMapper
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
                JOIN public."Structure" AS st ON c."category_id" = st."cate_id"
                JOIN public."Lesson_Plan" AS lp ON st."plan_id" = lp."plan_id"
                -- Joining the questions and results into the main flow
                JOIN public."Questions" AS q ON c."category_id" = q."category_id"
                JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
                WHERE lp."tutor_id" = ${tutor_id}
                GROUP BY c."category_id", c."category_name";
            `

            return noticeCategories || []
        } catch (error) {
            return []
        }
    }

    async attentionRequiredStudents(tutor_id: string, query: Partial<FilterDTO>) {
        const page: number = Number(query?.page ?? 1)
        const limit: number = Number(query?.limit ?? 10)

        const grade_threshold: number = Number(query?.grade_threshold ?? 1.0)
        const test_miss_threshold: number = Number(query?.test_miss_threshold ?? 1)

        const examType: ExamFilterType = query?.exam_type ?? ExamFilterType.practice

        const examTypeCondition = examType == ExamFilterType.all ? null : (
            examType == ExamFilterType.practice ?
            {some: {exam_session: {exam_type: ExamType.practice}}} : (
                examType == ExamFilterType.test ? 
                {some: {exam_session: {exam_type: ExamType.test}}} :
                {none: {}}
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

            const raw_score_report = await this.prisma.student.findMany({
                where: {
                    learning: {
                        some: {
                            class: {tutor_uid: tutor_id}
                        }
                    },
                    ...(examTypeCondition === null ? {
                        exam_taken: {
                            some: {
                                isDone: true,
                                doneAt: {gte: past, lte: now}
                            }
                        }
                    } : {
                        exam_taken: {
                            some: {
                                isDone: true,
                                doneAt: {gte: past, lte: now}
                            },
                            ...examTypeCondition
                        }
                    })
                },
                select: {
                    user: {select: {uid: true, fname: true, mname: true, lname: true}},
                    exam_taken: {
                        select: {
                            exam_id: true,
                            session_id: true,
                            final_score: true,
                            doneAt: true,
                            exam_session: {
                                select: {
                                    exam_open_in: {
                                        select: {
                                            class: {
                                                select: {
                                                    class_id: true,
                                                    classname: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                take: limit,
                skip: (page - 1) * limit,
            })

            const processed_report = raw_score_report.map(student => {
                
                // ==========================================
                // STEP 1: Filter to highest final_score per {exam_id, session_id}
                // ==========================================
                const bestExamsMap = new Map();
                const standaloneExams = []; // For records where both are null

                student.exam_taken.forEach(exam => {
                    if (exam.exam_id == null && exam.session_id == null) {
                        // Always keep if both are null
                        standaloneExams.push(exam);
                    } else {
                        // Create a composite key
                        const key = `${exam.exam_id}_${exam.session_id}`;
                        const existing = bestExamsMap.get(key);
                        
                        if (!existing || exam.final_score > existing.final_score) {
                            bestExamsMap.set(key, exam);
                        }
                    }
                });

                const filteredExams = [...bestExamsMap.values(), ...standaloneExams];

                // ==========================================
                // STEP 2: Group by Time
                // ==========================================
                const timeGroups = new Map(); // Tracks { totalScore, count, exams } per group

                filteredExams.forEach(exam => {
                    const date = new Date(exam.doneAt);
                    let timeKey = '';

                    if (time_range === TimeRange.year) {
                        // Group by year (e.g., "2026")
                        timeKey = `${date.getFullYear()}`;
                    } 
                    else if (time_range === TimeRange.month) {
                        // Group by month (e.g., "2026-03")
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        timeKey = `${date.getFullYear()}-${month}`;
                    } 
                    else {
                        // Group by every 7 days since the 'past' threshold
                        const msDiff = date.getTime() - past.getTime();
                        const weekNumber = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000));
                        timeKey = `Week ${weekNumber + 1}`; 
                    }

                    // Initialize group if it doesn't exist
                    if (!timeGroups.has(timeKey)) {
                        timeGroups.set(timeKey, { totalScore: 0, count: 0, exams: [] });
                    }

                    // Add to group
                    const group = timeGroups.get(timeKey);
                    group.totalScore += Number(exam.final_score);
                    group.count += 1;
                    group.exams.push(exam);
                });

                // ==========================================
                // STEP 3: Calculate Average & Apply Threshold
                // ==========================================
                const finalGroupedExams = {};

                timeGroups.forEach((group, key) => {
                    const average = group.totalScore / group.count;
                    
                    // Only keep the group if the average is >= grade_threshold
                    finalGroupedExams[key] = {
                        average_score: average,
                        exams: group.exams // Keep the actual exam records in the result
                    };
                });

                // Return the modified student object
                return {
                    user: student.user,
                    grouped_exams: Object.entries(finalGroupedExams).map(([_, value]) => (value as { average_score: number, exams: any[] }).average_score)
                };
            });

            exam_score_report = processed_report.map(student => ({
                info: student.user,
                decrement: student.grouped_exams.length > 1 ? Number((student.grouped_exams[student.grouped_exams.length - 2] - student.grouped_exams[student.grouped_exams.length - 1]).toFixed(2)) : 0,
                average_scores: student.grouped_exams
            })).filter(student => student.decrement <= -grade_threshold)
        }

        if (issue == AttentionIssue.all || issue == AttentionIssue.test_miss) {
            switch(time_range) {
                case TimeRange.month: {
                    past.setMonth(now.getMonth() - 1);
                    break;
                }
                case TimeRange.year: {
                    past.setFullYear(now.getFullYear() - 1);
                    break;
                }
                default: {
                    past.setDate(now.getDate() - 7)
                    break;
                }
            }
            const raw_miss_report = await this.prisma.student.findMany({
                where: {
                    learning: {
                        some: {
                            class: {tutor_uid: tutor_id}
                        }
                    },
                    exam_taken: {
                        some: {
                            exam_session: {
                                startAt: {gte: past, lte: now}
                            }
                        }
                    }
                },
                select: {
                    user: {
                        select: {
                            uid: true,
                            fname: true,
                            mname: true,
                            lname: true
                        }
                    },
                    learning: {
                        select: {
                            class: {
                                select: {
                                    class_id: true,
                                    classname: true,
                                    _count: {
                                        select: {
                                            exam_open_in: {
                                                where: {
                                                    exam_session: {
                                                        startAt: {gte: past, lte: now},
                                                        expireAt: {lte: now},
                                                        examTakens: {none: {}}
                                                    }
                                                }
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                take: limit,
                skip: (page - 1) * limit
            }).then(res => res.map(item => ({
                info: item.user,
                num_test_missed: item.learning.map(klass => ({
                    class_id: klass.class.class_id,
                    classname: klass.class.classname,
                    num_missed: klass.class._count.exam_open_in
                })).filter(item => item.num_missed >= test_miss_threshold)
            })).filter(item => item.num_test_missed.length > 0))

            exam_miss_report = raw_miss_report
        }

        return {
            exam_score_report,
            exam_miss_report
        }
    }
}