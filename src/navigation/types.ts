import type { CalculationRecord } from '@/state/calculatorStore';
import type { SlippageData, SlippageConfig } from '@/state/slippageHistoryStore';
import type { PourEntry } from '@/types/pour-schedule';

export type RootStackParamList = {
  Dashboard: undefined;
  Calculator: undefined;
  Results: { calculationId: CalculationRecord['id'] };
  History: undefined;
  StrandPatterns: undefined;
  ProductDetails: undefined;
  SlippageIdentifier: { 
    config: SlippageConfig;
    // Quality log integration
    fromQualityLog?: boolean;
    qualityLogId?: string;
    qualityEntryId?: string;
  };
  SlippageSummary: { 
    slippages: SlippageData[];
    config: SlippageConfig;
    // Quality log integration
    fromQualityLog?: boolean;
    qualityLogId?: string;
    qualityEntryId?: string;
  };
  SlippageHistory: undefined;
  EmailComposer: {
    subject: string;
    body: string;
  };
  StressingCalculator: undefined;
  StressingResults: {
    jackingForce: number;
    bedLength: number;
    strandId: string; // ID from Strand Library
    numberOfStrands: number;
    bedShortening?: number;
    frictionLoss?: number;
    anchorSetLoss?: number;
  };
  StrandLibrary: undefined;
  AggregateGradation: undefined;
  GradationTest: { aggregateName: string };
  GradationResults: { testId: string };
  GradationHistory: undefined;
  GradationAdmin: undefined;
  GradationAddEditAggregate: { aggregateName?: string };
  AggregateLibrary: undefined;
  AggregateLibraryDetail: { aggregateId: string };
  AggregateLibraryAddEdit: { aggregateId?: string };
  AdmixLibrary: undefined;
  AdmixLibraryDetail: { admixId: string };
  AdmixLibraryAddEdit: { admixId?: string };
  Contacts: undefined;
  ContactDetail: { contactId: string };
  ContactAddEdit: { contactId?: string };
  QualityLogDashboard: undefined;
  QualityLogList: { department: string };
  QualityLogDetail: { logId: string };
  QualityLogAddEdit: { logId?: string; department?: string };
  QualityLogMetrics: undefined;
  QualityLogSearch: undefined;
  IssueCodeLibrary: undefined;
  ProductLibrary: undefined;
  ProjectLibrary: undefined;
  ProjectLibraryDetail: { projectId: string };
  ProjectLibraryAddEdit: { 
    projectId?: string;
    prefilledJobNumber?: string;
    prefilledJobName?: string;
    returnScreen?: string;
  };
  ProjectLibraryExportImport: undefined;
  DailyPourSchedule: { date?: string; department?: string } | undefined;
  ScheduleSearch: undefined;
  ScheduleScanner: { date?: string; department?: string };
  ScheduleReview: { entries: PourEntry[]; date: string; department?: string };
  YardMap: undefined;
  YardDepartment: { department: string };
  YardProductSelection: { pourEntryId: string; department: string };
  YardSearch: undefined;
};
