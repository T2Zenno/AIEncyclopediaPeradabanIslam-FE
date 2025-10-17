import { FeatureCollection } from 'geojson';

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface ChartDataItem {
  name: string;
  [key: string]: any; 
}

export interface ChartData {
  title?: string;
  type: 'timeline' | 'bar' | 'line';
  data: ChartDataItem[];
  xAxisKey: string;
  dataKeys: string[];
  yAxisLabel?: string;
}

export interface MapMarker {
  position: [number, number]; // [lat, lng]
  popupContent: string;
  year?: number | string;
}

export interface MapData {
  center: [number, number]; // [lat, lng]
  zoom: number;
  geojson?: FeatureCollection;
  markers?: MapMarker[];
}

export interface KeyTerm {
  term: string;
  definition: string;
  etymology?: string;
}

export interface TimelineEvent {
  year: number | string;
  title: string;
  description: string;
  significance?: string;
}

export interface Figure {
  name: string;
  lifespan: string;
  summary: string;
  key_contributions?: string[];
}

export type LanguageCode = 'id' | 'ar' | 'en';

export interface MultiLangGeminiResponse {
  id: GeminiResponse;
  ar: GeminiResponse;
  en: GeminiResponse;
}

// Represents the persistent, minimal history data (the "database" record)
export interface HistoryListItem {
  query: string;
  timestamp: number;
  userId?: string;
}

// Represents the full history object, including the locally cached response
export interface HistoryItem extends HistoryListItem {
  response: MultiLangGeminiResponse;
}


export interface GeminiResponse {
  text: string;
  sources: GroundingChunk[];
  chart?: ChartData;
  map?: MapData;
  keyTerms?: KeyTerm[];
  generatedImage?: string | null; // base64 encoded image string
  accessDate: string;
  timeline?: TimelineEvent[];
  figures?: Figure[];
}

// --- New Types for Authentication ---
export type Role = 'Admin' | 'User';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text passwords
  role: Role;
  createdAt: number; // Timestamp for when user was created
}

// Extended user type for admin dashboard
export interface UserWithStats extends User {
    queryCount: number;
}

// --- New Types for Content Management ---
export interface DirectoryCategory {
  category: string;
  icon: string; // Storing icon as string for simplicity in CRUD
  items: string[];
}

export interface DirectoryData {
  id: DirectoryCategory[];
  ar: DirectoryCategory[];
  en: DirectoryCategory[];
}