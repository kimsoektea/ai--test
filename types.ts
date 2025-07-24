export enum StoreType {
  DELIVERY = "배달전문",
  TAKEOUT = "테이크아웃",
  STANDARD = "일반점포",
}

export enum AnalysisPeriod {
  DAILY = "일간",
  WEEKLY = "주간",
  MONTHLY = "월간",
  YEARLY = "연간",
}

export interface FilterOptions {
  region: string;
  industry: string;
  storeTypes: StoreType[];
  analysisPeriod: AnalysisPeriod;
}

export interface CompetitorBrand {
  brandName: string;
  count: number;
  estimatedMonthlySales: number;
}

export interface CostData {
  franchiseFee: number;
  deposit: number;
  interior: number;
  other: number;
  totalStartup: number;
  rent: number;
  labor: number;
  utilities: number;
  totalMonthly: number;
}

export interface SalesData {
  period: string;
  sales: number;
}

export interface AnalysisResult {
  storeType: StoreType;
  summary: string;
  populationDensity: string;
  floatingPopulation: string;
  industryClosureRate: number;
  newBusinessSurvivalRate: number;
  competitorDistribution: CompetitorBrand[];
  successRate: number;
  successContext: string;
  costs: CostData;
  sales: SalesData[];
  recommendation: string;
}