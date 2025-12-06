export interface ChapterInfo {
  title: string;
  page: number;
  level: number;
  children?: ChapterInfo[];
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  pageCount: number;
  creationDate?: Date;
}
