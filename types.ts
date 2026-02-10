export enum ModuleType {
  HEADER_LOGO = 'HEADER_LOGO',
  BANNER = 'BANNER',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TABLE = 'TABLE',
  BUTTON = 'BUTTON',
  SIGNATURE = 'SIGNATURE'
}

export interface TableRow {
  label: string;
  value: string;
}

export interface GridRow {
  cells: string[];
}

export interface ModuleData {
  id: string;
  type: ModuleType;
  properties: {
    imageUrl?: string;
    title?: string;
    content?: string;
    url?: string;
    buttonText?: string;
    rows?: TableRow[]; // Legacy, kept for compatibility if needed during migration
    headers?: string[]; // Legacy, kept for compatibility if needed
    gridRows?: GridRow[];
    hasColumnHeaders?: boolean;
    hasRowHeaders?: boolean;
    hasStarRating?: boolean;
    align?: 'left' | 'center' | 'right';
    color?: string;
    secondaryColor?: string;
    altText?: string;
  };
}

export interface EmailState {
  modules: ModuleData[];
}