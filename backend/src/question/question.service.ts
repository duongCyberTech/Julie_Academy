import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ExceptionResponse } from 'src/exception/Exception.exception';
import { ControlMode } from 'src/mode/control.mode';
import { PrismaService } from '../prisma/prisma.service';
import { LessonPlanDto, CategoryDto } from './dto/question.dto';
import { CreateQuestionDto, CreateAnswerDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CategoriesOutputDto } from './dto/questionOutput.dto';
import {
  DifficultyLevel,
  QuestionStatus,
  QuestionType,
  Prisma,
  QuestionAccess,
} from '@prisma/client';
import { connect } from 'http2';

@Injectable()
export class LessonPlanService {
  constructor(private prisma: PrismaService) {}

  async createLessonPlan(data: LessonPlanDto[], tutor_id?: string) {
    const createdLessonPlan = [];
    for (const plan of data) {
      const existingLessonPlan = await this.prisma.lesson_Plan.findUnique({
        where: { title: plan.title, tutor_id: tutor_id },
      });
      if (existingLessonPlan) {
        console.warn(
          `Plan with title "${plan.title}" already exists in your storage. Skipping creation.`,
        );
        continue;
      }
      const newPlan = await this.prisma.lesson_Plan.create({
        data: {
          title: plan.title,
          subject: plan.subject,
          grade: plan.grade,
          description: plan.description,
          type: plan.type || 'custom',
          ...(tutor_id ? { tutor: { connect: { uid: tutor_id } } } : {}),
        },
      });
      createdLessonPlan.push(newPlan);
    }
    return createdLessonPlan;
  }

  async getAllPlans(tutor_id?: string) {
    if (tutor_id)
      return this.prisma.lesson_Plan.findMany({
        where: {
          OR: [{ tutor_id: tutor_id }, { type: 'book' }],
        },
        orderBy: { title: 'asc' },
      });
    return this.prisma.lesson_Plan.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async getPlanById(plan_id: string) {
    const plan = await this.prisma.lesson_Plan.findUnique({
      where: { plan_id },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${plan_id} not found`);
    }
    return plan;
  }

  async updatePlan(plan_id: string, data: Partial<LessonPlanDto>) {
    try {
      return await this.prisma.lesson_Plan.update({
        where: { plan_id },
        data,
      });
    } catch (error) {
      return new ExceptionResponse().returnError(error, `Plan ${plan_id}`);
    }
  }

  async deletePlan(plan_id: string, mode: ControlMode = ControlMode.SOFT) {
    try {
      if (mode == ControlMode.FORCE) {
        return this.prisma.$transaction(async (tx) => {
          const Cate_to_delete = await tx.categories.findMany({
            where: {
              AND: [
                { structure: { some: { plan_id } } },
                { structure: { none: { plan_id: { not: plan_id } } } },
              ],
            },
            select: { category_id: true },
          });

          const deleteCate = Cate_to_delete.map((i) => i.category_id);

          if (deleteCate.length)
            await tx.categories.deleteMany({
              where: { category_id: { in: deleteCate } },
            });

          return await tx.lesson_Plan.delete({ where: { plan_id } });
        });
      }
      return await this.prisma.lesson_Plan.delete({
        where: { plan_id },
      });
    } catch (error) {
      return new ExceptionResponse().returnError(error, `Plan ${plan_id}`);
    }
  }
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async upsertCategoryWithChildren(
    tx: Prisma.TransactionClient,
    categoryData: CategoryDto,
    parentId: string | null = null,
  ) {
    const existingCategory = await tx.categories.findUnique({
      where: {
        category_name: categoryData.category_name,
        structure: {
          some: {
            plan_id: categoryData.plan_id,
          },
        },
      },
    });

    const categoryDataForCreate = {
      category_name: categoryData.category_name,
      description: categoryData.description,
      ...(parentId
        ? { Categories: { connect: { category_id: parentId } } }
        : {}),
    };

    const category = existingCategory
      ? existingCategory
      : await tx.categories.create({
          data: categoryDataForCreate,
        });

    await tx.structure.create({
      data: {
        Plan: { connect: { plan_id: categoryData.plan_id } },
        Category: { connect: { category_id: category.category_id } },
      },
    });

    if (categoryData.children?.length) {
      for (const child of categoryData.children) {
        await this.upsertCategoryWithChildren(tx, child, category.category_id);
      }
    }
  }

  async createCategory(data: CategoryDto[]) {
    try {
      return this.prisma.$transaction(async (tx) => {
        for (const category of data) {
          await this.upsertCategoryWithChildren(tx, category);
        }
        return data;
      });
    } catch (error) {
      return new ExceptionResponse().returnError(error, `categories`);
    }
  }

  getRecursiveCategory(
    current: CategoriesOutputDto,
    all: CategoriesOutputDto[],
  ) {
    const result: CategoriesOutputDto = current;
    const filteredChildren = all.filter(
      (child) => child.parent_id === current.category_id,
    );
    for (const child of filteredChildren) {
      result.children.push(this.getRecursiveCategory(child, all));
    }
    return result;
  }

  flattenCategories(categories: CategoriesOutputDto[]): CategoriesOutputDto[] {
    const result: CategoriesOutputDto[] = [];
    for (const category of categories) {
      const { children, ...rest } = category;
      result.push({ ...rest, children: [] });
      if (children && children.length > 0) {
        result.push(...this.flattenCategories(children));
      }
    }
    return result;
  }

  async getAllCategories(
    mode: string = 'tree',
    plan_id?: string,
    page?: number | string,
    limit?: number | string,
    search?: string,
    grade?: number | string,
    subject?: string,
  ) {
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 200;
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const takeNum = limitNum > 0 ? limitNum : undefined;

    const where: Prisma.CategoriesWhereInput = {};
    if (plan_id) where.structure = { some: { plan_id: plan_id } };

    if (grade || subject) {
      where.structure.some.Plan = {};
      if (grade) {
        const gradeNum = parseInt(String(grade), 10);
        if (!isNaN(gradeNum)) where.structure.some.Plan.grade = gradeNum;
      }
      if (subject) {
        where.structure.some.Plan.subject = {
          contains: subject,
          mode: 'insensitive',
        };
      }
      if (Object.keys(where.structure.some.Plan).length === 0)
        delete where.structure.some.Plan;
    }

    if (search) {
      where.OR = [
        { category_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          structure: {
            some: {
              Plan: { title: { contains: search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const categories = await this.prisma.categories.findMany({
      where,
      skip: skipNum,
      take: takeNum,
      select: {
        category_id: true,
        category_name: true,
        description: true,
        parent_id: true,
        structure: {
          select: {
            Plan: {
              select: {
                title: true,
                subject: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: { category_name: 'asc' },
    });

    const categoriesOutput: CategoriesOutputDto[] = categories.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      description: cat.description,
      parent_id: cat.parent_id || null,
      plan_title: cat.structure?.[0]?.Plan?.title || null,
      grade: cat.structure?.[0]?.Plan?.grade || null,
      subject: cat.structure?.[0]?.Plan?.subject || null,
      children: [],
    }));

    var result: CategoriesOutputDto[] = [];
    for (const current of categoriesOutput.filter((cat) => !cat.parent_id)) {
      result.push(this.getRecursiveCategory(current, categoriesOutput));
    }
    if (mode == 'flat') {
      result = result.length > 0 ? this.flattenCategories(result) : [];
    }
    const total = await this.prisma.categories.count({ where });
    return { data: result, total };
  }

  async updateCategory(category_id: string, data: Partial<CategoryDto>) {
    try {
      return await this.prisma.categories.update({
        where: { category_id },
        data,
      });
    } catch (error) {
      return new ExceptionResponse().returnError(error, `categories`);
    }
  }

  async deleteWholeCategoryTree(
    tx: Prisma.TransactionClient,
    current_category_id: string,
  ) {
    const childCategories = await tx.categories.findMany({
      where: { parent_id: current_category_id },
      select: { category_id: true },
    });
    if (childCategories.length !== 0) {
      for (const child of childCategories) {
        await this.deleteWholeCategoryTree(tx, child.category_id);
      }
    }

    return await tx.categories.delete({
      where: { category_id: current_category_id },
    });
  }

  async deleteCategory(
    category_id: string,
    mode: ControlMode = ControlMode.SOFT,
  ) {
    try {
      if (mode == ControlMode.FORCE) {
        return this.prisma.$transaction(async (tx) => {
          return await this.deleteWholeCategoryTree(tx, category_id);
        });
      }
      return await this.prisma.categories.delete({
        where: { category_id },
      });
    } catch (error) {
      return new ExceptionResponse().returnError(error, `categories`);
    }
  }
}

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(data: CreateQuestionDto[], tutor_uid: string) {
    const tutorExists = await this.prisma.tutor.findUnique({
      where: { uid: tutor_uid },
    });
    if (!tutorExists) {
      throw new NotFoundException(`Tutor with ID ${tutor_uid} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const createdQuestions = [];
      for (const question of data) {
        const categoryExists = await tx.categories.findUnique({
          where: { category_id: question.categoryId },
        });
        if (!categoryExists) {
          throw new NotFoundException(
            `Category with ID ${question.categoryId} not found for question: "${question.content.substring(0, 20)}..."`,
          );
        }

        const statusEnumValue =
          question.status?.toUpperCase() === 'DRAFT'
            ? QuestionStatus.draft
            : QuestionStatus.ready;

        const accessEnumValue =
          question.accessMode?.toUpperCase() === 'PUBLIC'
            ? QuestionAccess.public
            : QuestionAccess.private;
        const newQuestion = await tx.questions.create({
          data: {
            title: question.title,
            content: question.content,
            explaination: question.explaination,
            type: question.type as QuestionType,
            level: question.level as DifficultyLevel,
            status: statusEnumValue,
            accessMode: accessEnumValue,
            category: { connect: { category_id: question.categoryId } },
            tutor: { connect: { uid: tutor_uid } },
          },
          select: { ques_id: true },
        });

        if (
          question.answers &&
          Array.isArray(question.answers) &&
          question.answers.length > 0
        ) {
          const answersToCreate = question.answers.map((answer, index) => ({
            aid: index + 1,
            content: answer.content,
            is_correct: answer.isCorrect,
            explaination: answer.explaination || null,
            ques_id: newQuestion.ques_id,
          }));
          await tx.answers.createMany({ data: answersToCreate });
        }
        createdQuestions.push({
          ques_id: newQuestion.ques_id,
          content: question.content,
        });
      }
      return createdQuestions;
    });
  }

  async getQuestionsByCategory(
    category_id: string,
    page?: number | string,
    limit?: number | string,
    search?: string,
    level?: string,
    type?: string,
  ) {
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const takeNum = limitNum > 0 ? limitNum : undefined;

    const where: Prisma.QuestionsWhereInput = {
      category_id: category_id,
      accessMode: QuestionAccess.public,
    };

    if (level) {
      const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel;
      if (DifficultyLevel[levelKey]) {
        where.level = DifficultyLevel[levelKey];
      }
    }
    if (type) {
      const typeKey = type.toUpperCase() as keyof typeof QuestionType;
      if (QuestionType[typeKey]) {
        where.type = QuestionType[typeKey];
      } else if (Object.values(QuestionType).includes(type as QuestionType)) {
        where.type = type as QuestionType;
      }
    }
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const questions = await this.prisma.questions.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: { createAt: 'desc' },
        select: {
          ques_id: true,
          content: true,
          type: true,
          level: true,
          status: true,
          createAt: true,
          category: {
            select: {
              category_id: true,
              category_name: true,
              structure: {
                select: {
                  Plan: {
                    select: {
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const total = await this.prisma.questions.count({ where });
      return { data: questions, total };
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      throw new Error('Could not fetch questions by category.');
    }
  }

  async getAllQuestion(
    page?: number | string,
    limit?: number | string,
    search?: string,
    level?: string,
    type?: string,
    status?: string,
    category_id?: string,
    plan_id?: string,
  ) {
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const takeNum = limitNum > 0 ? limitNum : undefined;

    const where: Prisma.QuestionsWhereInput = {};

    if (level) {
      const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel;
      if (DifficultyLevel[levelKey]) {
        where.level = DifficultyLevel[levelKey];
      } else {
        console.warn(`Invalid level filter: ${level}`);
      }
    }
    if (type) {
      const typeKey = type.toUpperCase() as keyof typeof QuestionType;
      if (QuestionType[typeKey]) {
        where.type = QuestionType[typeKey];
      } else if (Object.values(QuestionType).includes(type as QuestionType)) {
        where.type = type as QuestionType;
      } else {
        console.warn(`Invalid type filter: ${type}`);
      }
    }
    if (status) {
      const statusKey = status.toUpperCase() as keyof typeof QuestionStatus;
      if (QuestionStatus[statusKey]) {
        where.status = QuestionStatus[statusKey];
      } else if (
        Object.values(QuestionStatus).includes(status as QuestionStatus)
      ) {
        where.status = status as QuestionStatus;
      } else {
        console.warn(`Invalid status filter: ${status}`);
      }
    }

    let categoryFilter: Prisma.CategoriesWhereInput = {};
    if (category_id) {
      categoryFilter.category_id = category_id;
    }
    if (plan_id) {
      categoryFilter.structure.some.Plan = { plan_id };
    }
    if (Object.keys(categoryFilter).length > 0) {
      where.category = categoryFilter;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
        {
          tutor: {
            user: {
              OR: [
                { fname: { contains: search, mode: 'insensitive' } },
                { lname: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          category: {
            category_name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          category: {
            structure: {
              some: {
                Plan: { title: { contains: search, mode: 'insensitive' } },
              },
            },
          },
        },
      ];
    }

    try {
      const questions = await this.prisma.questions.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: { createAt: 'desc' },
        select: {
          ques_id: true,
          title: true,
          content: true,
          type: true,
          level: true,
          status: true,
          createAt: true,
          updateAt: true,
          category: {
            select: {
              category_id: true,
              category_name: true,
              structure: {
                select: {
                  Plan: {
                    select: {
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const total = await this.prisma.questions.count({ where });
      return { data: questions, total };
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw new Error('Could not fetch questions.');
    }
  }

  async getMyQuestions(
    tutor_uid: string,
    page?: number | string,
    limit?: number | string,
    search?: string,
    level?: string,
    type?: string,
    status?: string,
    category_id?: string,
    plan_id?: string,
  ) {
    const pageNum = page ? parseInt(String(page), 10) : 1;
    const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
    const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
    const takeNum = limitNum > 0 ? limitNum : undefined;

    const where: Prisma.QuestionsWhereInput = { tutor_id: tutor_uid };

    if (level) {
      const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel;
      if (DifficultyLevel[levelKey]) {
        where.level = DifficultyLevel[levelKey];
      } else {
        console.warn(`Invalid level filter: ${level}`);
      }
    }
    if (type) {
      const typeKey = type.toUpperCase() as keyof typeof QuestionType;
      if (QuestionType[typeKey]) {
        where.type = QuestionType[typeKey];
      } else if (Object.values(QuestionType).includes(type as QuestionType)) {
        where.type = type as QuestionType;
      } else {
        console.warn(`Invalid type filter: ${type}`);
      }
    }
    if (status) {
      const statusKey = status.toUpperCase() as keyof typeof QuestionStatus;
      if (QuestionStatus[statusKey]) {
        where.status = QuestionStatus[statusKey];
      } else if (
        Object.values(QuestionStatus).includes(status as QuestionStatus)
      ) {
        where.status = status as QuestionStatus;
      } else {
        console.warn(`Invalid status filter: ${status}`);
      }
    }

    let categoryFilter: Prisma.CategoriesWhereInput = {};
    if (category_id) {
      categoryFilter.category_id = category_id;
    }
    if (plan_id) {
      categoryFilter.structure.some.Plan = { plan_id };
    }
    if (Object.keys(categoryFilter).length > 0) {
      where.category = categoryFilter;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { explaination: { contains: search, mode: 'insensitive' } },
        {
          category: {
            category_name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          category: {
            structure: {
              some: {
                Plan: { title: { contains: search, mode: 'insensitive' } },
              },
            },
          },
        },
      ];
    }

    try {
      const questions = await this.prisma.questions.findMany({
        where,
        skip: skipNum,
        take: takeNum,
        orderBy: { createAt: 'desc' },
        select: {
          ques_id: true,
          content: true,
          title: true,
          type: true,
          level: true,
          status: true,
          createAt: true,
          updateAt: true,
          category: {
            select: {
              category_id: true,
              category_name: true,
              structure: {
                select: {
                  Plan: {
                    select: {
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const total = await this.prisma.questions.count({ where });
      return { data: questions, total };
    } catch (error) {
      console.error('Error fetching my questions:', error);
      throw new Error('Could not fetch your questions.');
    }
  }

  async getQuestionById(ques_id: string) {
    const question = await this.prisma.questions.findUnique({
      where: { ques_id },
      select: {
        ques_id: true,
        content: true,
        explaination: true,
        type: true,
        level: true,
        status: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
            structure: {
              select: {
                Plan: {
                  select: {
                    title: true,
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          select: {
            aid: true,
            content: true,
            is_correct: true,
            explaination: true,
          },
          orderBy: { aid: 'asc' },
        },
        tutor: {
          select: { user: { select: { uid: true, fname: true, lname: true } } },
        },
      },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${ques_id} not found`);
    }
    return question;
  }

  async updateQuestion(ques_id: string, data: UpdateQuestionDto) {
    const { answers, categoryId, ...restData } = data;
    const updateData: Prisma.QuestionsUpdateInput = { ...restData };

    if (restData.level) {
      const levelKey = String(
        restData.level,
      ).toUpperCase() as keyof typeof DifficultyLevel;
      if (DifficultyLevel[levelKey]) {
        updateData.level = DifficultyLevel[levelKey];
      } else {
        console.warn(`Invalid level value during update: ${restData.level}`);
        delete updateData.level;
      }
    }
    if (restData.type) {
      const typeKey = String(
        restData.type,
      ).toUpperCase() as keyof typeof QuestionType;
      if (QuestionType[typeKey]) {
        updateData.type = QuestionType[typeKey];
      } else if (
        Object.values(QuestionType).includes(restData.type as QuestionType)
      ) {
        updateData.type = restData.type as QuestionType;
      } else {
        console.warn(`Invalid type value during update: ${restData.type}`);
        delete updateData.type;
      }
    }
    if (restData.status) {
      const statusKey = String(
        restData.status,
      ).toUpperCase() as keyof typeof QuestionStatus;
      if (QuestionStatus[statusKey]) {
        updateData.status = QuestionStatus[statusKey];
      } else if (
        Object.values(QuestionStatus).includes(
          restData.status as QuestionStatus,
        )
      ) {
        updateData.status = restData.status as QuestionStatus;
      } else {
        console.warn(`Invalid status value during update: ${restData.status}`);
        delete updateData.status;
      }
    }

    if (categoryId) {
      const categoryExists = await this.prisma.categories.findUnique({
        where: { category_id: categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
      updateData.category = { connect: { category_id: categoryId } };
    }

    try {
      return await this.prisma.questions.update({
        where: { ques_id },
        data: updateData,
        select: {
          ques_id: true,
          content: true,
          status: true,
          level: true,
          type: true,
        },
      });
    } catch (error) {
      console.error(`Error updating question ${ques_id}:`, error);
      throw new Error('Could not update question.');
    }
  }

  async deleteQuestion(ques_id: string) {
    return this.prisma.$transaction(async (tx) => {
      const questionExists = await tx.questions.findUnique({
        where: { ques_id },
      });
      if (!questionExists) {
        throw new NotFoundException(`Question with ID ${ques_id} not found`);
      }
      await tx.answers.deleteMany({ where: { ques_id } });
      const deletedQuestion = await tx.questions.delete({ where: { ques_id } });
      return deletedQuestion;
    });
  }

  async updateAnswer(
    aid: number,
    ques_id: string,
    answer: Partial<CreateAnswerDto>,
  ) {
    const aidNum = Number(aid);
    if (isNaN(aidNum)) {
      throw new Error('Answer ID must be a number');
    }
    const existingAnswer = await this.prisma.answers.findUnique({
      where: { ques_id_aid: { ques_id, aid: aidNum } },
    });
    if (!existingAnswer) {
      throw new NotFoundException(
        `Answer with AID ${aidNum} for Question ID ${ques_id} not found`,
      );
    }

    const { content, isCorrect, explaination } = answer;
    const updateData: Prisma.AnswersUpdateInput = {};
    if (content !== undefined) updateData.content = content;
    if (isCorrect !== undefined) updateData.is_correct = isCorrect;
    if (explaination !== undefined) updateData.explaination = explaination;

    try {
      return await this.prisma.answers.update({
        where: { ques_id_aid: { ques_id, aid: aidNum } },
        data: updateData,
        select: {
          aid: true,
          ques_id: true,
          content: true,
          is_correct: true,
          explaination: true,
        },
      });
    } catch (error) {
      console.error(
        `Error updating answer ${aidNum} for question ${ques_id}:`,
        error,
      );
      throw new Error('Could not update answer.');
    }
  }

  async addAnswer(answers: CreateAnswerDto[], ques_id: string) {
    const questionExists = await this.prisma.questions.findUnique({
      where: { ques_id },
    });
    if (!questionExists) {
      throw new NotFoundException(`Question with ID ${ques_id} not found`);
    }

    const lastAnswer = await this.prisma.answers.findFirst({
      where: { ques_id },
      orderBy: { aid: 'desc' },
      select: { aid: true },
    });
    let nextAid = (lastAnswer?.aid || 0) + 1;

    const answersToCreate = answers.map((answer) => ({
      aid: nextAid++,
      ques_id: ques_id,
      content: answer.content,
      is_correct: answer.isCorrect,
      explaination: answer.explaination || null,
    }));

    try {
      await this.prisma.answers.createMany({ data: answersToCreate });
      return {
        message: `Added ${answersToCreate.length} answers successfully!`,
      };
    } catch (error) {
      console.error(`Error adding answers for question ${ques_id}:`, error);
      throw new Error('Could not add answers.');
    }
  }

  async deleteAnswer(aid: number, ques_id: string) {
    const aidNum = Number(aid);
    if (isNaN(aidNum)) {
      throw new Error('Answer ID must be a number');
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const answerToDelete = await tx.answers.findUnique({
          where: { ques_id_aid: { ques_id, aid: aidNum } },
        });
        if (!answerToDelete) {
          throw new NotFoundException(
            `Answer with AID ${aidNum} for Question ID ${ques_id} not found`,
          );
        }
        await tx.answers.delete({
          where: { ques_id_aid: { ques_id, aid: aidNum } },
        });
        await tx.answers.updateMany({
          where: { ques_id: ques_id, aid: { gt: aidNum } },
          data: { aid: { decrement: 1 } },
        });
        return { message: `Answer AID ${aidNum} deleted successfully!` };
      });
    } catch (error) {
      console.error(
        `Error deleting answer ${aidNum} for question ${ques_id}:`,
        error,
      );
      if (error instanceof NotFoundException) throw error;
      throw new Error('Could not delete answer.');
    }
  }
}
