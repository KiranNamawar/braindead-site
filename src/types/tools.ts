// Tool-specific type definitions
import { ToolCategory } from './index';

// Base tool interface that all tools should implement
export interface BaseTool {
  id: string;
  name: string;
  category: ToolCategory;
  process: (input: any) => any;
  validate: (input: any) => boolean;
  export?: (data: any, format: string) => any;
}

// Everyday Life Tools
export interface TipCalculatorData {
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
  customTip?: number;
}

export interface AgeCalculatorData {
  birthDate: Date;
  targetDate?: Date;
  includeTime: boolean;
}

export interface BMICalculatorData {
  weight: number;
  height: number;
  unit: 'metric' | 'imperial';
}

export interface LoanCalculatorData {
  principal: number;
  interestRate: number;
  termYears: number;
  paymentFrequency: 'monthly' | 'weekly' | 'biweekly';
}

// Text & Writing Tools
export interface TextAnalysisData {
  text: string;
  includeReadingTime: boolean;
  includeKeywordDensity: boolean;
}

export interface TextCaseData {
  text: string;
  caseType: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'pascal';
}

export interface DiffCheckerData {
  originalText: string;
  modifiedText: string;
  diffType: 'line' | 'word' | 'character';
}

// Creative & Design Tools
export interface GradientData {
  type: 'linear' | 'radial' | 'conic';
  colors: Array<{
    color: string;
    position: number;
  }>;
  direction?: number;
  centerX?: number;
  centerY?: number;
}

export interface ASCIIArtData {
  text: string;
  font: string;
  width?: number;
  horizontalLayout?: 'default' | 'fitted' | 'controlled smushing' | 'universal smushing';
}

// Time & Productivity Tools
export interface PomodoroData {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface WorldClockData {
  timezones: Array<{
    timezone: string;
    label: string;
    format: '12h' | '24h';
  }>;
}

// Developer Tools
export interface Base64Data {
  input: string;
  operation: 'encode' | 'decode';
  urlSafe: boolean;
}

export interface JSONData {
  input: string;
  operation: 'format' | 'minify' | 'validate';
  indentation: number;
}

export interface MarkdownData {
  markdown: string;
  options: {
    breaks: boolean;
    linkify: boolean;
    typographer: boolean;
  };
}

// Number & Conversion Tools
export interface NumberConversionData {
  input: string;
  fromBase: number;
  toBase: number;
  showSteps: boolean;
}

export interface RomanNumeralData {
  input: string | number;
  operation: 'toRoman' | 'fromRoman';
}

// Tool result interfaces
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
  executionTime?: number;
}

// Tool configuration interface
export interface ToolConfig {
  id: string;
  enabled: boolean;
  settings: Record<string, any>;
  shortcuts: string[];
  exportFormats: string[];
  integrations: string[];
}