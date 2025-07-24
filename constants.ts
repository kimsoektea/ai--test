
import { StoreType, AnalysisPeriod } from './types';

export const INDUSTRIES = [
  "치킨", "커피전문점", "피자", "편의점", "한식", "분식", "일식", "중식", "베이커리", "PC방", "만화카페"
];

export const STORE_TYPES: StoreType[] = [
  StoreType.DELIVERY, StoreType.TAKEOUT, StoreType.STANDARD
];

export const ANALYSIS_PERIODS: AnalysisPeriod[] = [
  AnalysisPeriod.DAILY, AnalysisPeriod.WEEKLY, AnalysisPeriod.MONTHLY, AnalysisPeriod.YEARLY
];