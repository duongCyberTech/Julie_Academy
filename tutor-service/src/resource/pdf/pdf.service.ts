import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit-table';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileType } from '../dto/pdf.dto';
import { join } from 'path';

@Injectable()
export class PdfService {
  constructor(
    private readonly prisma: PrismaService
  ) {}



  async generateFileContent(ftype: FileType, student_id: string, config_id: string): Promise<string> {
    switch (ftype) {
      case FileType.STUDY_REPORT: {
        // 1. Fetch dữ liệu (Giữ nguyên logic truy vấn của bạn)
        const config = await this.prisma.emailConfig.findUnique({
          where: { config_id },
          select: {
            period: true,
            class: { select: { classname: true } }
          }
        });

        const student = await this.prisma.student.findUnique({
          where: { uid: student_id },
          select: {
            user: { select: { fname: true, lname: true, mname: true } }
          }
        });

        const now = new Date();
        const previous_date = config?.period === 'weekly' 
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) 
          : (config?.period === 'monthly' ? new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) : null);

        const data = await this.prisma.exam_taken.findMany({
          where: {
            student_uid: student_id,
            isDone: true,
            exam_session: {
              exam_open_in: {
                some: { class: { emailConfig: { some: { config_id } } } }
              }
            },
            ...(previous_date ? { doneAt: { gt: previous_date, lte: now } } : {})
          },
          select: {
            final_score: true,
            total_ques_completed: true,
            startAt: true,
            doneAt: true,
            exam_session: {
              select: {
                exam: { select: { title: true, total_score: true, total_ques: true } }
              }
            }
          }
        });

        if (data.length === 0) return "";

        // 2. Khởi tạo PDF Document
        const doc: any = new PDFDocument();
        const fontPath = join(process.cwd(), 'src/resource/pdf/font/SFUTimesTenRoman.TTF');

        doc.registerFont('VietnameseFont', fontPath);
        doc.font('VietnameseFont');
        const chunks: Buffer[] = [];

        // Thu thập dữ liệu stream
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));

        // 3. Thiết kế nội dung PDF
        // Tiêu đề
        const periodText = config?.period === "weekly" ? "tuần" : config?.period === 'monthly' ? "tháng" : "";
        doc.fontSize(20).text(`Báo cáo kết quả học tập ${periodText}`, { align: 'center' });
        doc.moveDown();

        // Thông tin chung
        doc.fontSize(12)
          .text(`Ngày tạo: ${now.toLocaleDateString('vi-VN')}`)
          .text(`Lớp: ${config?.class?.classname}`)
          .text(`Học sinh: ${student?.user?.fname} ${student?.user?.mname ? student.user.mname + ' ' : ''}${student?.user?.lname}`)
          .moveDown(2);

        // Cấu hình bảng
        const tableRows = data.map((item, index) => {
          const exam = item?.exam_session?.exam;
          const scorePercentage = ((Number(item?.final_score || 0) / Number(exam?.total_score || 1)) * 100).toFixed(2);
          const diffMs = item.doneAt.getTime() - item.startAt.getTime();
          const totalSeconds = Math.floor(diffMs / 1000);
          const duration = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

          return [
            index + 1,
            exam.title,
            `${item.final_score}/${exam.total_score} (${scorePercentage}%)`,
            `${item.total_ques_completed}/${exam.total_ques}`,
            duration,
            item.doneAt.toLocaleDateString('vi-VN')
          ];
        });

        const table = {
          title: "Chi tiết bài thi",
          headers: ["STT", "Tên bài thi", "Điểm số", "Số câu", "Thời gian", "Ngày nộp"],
          rows: tableRows,
        };

        // Vẽ bảng vào PDF
        await doc.table(table, { 
          prepareHeader: () => doc.font("VietnameseFont").fontSize(10),
          prepareRow: () => doc.font("VietnameseFont").fontSize(10),
        });

        // Kết thúc ghi file
        doc.end();

        // 4. Chuyển đổi Buffer thành Base64 để gửi qua Mail
        return new Promise((resolve) => {
          doc.on('end', () => {
            const result = Buffer.concat(chunks);
            resolve(result.toString('base64'));
          });
        });
      }
      default:
        return "";
    }
  }
}
