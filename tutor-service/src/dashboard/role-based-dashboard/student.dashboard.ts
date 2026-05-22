import {
    Injectable,
} from '@nestjs/common';
import { ExamType, PlanType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExamFilterType, FilterDTO, HistorySort, PartialFilterDTO, TimeRange } from 'src/dashboard/dto/filter.dto';
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

    async testStreak(student_id: string) {
        return await this.prisma.student_analytics.findFirst({
            where:{ student_id },
            select: { streak: true }
        }).then(res => res?.streak)
    }

    async currentActivities(student_id: string, filter: PartialFilterDTO) {
        const limit: number = Number(filter.limit ?? 10)
        const page: number = Number(filter.page ?? 1)
        const take: number = limit
        const skip: number = (page - 1) * limit

        // Map enum sort → orderBy của Prisma.
        // Mặc định newest = doneAt desc (giữ y nguyên hành vi cũ).
        const sort: HistorySort = (filter.sort as HistorySort) ?? HistorySort.newest;
        const orderBy = sort === HistorySort.oldest
            ? [{ doneAt: 'asc' as const }, { startAt: 'asc' as const }]
            : sort === HistorySort.highest
                ? [{ final_score: 'desc' as const }, { doneAt: 'desc' as const }]
                : sort === HistorySort.lowest
                    ? [{ final_score: 'asc' as const }, { doneAt: 'desc' as const }]
                    : [{ doneAt: 'desc' as const }, { startAt: 'desc' as const }];

        // where dùng chung cho findMany và count
        const where = {
            student_uid: student_id,
            isDone: true,
            // Lọc theo loại bài thi
            ...(filter.exam_type && filter.exam_type !== 'all' ?
                (filter.exam_type === 'adaptive' ?
                { exam_id: null, session_id: null } :
                { exam_session: { exam_type: filter.exam_type as any } }) : {}),

            ...(filter.startAt ? {startAt: {gte: filter.startAt}} : {}),
            ...(filter.endAt ? {doneAt: {lte: filter.endAt}} : {})
        };

        // Chạy song song findMany + count để giảm latency
        const [rows, total] = await Promise.all([
            this.prisma.exam_taken.findMany({
                where,
                select: {
                    exam_session: {
                        select: {
                            exam_type: true,
                            exam: { select: { title: true } },
                            exam_open_in: {
                                select: { class: { select: { subject: true } } }
                            }
                        }
                    },
                    final_score: true,
                    doneAt: true,
                    category: { select: { category_name: true } }
                },
                orderBy,
                take,
                skip
            }),
            this.prisma.exam_taken.count({ where })
        ]);

        const items = rows.map(ex => {
            const isAdaptive = !ex.exam_session;
            // Bài Adaptive không gắn class nên không có môn học cụ thể.
            // Hiện tại hệ thống chỉ có Toán → trả về "Toán" cho rõ ràng,
            // tránh fallback "Môn học" (placeholder) hoặc undefined ở UI.
            const subject = isAdaptive
                ? 'Toán'
                : (ex.exam_session?.exam_open_in?.[0]?.class?.subject ?? 'Toán');

            return {
                title: ex?.exam_session?.exam?.title,
                subject,
                exam_type: ex?.exam_session?.exam_type ?? 'adaptive',
                score: ex.final_score,
                doneAt: ex.doneAt,
                category: ex?.category?.category_name,
            };
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit))
        };
    }

    async scoreTrend(student_id: string, filter: PartialFilterDTO) {
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
        const nullRecords: any[] = [];

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
        // Mục tiêu UX: radar LUÔN hiển thị đủ các chương trong lộ trình kể cả khi
        // học sinh chưa làm câu nào (chương đó hiện 0%). Vì vậy ta tách 2 query:
        //
        //   (A) Lấy danh sách CHƯƠNG trong plan — đây là khung trục của radar,
        //       không phụ thuộc học sinh đã làm gì.
        //   (B) Lấy dữ liệu correct/fail từ các bài Adaptive (exam_id NULL & session_id NULL),
        //       gom theo (chương, subtopic) — như cũ.
        //
        // Sau đó merge ở TypeScript: chương có dữ liệu → trung bình % các subtopic ĐÃ LÀM;
        // chương không có dữ liệu → percent = 0, counted_subtopics = 0.
        //
        // Lưu ý: plan có thể gán Category ở cấp con thay vì root → ta dùng getRoot()
        // để quy mọi chương về root cuối cùng.

        // (A) Danh sách chương trong plan
        const planCategories: {
            category_id: string,
            category_name: string,
        }[] = await this.prisma.$queryRaw`
            SELECT
                c."category_id",
                c."category_name"
            FROM public."Categories"  AS c
            JOIN public."Structure"   AS st ON c."category_id" = st."cate_id"
            JOIN public."Lesson_Plan" AS lp ON st."plan_id"    = lp."plan_id"
            WHERE lp."plan_id" = ${plan_id}
              AND lp."type"    = 'book';
        `;

        if (planCategories.length === 0) return [];

        // Quy mọi category gán vào plan về root (chương gốc).
        const rootChapters = await Promise.all(
            planCategories.map(async (c) => {
                const root = await this.category.getRoot(c.category_id);
                return { root_id: root.category_id, root_name: root.category_name };
            }),
        );

        // Khử trùng lặp theo root_id (nếu plan gán nhiều cấp con cùng leo về 1 root).
        const chaptersMap = new Map<string, { category_id: string, category_name: string }>();
        for (const r of rootChapters) {
            if (!chaptersMap.has(r.root_id)) {
                chaptersMap.set(r.root_id, {
                    category_id: r.root_id,
                    category_name: r.root_name,
                });
            }
        }

        // (B) Dữ liệu correct/fail theo (chương, subtopic) — chỉ tính bài Adaptive.
        const dataRows: {
            chapter_id: string,
            subtopic_id: string,
            correct_cnt: number,
            fail_cnt: number,
        }[] = await this.prisma.$queryRaw`
            SELECT
                parent_c."category_id" AS chapter_id,
                -- Mỗi câu hỏi đóng góp vào 1 subtopic; câu hỏi gắn thẳng vào chương
                -- coi chính chương đó là subtopic đại diện duy nhất.
                COALESCE(child_c."category_id", parent_c."category_id") AS subtopic_id,
                COUNT(CASE WHEN qet."isCorrect" = true  THEN 1 END)::int AS correct_cnt,
                COUNT(CASE WHEN qet."isCorrect" = false THEN 1 END)::int AS fail_cnt
            FROM public."Categories"               AS parent_c
            JOIN public."Structure"                AS st  ON parent_c."category_id" = st."cate_id"
            JOIN public."Lesson_Plan"              AS lp  ON st."plan_id" = lp."plan_id"
                AND lp."plan_id" = ${plan_id}
                AND lp."type" = 'book'
            JOIN public."Categories"               AS child_c
                ON COALESCE(child_c."parent_id", child_c."category_id") = parent_c."category_id"
            JOIN public."Questions"                AS q   ON q."category_id" = child_c."category_id"
            JOIN public."Question_for_exam_taken"  AS qet ON qet."ques_id" = q."ques_id"
            JOIN public."Exam_taken"               AS et  ON et."et_id"    = qet."et_id"
            WHERE et."student_uid" = ${student_id}
              AND et."exam_id"    IS NULL
              AND et."session_id" IS NULL
            GROUP BY parent_c."category_id",
                     COALESCE(child_c."category_id", parent_c."category_id");
        `;

        // Map dữ liệu (chapter from query B) về root tương ứng.
        const withRoot = await Promise.all(
            dataRows.map(async (r) => {
                const root = await this.category.getRoot(r.chapter_id);
                return {
                    root_id: root.category_id,
                    subtopic_id: r.subtopic_id,
                    correct_cnt: Number(r.correct_cnt),
                    fail_cnt: Number(r.fail_cnt),
                };
            }),
        );

        // Group theo (root, subtopic). Cộng dồn nếu nhiều chương cùng leo về 1 root.
        const subtopicAggMap = new Map<string, {
            root_id: string,
            subtopic_id: string,
            correct: number,
            fail: number,
        }>();

        for (const r of withRoot) {
            const key = `${r.root_id}__${r.subtopic_id}`;
            const cur = subtopicAggMap.get(key);
            if (cur) {
                cur.correct += r.correct_cnt;
                cur.fail += r.fail_cnt;
            } else {
                subtopicAggMap.set(key, {
                    root_id: r.root_id,
                    subtopic_id: r.subtopic_id,
                    correct: r.correct_cnt,
                    fail: r.fail_cnt,
                });
            }
        }

        // Với mỗi root: trung bình % các subtopic đã làm (subtopic 0 câu → bỏ).
        const chapterAccMap = new Map<string, {
            sumPercent: number,
            countedSubtopics: number,
        }>();

        for (const s of subtopicAggMap.values()) {
            const total = s.correct + s.fail;
            if (total === 0) continue; // subtopic chưa làm → bỏ qua

            const subtopicPercent = (s.correct / total) * 100;
            const cur = chapterAccMap.get(s.root_id);
            if (cur) {
                cur.sumPercent += subtopicPercent;
                cur.countedSubtopics += 1;
            } else {
                chapterAccMap.set(s.root_id, {
                    sumPercent: subtopicPercent,
                    countedSubtopics: 1,
                });
            }
        }

        // Merge: trả về MỘT entry cho mỗi chương trong plan (kể cả chương 0%).
        return Array.from(chaptersMap.values()).map((c) => {
            const acc = chapterAccMap.get(c.category_id);
            const percent = acc && acc.countedSubtopics > 0
                ? Math.round((acc.sumPercent / acc.countedSubtopics) * 10) / 10
                : 0;
            return {
                category_id: c.category_id,
                category_name: c.category_name,
                percent,
                counted_subtopics: acc?.countedSubtopics ?? 0,
            };
        });
    }

    // Lấy chi tiết các chủ đề khi click vào 1 chương.
    // Yêu cầu UX: luôn liệt kê đủ các chủ đề con của chương kể cả khi học sinh
    // chưa làm câu nào ở chủ đề đó (chủ đề đó hiện 0%, đúng 0 / sai 0).
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
                COALESCE(SUM(CASE WHEN qet."isCorrect" = true  THEN 1 ELSE 0 END), 0)::int AS correct_cnt,
                COALESCE(SUM(CASE WHEN qet."isCorrect" = false THEN 1 ELSE 0 END), 0)::int AS fail_cnt
            FROM public."Categories" AS c
            -- Đảm bảo chương cha của chủ đề này có trong plan ('book')
            JOIN public."Structure"   AS st ON st."cate_id" = c."parent_id"
            JOIN public."Lesson_Plan" AS lp ON lp."plan_id" = st."plan_id"
                AND lp."plan_id" = ${plan_id}
                AND lp."type"    = 'book'
            -- LEFT JOIN để chủ đề chưa có câu / chưa làm vẫn hiện ra (0/0)
            LEFT JOIN public."Questions" AS q ON q."category_id" = c."category_id"
            LEFT JOIN public."Question_for_exam_taken" AS qet ON qet."ques_id" = q."ques_id"
            LEFT JOIN public."Exam_taken" AS et ON et."et_id" = qet."et_id"
                AND et."student_uid" = ${student_id}
                AND et."exam_id"     IS NULL
                AND et."session_id"  IS NULL
            WHERE c."parent_id" = ${chapter_id}
                AND et."student_uid" = ${student_id}
            GROUP BY c."category_id", c."category_name"
            ORDER BY c."category_name";
        `;

        return detailCategories.map(item => ({
            category_id: item.category_id,
            category_name: item.category_name,
            correct_cnt: Number(item.correct_cnt),
            fail_cnt: Number(item.fail_cnt),
        }));
    }

    async upcomingTodaySchedule(student_id: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await this.prisma.schedule.findMany({
            where: {
                class: {
                    learning: {
                        some: {
                            student_uid: student_id,
                            status: "accepted"
                        }
                    },
                    status: "ongoing",
                },
                meeting_date: today.getDay() === 0 ? 8 : today.getDay() + 1
            },
            select: {
                startAt: true,
                endAt: true,
                link_meet: true,
                class: {
                    select: {
                        subject: true,
                        class_id: true,
                        classname: true
                    }
                }
            },
            orderBy: [{ startAt: "desc" }, { endAt: "desc" }]
        })
    }
}