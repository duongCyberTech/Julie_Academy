import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto, QuestionDto, AnswerDto } from './dto/question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: CategoryDto[]) {
    return this.prisma.$transaction(async (tx) => {
        const createdCategories = [];
        for (const category of data) {
            const newCategory = await tx.categories.create({
                data: {
                    category_name: category.category_name,
                    description: category.description,
                    createdAt: new Date(),
                    updateAt: new Date(),
                    grades: category.grades,
                    subject: category.subject,
                },
            });
            createdCategories.push(newCategory);
        }
        return createdCategories;
    })
  }

  async createQuestion(data: QuestionDto[], tutor_uid: string) {
    return this.prisma.$transaction(async (tx) => {
        const createdQuestions = [];
        for (const question of data) {
            const newQuestion = await tx.questions.create({
                data: {
                    content: question.content,
                    explaination: question.explaination,
                    type: question.type,
                    level: question.level,
                    status: question.status,
                    createAt: new Date(),
                    updateAt: new Date(),
                    category: { connect: { category_id: question.category_id } },
                    tutor: { connect: { uid: tutor_uid } },
                },
            });
            let aid = 1;
            for (const answer of (question as any).answers) {
                await tx.answers.create({
                    data: {
                        aid: aid++,
                        content: (answer as AnswerDto).content,
                        is_correct: (answer as AnswerDto).is_correct,
                        question: { connect: { ques_id: newQuestion.ques_id } },
                    },
                });
            }
            createdQuestions.push(newQuestion);
        }
        return createdQuestions;
    })
  }

  async getAllCategories(page?: number, limit?: number, search?: string, grade? : number, subject?: string) {
    const skip:number = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { category_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (grade) {
      where.grades = grade;
    }
    if (subject) {
      where.subject = subject;
    }
    return this.prisma.categories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select:{
            category_id: true,
            category_name: true,
            description: true,
            grades: true,
            subject: true,
        },  
    });
  }

  async getQuestionsByCategory(category_id: string, page?: number, limit?: number, search?: string, level?: string, type?: string, status?: string) {
    const skip:number = (page - 1) * limit;
    const where: any = { category_id: category_id };
    if (level) where.level = level;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.questions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createAt: 'desc' },
        select:{
            ques_id: true,
            content: true,
            explaination: true,
            type: true,
            level: true,
            status: true,
        },  
    });
  }

  async getAllQuestion(
    page?: number, limit?: number, search?: string, 
    level?: string, type?: string, status?: string
  ) {
    const skip:number = (page - 1) * limit;
    const where: any = {};
    if (level) where.level = level;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.questions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createAt: 'desc' },
        select:{
            ques_id: true,
            content: true,
            explaination: true,
            type: true,
            level: true,
            status: true,
            category: { 
                select: { 
                    category_id: true, category_name: true, 
                    subject: true, grades: true 
                } 
            },
        },  
    });
  }

  async getMyQuestions(
    tutor_uid: string, page?: number, limit?: number, search?: string, 
    level?: string, type?: string, status?: string
  ) {
    const skip:number = (page - 1) * limit;
    const where: any = { tutor_uid };
    if (level) where.level = level;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
        where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
        ];
    }
    return this.prisma.questions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createAt: 'desc' },
        select:{
            ques_id: true,
            content: true,
            explaination: true,
            type: true,
            level: true,
            status: true,
            category: { 
                select: { 
                    category_id: true, category_name: true, 
                    subject: true, grades: true 
                } 
            },
        },  
    });
  }

  async getQuestionById(ques_id: string) {
    return this.prisma.questions.findUnique({
        where: { ques_id },
        select:{
            ques_id: true,
            content: true,
            explaination: true,
            type: true,
            level: true,
            status: true,
            category: { select: { category_id: true, category_name: true, subject: true, grades: true } },
            answers: { select: { aid: true, content: true, is_correct: true } },
        },  
    });
  }

  async updateQuestion(ques_id: string, data: Partial<QuestionDto>) {
    const { category_id, ...restData } = data;
    return this.prisma.questions.update({
        where: { ques_id },
        data: {
            ...restData,
            updateAt: new Date(),
            ...(category_id ? { category: { connect: { category_id } } } : {}),
        },
    });
  }

  async updateAnswer(aid: number, ques_id: string, answer: Partial<AnswerDto>) {
    return this.prisma.answers.update({
        where: { ques_id_aid: { ques_id, aid } },
        data: {
           ...answer,
        },
    });
  }

  async deleteAnswer(aid: number, ques_id: string) {
    return this.prisma.answers.delete({
        where: { ques_id_aid: { ques_id, aid } },
    });
  }
}