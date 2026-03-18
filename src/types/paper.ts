export interface Paper {
  id: number;
  title: string;
  authors: string;
  year: number;
  journal: string | null;
  link: string | null;
  abstract: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaperInput {
  title: string;
  authors: string;
  year: number;
  journal?: string;
  link?: string;
  abstract?: string;
}

export interface UpdatePaperInput extends Partial<CreatePaperInput> {
  password: string;
}

export interface DeletePaperInput {
  password: string;
}
