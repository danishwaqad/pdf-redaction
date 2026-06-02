export type RedactionSource = "manual" | "search" | "pattern";

export interface RedactionRect {
  id: string;
  pageIndex: number;
  /** PDF user-space coordinates (origin bottom-left), in points */
  x: number;
  y: number;
  width: number;
  height: number;
  source: RedactionSource;
  label?: string;
}

export interface TextSpan {
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** PDF.js marks end-of-line after this text run */
  endsLine?: boolean;
}

export interface SearchMatch {
  pageIndex: number;
  text: string;
  start: number;
  end: number;
  rect: Omit<RedactionRect, "id" | "source">;
}

export interface PatternMatchCount {
  email: number;
  phone: number;
  creditCard: number;
  date: number;
  ssn: number;
}

export interface PageViewportInfo {
  pageIndex: number;
  width: number;
  height: number;
  scale: number;
}
