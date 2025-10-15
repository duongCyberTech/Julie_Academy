import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma } from '@prisma/client';
import { QuestionEntity } from './entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(
    createQuestionDto: CreateQuestionDto,
    creatorId: string,
  ): Promise<QuestionEntity> {
    const { answers, categoryId, ...questionData } = createQuestionDto;
    return this.prisma.questions.create({
      data: {
        ...questionData,
        tutor: { connect: { uid: creatorId } },
        category: { connect: { category_id: categoryId } },
        answers: {
          create: answers.map((answer, index) => ({
            aid: index + 1,
            content: answer.content,
            is_correct: answer.isCorrect,
          })),
        },
      },
      include: {
        tutor: { include: { user: { select: { username: true } } } },
        answers: true,
        category: true,
      },
    });
  }

  async findAll(queryParams: {
    page?: string;
    limit?: string;
    level?: 'easy' | 'medium' | 'hard';
  }) {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionsWhereInput = queryParams.level
      ? { level: queryParams.level }
      : {};

    const [questions, total] = await this.prisma.$transaction([
      this.prisma.questions.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: { category_name: true, subject: true },
          },
        },
        orderBy: { createAt: 'desc' },
      }),
      this.prisma.questions.count({ where }),
    ]);

    return {
      data: questions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<QuestionEntity> {
    const question = await this.prisma.questions.findUnique({
      where: { ques_id: id },
      include: {
        answers: true,
        category: true,
        tutor: { include: { user: { select: { username: true } } } },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionEntity> {
    const { answers, categoryId, ...otherData } = updateQuestionDto;

    const existingQuestion = await this.prisma.questions.findUnique({
      where: { ques_id: id },
    });
    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.questions.update({
        where: { ques_id: id },
        data: {
          ...otherData,
          ...(categoryId && { category_id: categoryId }),
        },
      });

      if (answers) {
        await tx.answers.deleteMany({ where: { ques_id: id } });
        await tx.answers.createMany({
          data: answers.map((answer, index) => ({
            ques_id: id,
            aid: index + 1,
            content: answer.content,
            is_correct: answer.isCorrect,
          })),
        });
      }

      return tx.questions.findUnique({
        where: { ques_id: id },
        include: {
          answers: true,
          category: true,
          tutor: { include: { user: { select: { username: true } } } },
        },
      });
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.answers.deleteMany({ where: { ques_id: id } }),
        this.prisma.questions.delete({ where: { ques_id: id } }),
      ]);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Question with ID ${id} not found.`);
      }
      throw error;
    }
  }
}
