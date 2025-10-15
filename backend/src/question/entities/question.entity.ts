
import { Questions, Answers, Categories, Tutor } from '@prisma/client';

class TutorEntity {
  uid: string;
  user: { 
    username: string;
  };
}
class CategoryEntity implements Categories {
  category_id: string;
  category_name: string;
  description: string | null;
  grades: number;
  subject: string;
  createdAt: Date;
  updateAt: Date;
}

class AnswerEntity implements Answers {
  ques_id: string;
  aid: number;
  content: string;
  is_correct: boolean;
}

export class QuestionEntity implements Questions {
  ques_id: string;
  content: string;
  explaination: string | null;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  level: 'easy' | 'medium' | 'hard';
  createAt: Date;
  updateAt: Date;
  
  category_id: string;
  tutor_id: string;
  tutor: TutorEntity;
  category: CategoryEntity;
  answers: AnswerEntity[];
}