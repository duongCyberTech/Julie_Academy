export class CategoriesOutputDto {
    category_id: string;
    category_name: string;
    description: string;
    book_title?: string;
    grade?: number;
    subject?: string;
    parent_id: string | null;
    children: CategoriesOutputDto[];
}
