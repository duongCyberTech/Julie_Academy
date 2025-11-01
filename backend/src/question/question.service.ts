import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookDto, CategoryDto } from './dto/question.dto'; 
import { CreateQuestionDto, CreateAnswerDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { DifficultyLevel, QuestionStatus, QuestionType, Prisma } from '@prisma/client';

@Injectable()
export class QuestionService {
    constructor(private prisma: PrismaService) {}

    async createBook(data: BookDto[]) {
        const createdBooks = [];
        for (const book of data) {
            const existingBook = await this.prisma.books.findUnique({ where: { title: book.title } });
            if (existingBook) {
                console.warn(`Book with title "${book.title}" already exists. Skipping creation.`);
                continue;
            }
            const newBook = await this.prisma.books.create({
                data: {
                    title: book.title,
                    subject: book.subject,
                    grade: book.grade,
                    description: book.description,
                }
            });
            createdBooks.push(newBook);
        }
        return createdBooks;
    }

    async getAllBooks() {
        return this.prisma.books.findMany({
            orderBy: { title: 'asc' }
        });
    }

    async createCategory(book_id: string, data: CategoryDto[]) {
        const bookExists = await this.prisma.books.findUnique({ where: { book_id } });
        if (!bookExists) {
            throw new NotFoundException(`Book with ID ${book_id} not found`);
        }
        const createdCategories = [];
        for (const category of data) {
             const existingCategory = await this.prisma.categories.findFirst({ where: { category_name: category.category_name, book_id: book_id } });
             if (existingCategory) {
                 console.warn(`Category "${category.category_name}" already exists in book ${book_id}. Skipping creation.`);
                 continue;
             }
            const newCategory = await this.prisma.categories.create({
                data: {
                    category_name: category.category_name,
                    description: category.description,
                    Books: { connect: { book_id } }
                },
            });
            createdCategories.push(newCategory);
        }
        return createdCategories;
    }

    async getAllCategories(book_id?: string, page?: number | string, limit?: number | string, search?: string, grade?: number | string, subject?: string) {
        const pageNum = page ? parseInt(String(page), 10) : 1;
        const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 20; // Default limit 20
        const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
        const takeNum = limitNum > 0 ? limitNum : undefined;

        const where: Prisma.CategoriesWhereInput = {};
        if (book_id) where.book_id = book_id;

        if (grade || subject) {
            where.Books = {};
            if (grade) { const gradeNum = parseInt(String(grade), 10); if (!isNaN(gradeNum)) where.Books.grade = gradeNum; }
            if (subject) { where.Books.subject = { contains: subject, mode: 'insensitive' }; }
            if (Object.keys(where.Books).length === 0) delete where.Books;
        }

        if (search) {
            where.OR = [
                { category_name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { Books: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const categories = await this.prisma.categories.findMany({
            where, skip: skipNum, take: takeNum, orderBy: { category_name: 'asc' },
            select: { category_id: true, category_name: true, description: true, Books: { select: { book_id: true, title: true, subject: true, grade: true } } },
        });
        const total = await this.prisma.categories.count({ where });
        return { data: categories, total };
    }

    async createQuestion(data: CreateQuestionDto[], tutor_uid: string) {
        const tutorExists = await this.prisma.tutor.findUnique({ where: { uid: tutor_uid } });
        if (!tutorExists) { throw new NotFoundException(`Tutor with ID ${tutor_uid} not found`); }

        return this.prisma.$transaction(async (tx) => {
            const createdQuestions = [];
            for (const question of data) {
                const categoryExists = await tx.categories.findUnique({ where: { category_id: question.categoryId } });
                if (!categoryExists) { throw new NotFoundException(`Category with ID ${question.categoryId} not found for question: "${question.content.substring(0, 20)}..."`); }

                const statusEnumValue = question.status?.toUpperCase() === 'PUBLIC' ? QuestionStatus.public : QuestionStatus.private;

                const newQuestion = await tx.questions.create({
                    data: {
                        content: question.content,
                        explaination: question.explaination,
                        type: question.type as QuestionType,
                        level: question.level as DifficultyLevel,
                        status: statusEnumValue,
                        category: { connect: { category_id: question.categoryId } },
                        tutor: { connect: { uid: tutor_uid } },
                    },
                    select: { ques_id: true }
                });

                if (question.answers && Array.isArray(question.answers) && question.answers.length > 0) {
                    const answersToCreate = question.answers.map((answer, index) => ({
                        aid: index + 1,
                        content: answer.content,
                        is_correct: answer.isCorrect,
                        explaination: answer.explaination || null,
                        ques_id: newQuestion.ques_id,
                    }));
                    await tx.answers.createMany({ data: answersToCreate });
                }
                createdQuestions.push({ ques_id: newQuestion.ques_id, content: question.content });
            }
            return createdQuestions;
        });
    }

    async getQuestionsByCategory(category_id: string, page?: number | string, limit?: number | string, search?: string, level?: string, type?: string) {
        const pageNum = page ? parseInt(String(page), 10) : 1;
        const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
        const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
        const takeNum = limitNum > 0 ? limitNum : undefined;

        const where: Prisma.QuestionsWhereInput = {
            category_id: category_id,
            status: QuestionStatus.public
        };

        if (level) { const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel; if (DifficultyLevel[levelKey]) { where.level = DifficultyLevel[levelKey]; } }
        if (type) { const typeKey = type.toUpperCase() as keyof typeof QuestionType; if (QuestionType[typeKey]) { where.type = QuestionType[typeKey]; } else if (Object.values(QuestionType).includes(type as QuestionType)) { where.type = type as QuestionType;} }
        if (search) { where.OR = [ { content: { contains: search, mode: 'insensitive' } }, { explaination: { contains: search, mode: 'insensitive' } } ]; }

        try {
            const questions = await this.prisma.questions.findMany({
                where, skip: skipNum, take: takeNum, orderBy: { createAt: 'desc' },
                select: { ques_id: true, content: true, type: true, level: true, status: true, createAt: true, category: { select: { category_id: true, category_name: true, Books: { select: { book_id: true, title: true } } } } },
            });
            const total = await this.prisma.questions.count({ where });
            return { data: questions, total };
        } catch (error) {
             console.error("Error fetching questions by category:", error);
             throw new Error('Could not fetch questions by category.');
        }
    }

    async getAllQuestion( page?: number | string, limit?: number | string, search?: string, level?: string, type?: string, status?: string, category_id?: string, book_id?: string ) {
        const pageNum = page ? parseInt(String(page), 10) : 1;
        const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
        const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
        const takeNum = limitNum > 0 ? limitNum : undefined;

        const where: Prisma.QuestionsWhereInput = {};

        if (level) { const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel; if (DifficultyLevel[levelKey]) { where.level = DifficultyLevel[levelKey]; } else { console.warn(`Invalid level filter: ${level}`); } }
        if (type) { const typeKey = type.toUpperCase() as keyof typeof QuestionType; if (QuestionType[typeKey]) { where.type = QuestionType[typeKey]; } else if (Object.values(QuestionType).includes(type as QuestionType)){ where.type = type as QuestionType; } else { console.warn(`Invalid type filter: ${type}`); } }
        if (status) { const statusKey = status.toUpperCase() as keyof typeof QuestionStatus; if (QuestionStatus[statusKey]) { where.status = QuestionStatus[statusKey]; } else if (Object.values(QuestionStatus).includes(status as QuestionStatus)){ where.status = status as QuestionStatus; } else { console.warn(`Invalid status filter: ${status}`); } }

        let categoryFilter: Prisma.CategoriesWhereInput = {};
        if (category_id) { categoryFilter.category_id = category_id; }
        if (book_id) { categoryFilter.Books = { book_id: book_id }; }
        if (Object.keys(categoryFilter).length > 0) { where.category = categoryFilter; }

        if (search) {
            where.OR = [
                { content: { contains: search, mode: 'insensitive' } },
                { explaination: { contains: search, mode: 'insensitive' } },
                { tutor: { user: { OR: [ { fname: { contains: search, mode: 'insensitive' } }, { lname: { contains: search, mode: 'insensitive' } } ]}}},
                { category: { category_name: { contains: search, mode: 'insensitive' } } },
                { category: { Books: { title: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        try {
            const questions = await this.prisma.questions.findMany({
                where, skip: skipNum, take: takeNum, orderBy: { createAt: 'desc' },
                select: {
                    ques_id: true, content: true, type: true, level: true, status: true, createAt: true, updateAt: true,
                    category: { select: { category_id: true, category_name: true, Books: { select: { book_id: true, title: true, subject: true, grade: true } } } },
                },
            });
            const total = await this.prisma.questions.count({ where });
            return { data: questions, total };
        } catch (error) {
             console.error("Error fetching all questions:", error);
             throw new Error('Could not fetch questions.');
        }
    }

    async getMyQuestions( tutor_uid: string, page?: number | string, limit?: number | string, search?: string, level?: string, type?: string, status?: string, category_id?: string, book_id?: string ) {
        const pageNum = page ? parseInt(String(page), 10) : 1;
        const limitNum = limit !== undefined ? parseInt(String(limit), 10) : 10;
        const skipNum = limitNum > 0 ? (pageNum - 1) * limitNum : 0;
        const takeNum = limitNum > 0 ? limitNum : undefined;

        const where: Prisma.QuestionsWhereInput = { tutor_id: tutor_uid };

        if (level) { const levelKey = level.toLowerCase() as keyof typeof DifficultyLevel; if (DifficultyLevel[levelKey]) { where.level = DifficultyLevel[levelKey]; } else { console.warn(`Invalid level filter: ${level}`); } }
        if (type) { const typeKey = type.toUpperCase() as keyof typeof QuestionType; if (QuestionType[typeKey]) { where.type = QuestionType[typeKey]; } else if (Object.values(QuestionType).includes(type as QuestionType)){ where.type = type as QuestionType; } else { console.warn(`Invalid type filter: ${type}`); } }
        if (status) { const statusKey = status.toUpperCase() as keyof typeof QuestionStatus; if (QuestionStatus[statusKey]) { where.status = QuestionStatus[statusKey]; } else if (Object.values(QuestionStatus).includes(status as QuestionStatus)){ where.status = status as QuestionStatus; } else { console.warn(`Invalid status filter: ${status}`); } }

        let categoryFilter: Prisma.CategoriesWhereInput = {};
        if (category_id) { categoryFilter.category_id = category_id; }
        if (book_id) { categoryFilter.Books = { book_id: book_id }; }
        if (Object.keys(categoryFilter).length > 0) { where.category = categoryFilter; }

        if (search) {
             where.OR = [
                { content: { contains: search, mode: 'insensitive' } },
                { explaination: { contains: search, mode: 'insensitive' } },
                { category: { category_name: { contains: search, mode: 'insensitive' }}},
                { category: { Books: { title: { contains: search, mode: 'insensitive' } } } }
             ];
        }

        try {
            const questions = await this.prisma.questions.findMany({
                where, skip: skipNum, take: takeNum, orderBy: { createAt: 'desc' },
                select: {
                    ques_id: true, content: true, type: true, level: true, status: true, createAt: true, updateAt: true,
                    category: { select: { category_id: true, category_name: true, Books: {select:  {book_id: true, title: true, subject: true, grade: true}} } },
                },
            });
            const total = await this.prisma.questions.count({ where });
            return { data: questions, total };
        } catch (error) {
             console.error("Error fetching my questions:", error);
             throw new Error('Could not fetch your questions.');
        }
    }

    async getQuestionById(ques_id: string) {
        const question = await this.prisma.questions.findUnique({
            where: { ques_id },
            select: {
                ques_id: true, content: true, explaination: true, type: true, level: true, status: true,
                category: { select: { category_id: true, category_name: true, Books: {select: {book_id: true, title: true, subject: true, grade: true}} } },
                answers: { select: { aid: true, content: true, is_correct: true, explaination: true }, orderBy: { aid: 'asc'} },
                tutor: { select: { user: { select: { uid: true, fname: true, lname: true }} } }
            },
        });
        if (!question) { throw new NotFoundException(`Question with ID ${ques_id} not found`); }
        return question;
    }

    async updateQuestion(ques_id: string, data: UpdateQuestionDto) {
        const { answers, categoryId, ...restData } = data;
        // Explicitly type updateData for better safety
        const updateData: Prisma.QuestionsUpdateInput = { ...restData };

        // Convert string values to enums if they exist in restData
        if (restData.level) {
             const levelKey = String(restData.level).toUpperCase() as keyof typeof DifficultyLevel;
             if (DifficultyLevel[levelKey]) { updateData.level = DifficultyLevel[levelKey]; }
             else { console.warn(`Invalid level value during update: ${restData.level}`); delete updateData.level; } // Remove invalid value
        }
         if (restData.type) {
             const typeKey = String(restData.type).toUpperCase() as keyof typeof QuestionType;
             if (QuestionType[typeKey]) { updateData.type = QuestionType[typeKey]; }
             else if (Object.values(QuestionType).includes(restData.type as QuestionType)){ updateData.type = restData.type as QuestionType; }
             else { console.warn(`Invalid type value during update: ${restData.type}`); delete updateData.type; }
         }
         if (restData.status) {
             const statusKey = String(restData.status).toUpperCase() as keyof typeof QuestionStatus;
             if (QuestionStatus[statusKey]) { updateData.status = QuestionStatus[statusKey]; }
             else if (Object.values(QuestionStatus).includes(restData.status as QuestionStatus)){ updateData.status = restData.status as QuestionStatus; }
             else { console.warn(`Invalid status value during update: ${restData.status}`); delete updateData.status; }
         }


        if (categoryId) {
            const categoryExists = await this.prisma.categories.findUnique({ where: { category_id: categoryId } });
            if (!categoryExists) { throw new NotFoundException(`Category with ID ${categoryId} not found`); }
            updateData.category = { connect: { category_id: categoryId } };
        }


        try {
            return await this.prisma.questions.update({
                where: { ques_id },
                data: updateData,
                select: { ques_id: true, content: true, status: true, level: true, type: true } // Select updated fields
            });
        } catch (error) {
             console.error(`Error updating question ${ques_id}:`, error);
             throw new Error('Could not update question.');
        }
    }


    async deleteQuestion(ques_id: string) {
        return this.prisma.$transaction(async (tx) => {
            const questionExists = await tx.questions.findUnique({ where: { ques_id } });
            if (!questionExists) { throw new NotFoundException(`Question with ID ${ques_id} not found`); }
            // Consider relations: deleting questions might need checking exam_questions etc.
            await tx.answers.deleteMany({ where: { ques_id } });
            // Add deletion for other related data if necessary (e.g., Question_of_exam)
            const deletedQuestion = await tx.questions.delete({ where: { ques_id } });
            return deletedQuestion;
        });
    }

    async updateAnswer(aid: number, ques_id: string, answer: Partial<CreateAnswerDto>) {
        const aidNum = Number(aid);
        if(isNaN(aidNum)){ throw new Error("Answer ID must be a number"); }
        const existingAnswer = await this.prisma.answers.findUnique({ where: { ques_id_aid: { ques_id, aid: aidNum } } });
        if (!existingAnswer) { throw new NotFoundException(`Answer with AID ${aidNum} for Question ID ${ques_id} not found`); }

        const { content, isCorrect, explaination } = answer; // Include explaination
        const updateData: Prisma.AnswersUpdateInput = {};
        if (content !== undefined) updateData.content = content;
        if (isCorrect !== undefined) updateData.is_correct = isCorrect;
        if (explaination !== undefined) updateData.explaination = explaination; // Update explaination

        try {
            return await this.prisma.answers.update({
                where: { ques_id_aid: { ques_id, aid: aidNum } },
                data: updateData,
                select: { aid: true, ques_id: true, content: true, is_correct: true, explaination: true } // Select updated fields
            });
        } catch (error) {
             console.error(`Error updating answer ${aidNum} for question ${ques_id}:`, error);
             throw new Error('Could not update answer.');
        }
    }


    async addAnswer(answers: CreateAnswerDto[], ques_id: string) {
         const questionExists = await this.prisma.questions.findUnique({ where: { ques_id } });
         if (!questionExists) { throw new NotFoundException(`Question with ID ${ques_id} not found`); }

        const lastAnswer = await this.prisma.answers.findFirst({ where: { ques_id }, orderBy: { aid: 'desc' }, select: { aid: true } });
        let nextAid = (lastAnswer?.aid || 0) + 1;

        const answersToCreate = answers.map(answer => ({
            aid: nextAid++,
            ques_id: ques_id,
            content: answer.content,
            is_correct: answer.isCorrect,
            explaination: answer.explaination || null, 
        }));

        try {
            await this.prisma.answers.createMany({ data: answersToCreate });
            return { message: `Added ${answersToCreate.length} answers successfully!` }; 
        } catch (error) {
             console.error(`Error adding answers for question ${ques_id}:`, error);
             throw new Error('Could not add answers.');
        }
    }


    async deleteAnswer(aid: number, ques_id: string) {
        const aidNum = Number(aid);
        if(isNaN(aidNum)){ throw new Error("Answer ID must be a number"); }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const answerToDelete = await tx.answers.findUnique({ where: { ques_id_aid: { ques_id, aid: aidNum } } });
                if (!answerToDelete) { throw new NotFoundException(`Answer with AID ${aidNum} for Question ID ${ques_id} not found`); }
                await tx.answers.delete({ where: { ques_id_aid: { ques_id, aid: aidNum } } });
                await tx.answers.updateMany({ where: { ques_id: ques_id, aid: { gt: aidNum } }, data: { aid: { decrement: 1 } } });
                return { message: `Answer AID ${aidNum} deleted successfully!` }; 
            });
        } catch (error) {
             console.error(`Error deleting answer ${aidNum} for question ${ques_id}:`, error);
             if (error instanceof NotFoundException) throw error; 
             throw new Error('Could not delete answer.');
        }
    }

}