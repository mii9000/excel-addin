export interface ProcessedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    dateAdded: Date;
    status: 'processing' | 'processed' | 'error';
    text?: string;
    textContent?: string;
}

export interface SearchResult {
    fileId: string;
    fileName: string;
    matches: SearchMatch[];
}

export interface SearchMatch {
    text: string;
    position: number;
    context: string;
} 