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

            return upcomingSchedules
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
                LEFT JOIN public."Structure" AS st ON c."category_id" = st."cate_id"
                LEFT JOIN public."Lesson_Plan" AS lp ON st."plan_id" = lp."plan_id"
                LEFT JOIN public."Questions" AS q ON c."category_id" = q."category_id"
                LEFT JOIN public."Question_for_exam_taken" AS qet ON q."ques_id" = qet."ques_id"
                LEFT JOIN public."Exam_taken" AS et ON qet."et_id" = et."et_id"
                LEFT JOIN public."Exam_open_in" AS eoi ON et."exam_id" = eoi."exam_id" AND et."session_id" = eoi."session_id"
                LEFT JOIN public."Class" AS cl ON eoi."class_id" = cl."class_id"
                WHERE cl."tutor_uid" = ${tutor_id}
                GROUP BY c."category_id", c."category_name"
                HAVING COUNT(CASE WHEN qet."isCorrect" = true THEN 1 END) > 0 
                    OR COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END) > 0;
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

            // 1. Prisma Query: Thêm orderBy để đảm bảo lấy ra đúng thứ tự thời gian
            const raw_score_report = await this.prisma.student.findMany({
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
                                        where: {
                                            exam_session: {
                                                startAt: { gte: past },
                                            }
                                        },
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
                            exam_session: {
                                startAt: { gte: past },
                                ...(examTypeCondition?.exam_session || {})
                            },
                            isDone: true,
                            doneAt: { lte: now },
                        },
                        orderBy: { doneAt: 'asc' },
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
            }).then(res => res.map(student => ({
                info: student.user,
                learning: student.learning.map(l => ({
                    class_id: l.class.class_id,
                    classname: l.class.classname,
                    student_exams: l.class.exam_open_in.filter(eoi => student.exam_taken.some(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)).map(eoi => ({
                        exam_id: eoi.exam_id,
                        session_id: eoi.session_id,
                        final_score: student.exam_taken
                                    .filter(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)
                                    .sort((a, b) => Number(b.final_score) - Number(a.final_score))[0]?.final_score ?? null,
                        doneAt: student.exam_taken
                                    .filter(et => et.exam_id == eoi.exam_id && et.session_id == eoi.session_id)
                                    .sort((a, b) => Number(b.final_score) - Number(a.final_score))[0]?.doneAt ?? null,
                    }))
                }))
            })));

            exam_score_report = raw_score_report.map(student => {
                
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

                // FIX: Vòng lặp phải đi vào từng lớp, sau đó mới duyệt qua các bài thi của lớp đó
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
                const classesMap = new Map();

                for (const exam of filteredExams) {
                    const key = `${exam.exam_id}_${exam.session_id}`;
                    const classInfo = sessionToClassMap.get(key);

                    // Bỏ qua nếu bài thi không map được với lớp nào do tutor dạy (đề phòng dữ liệu cũ/rác)
                    if (!classInfo) continue;

                    const classId = classInfo.class_id;
                    const className = classInfo.classname;

                    // Khởi tạo Lớp nếu chưa có
                    if (!classesMap.has(classId)) {
                        classesMap.set(classId, { classname: className, timeGroups: new Map() });
                    }
                    const currentClass = classesMap.get(classId);

                    // Xác định mốc thời gian (timeKey)
                    const date = new Date(exam.doneAt);
                    let timeKey = '';
                    if (time_range === TimeRange.year) {
                        timeKey = `${date.getFullYear()}`;
                    } else if (time_range === TimeRange.month) {
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        timeKey = `${date.getFullYear()}-${month}`;
                    } else {
                        const msDiff = date.getTime() - past.getTime();
                        const weekNumber = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000));
                        timeKey = `Week ${weekNumber + 1}`; 
                    }

                    // Khởi tạo nhóm thời gian trong Lớp nếu chưa có
                    if (!currentClass.timeGroups.has(timeKey)) {
                        currentClass.timeGroups.set(timeKey, { totalScore: 0, count: 0 });
                    }

                    // Cộng dồn điểm
                    const tGroup = currentClass.timeGroups.get(timeKey);
                    tGroup.totalScore += Number(exam.final_score);
                    tGroup.count += 1;
                }

                // ==========================================
                // STEP 3 & 4: Tính trung bình & So sánh ngưỡng (Threshold)
                // ==========================================
                const flaggedClasses = []; 

                for (const [classId, classData] of classesMap.entries()) {
                    const periods = [];
                    
                    for (const [period, group] of classData.timeGroups.entries()) {
                        periods.push({
                            period,
                            avg_score: Number((group.totalScore / group.count).toFixed(2))
                        });
                    }

                    let score_diff = 0;
                    const len = periods.length;

                    // Chỉ kiểm tra rớt điểm nếu có ít nhất 2 mốc thời gian để so sánh
                    if (len > 1) {
                        const latestAvg = periods[len - 1]?.avg_score ?? 0;
                        const previousAvg = periods[len - 2]?.avg_score ?? 0;
                        score_diff = Number((latestAvg - previousAvg).toFixed(2));

                        // CHÚ Ý: Tại đây bạn có thể bọc logic bên trong if (score_diff <= -grade_threshold) 
                        // để chỉ lấy những lớp tụt điểm vượt ngưỡng cho phép.
                        flaggedClasses.push({
                            class_id: classId,
                            classname: classData.classname,
                            score_diff: score_diff,
                            history: periods 
                        });
                    }
                    else {
                        // Nếu chỉ có 1 mốc thời gian, vẫn có thể đưa vào báo cáo nhưng không tính score_diff
                        flaggedClasses.push({
                            class_id: classId,
                            classname: classData.classname,
                            score_diff: null, // Không đủ dữ liệu để tính rớt điểm
                            history: periods 
                        });
                    }
                }

                return {
                    info: student.info, // FIX: Đổi từ student.user thành student.info
                    flagged_classes: flaggedClasses 
                };
            });
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