export interface ContentCard {
    id: string;
    title: string;
    description?: string;
    idea_id?: string | null;
    platforms?: string[];
    content_type?: string | null;
    series_id?: string | null;
    column_id: string;
    order: number;
    is_checked: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserWorkflow {
    id: string;
    user_id: string;
    name: string;
    columns: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateContentCardInput {
    title: string;
    description?: string;
    idea_id?: string | null;
    platforms?: string[];
    content_type?: string | null;
    series_id?: string | null;
    column_id: string;
    order?: number;
}

export interface UpdateContentCardInput {
    title?: string;
    description?: string;
    order?: number;
    is_checked?: boolean;
}

export interface CreateUserWorkflowInput {
    name: string;
    columns: string[];
}

export interface UpdateUserWorkflowInput {
    id: string;
    name?: string;
    columns?: string[];
}

export interface ContentCardWithRelations extends ContentCard {
    column?: {
        id: string;
        name: string;
    };
}
