export enum ModuleType {
  HEADER_LOGO = 'HEADER_LOGO',
  BANNER = 'BANNER',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TABLE = 'TABLE',
  BUTTON = 'BUTTON',
  SIGNATURE = 'SIGNATURE',
  DELIVERY_PHASE = 'DELIVERY_PHASE',
  KPI_CARDS = 'KPI_CARDS',
  TWO_COLUMN = 'TWO_COLUMN',
  CHECKLIST = 'CHECKLIST',
  LEGAL = 'LEGAL'
}

export interface TableRow {
  label: string;
  value: string;
}

export interface GridRow {
  cells: string[];
}

export interface KpiMetric {
  value: string;
  label: string;
  color: string;
}

export interface ChecklistItem {
  text: string;
  icon: 'empty' | 'checked' | 'blue' | 'black' | 'circle' | 'disc' | 'arrow' | 'star';
}

export interface ModuleData {
  id: string;
  type: ModuleType;
  section: 'inside' | 'outside';
  properties: {
    imageUrl?: string;
    imageWidth?: string;
    imageHeight?: string;
    title?: string;
    content?: string;
    url?: string;
    buttonText?: string;
    rows?: TableRow[];
    headers?: string[];
    gridRows?: GridRow[];
    hasColumnHeaders?: boolean;
    hasRowHeaders?: boolean;
    hasStarRating?: boolean;
    align?: 'left' | 'center' | 'right';
    color?: string;
    secondaryColor?: string;
    altText?: string;
    selectedPhase?: string;
    metrics?: KpiMetric[];
    imagePosition?: 'left' | 'right';
    checklistItems?: ChecklistItem[];
    col1Type?: 'text' | 'image';
    col1Text?: string;
    col1ImageUrl?: string;
    col2Type?: 'text' | 'image';
    col2Text?: string;
    col2ImageUrl?: string;
    chairman?: string;
    board?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  modules: ModuleData[];
  lastModified: number;
}

export interface EmailState {
  modules: ModuleData[];
}