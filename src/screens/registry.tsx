'use client';

import type { ReactElement } from 'react';
import { RootStackParamList } from '@/navigation/types';
import { DashboardScreen } from './dashboard';
import { createPlaceholderScreen } from './placeholder';
import { CamberCalculatorScreen } from '@/features/camber/camber-calculator-screen';
import { CamberHistoryScreen } from '@/features/camber/camber-history-screen';
import { CamberResultsScreen } from '@/features/camber/camber-results-screen';
import { StrandPatternsScreen } from '@/features/strand/strand-patterns-screen';
import { StrandLibraryScreen } from '@/features/strand/strand-library-screen';
import { SlippageIdentifierScreen } from '@/features/slippage/slippage-identifier-screen';
import { SlippageSummaryScreen } from '@/features/slippage/slippage-summary-screen';
import { SlippageHistoryScreen } from '@/features/slippage/slippage-history-screen';
import { StressingCalculatorScreen } from '@/features/stressing/stressing-calculator-screen';
import { StressingResultsScreen } from '@/features/stressing/stressing-results-screen';
import { AggregateGradationScreen } from '@/features/aggregate/gradation-dashboard';
import { GradationTestScreen } from '@/features/aggregate/gradation-test-screen';
import { GradationResultsScreen } from '@/features/aggregate/gradation-results-screen';
import { GradationHistoryScreen } from '@/features/aggregate/gradation-history-screen';
import { GradationAdminScreen } from '@/features/aggregate/gradation-admin-screen';
import { GradationAddEditAggregateScreen } from '@/features/aggregate/gradation-add-edit-aggregate-screen';
import { AggregateLibraryScreen } from '@/features/aggregate-library/aggregate-library-screen';
import { AggregateLibraryDetailScreen } from '@/features/aggregate-library/aggregate-library-detail-screen';
import { AggregateLibraryAddEditScreen } from '@/features/aggregate-library/aggregate-library-add-edit-screen';

type ScreenName = keyof RootStackParamList;
type ScreenComponent = (props: { params: unknown }) => ReactElement;

const ProductDetailsPlaceholder = createPlaceholderScreen(
  'Product Details',
  'Strand product configuration helpers will be ported soon.'
);

const LibrariesPlaceholder = createPlaceholderScreen(
  'Library Module',
  'CRUD experiences for aggregates, admixtures, strands, projects, and products will follow.'
);

const QualityLogPlaceholder = createPlaceholderScreen(
  'Quality Logs',
  'Dashboards, log entry, metrics, and search are being adapted to the web shell.'
);

const SchedulePlaceholder = createPlaceholderScreen(
  'Daily Pour Schedule',
  'Schedule planning, scanning, and review screens are in progress.'
);

const YardPlaceholder = createPlaceholderScreen(
  'Yard Management',
  'Yard maps, allocation, and search will be implemented alongside schedule tooling.'
);

const ContactsPlaceholder = createPlaceholderScreen(
  'Contacts',
  'Contact management with filters, notes, and favorites is queued.'
);

const EmailPlaceholder = createPlaceholderScreen(
  'Email Composer',
  'Microsoft Graph email authoring is being migrated to the browser using MSAL.'
);

const ProjectLibraryPlaceholder = createPlaceholderScreen(
  'Project Library',
  'Project tracking and export/import utilities are on the roadmap.'
);

const IssueCodePlaceholder = createPlaceholderScreen(
  'Issue Code Library',
  'Reference tables for QC issue codes will be surfaced in the Quality Logs module.'
);

const screenRegistry: Record<ScreenName, ScreenComponent> = {
  Dashboard: () => <DashboardScreen />,
  Calculator: () => <CamberCalculatorScreen />,
  Results: ({ params }) => <CamberResultsScreen params={params as RootStackParamList['Results']} />,
  History: () => <CamberHistoryScreen />,
  StrandPatterns: () => <StrandPatternsScreen />,
  ProductDetails: () => <ProductDetailsPlaceholder />,
  SlippageIdentifier: ({ params }) =>
    <SlippageIdentifierScreen params={params as RootStackParamList['SlippageIdentifier']} />,
  SlippageSummary: ({ params }) =>
    <SlippageSummaryScreen params={params as RootStackParamList['SlippageSummary']} />,
  SlippageHistory: () => <SlippageHistoryScreen />,
  EmailComposer: () => <EmailPlaceholder />,
  StressingCalculator: () => <StressingCalculatorScreen />,
  StressingResults: ({ params }) => <StressingResultsScreen params={params as RootStackParamList['StressingResults']} />,
  StrandLibrary: () => <StrandLibraryScreen />,
  AggregateGradation: () => <AggregateGradationScreen />,
  GradationTest: () => <GradationTestScreen />,
  GradationResults: () => <GradationResultsScreen />,
  GradationHistory: () => <GradationHistoryScreen />,
  GradationAdmin: () => <GradationAdminScreen />,
  GradationAddEditAggregate: () => <GradationAddEditAggregateScreen />,
  AggregateLibrary: () => <AggregateLibraryScreen />,
  AggregateLibraryDetail: ({ params }) =>
    <AggregateLibraryDetailScreen params={params as RootStackParamList['AggregateLibraryDetail']} />,
  AggregateLibraryAddEdit: ({ params }) =>
    <AggregateLibraryAddEditScreen params={params as RootStackParamList['AggregateLibraryAddEdit']} />,
  AdmixLibrary: () => <LibrariesPlaceholder />,
  AdmixLibraryDetail: () => <LibrariesPlaceholder />,
  AdmixLibraryAddEdit: () => <LibrariesPlaceholder />,
  Contacts: () => <ContactsPlaceholder />,
  ContactDetail: () => <ContactsPlaceholder />,
  ContactAddEdit: () => <ContactsPlaceholder />,
  QualityLogDashboard: () => <QualityLogPlaceholder />,
  QualityLogList: () => <QualityLogPlaceholder />,
  QualityLogDetail: () => <QualityLogPlaceholder />,
  QualityLogAddEdit: () => <QualityLogPlaceholder />,
  QualityLogMetrics: () => <QualityLogPlaceholder />,
  QualityLogSearch: () => <QualityLogPlaceholder />,
  IssueCodeLibrary: () => <IssueCodePlaceholder />,
  ProductLibrary: () => <LibrariesPlaceholder />,
  ProjectLibrary: () => <ProjectLibraryPlaceholder />,
  ProjectLibraryDetail: () => <ProjectLibraryPlaceholder />,
  ProjectLibraryAddEdit: () => <ProjectLibraryPlaceholder />,
  ProjectLibraryExportImport: () => <ProjectLibraryPlaceholder />,
  DailyPourSchedule: () => <SchedulePlaceholder />,
  ScheduleSearch: () => <SchedulePlaceholder />,
  ScheduleScanner: () => <SchedulePlaceholder />,
  ScheduleReview: () => <SchedulePlaceholder />,
  YardMap: () => <YardPlaceholder />,
  YardDepartment: () => <YardPlaceholder />,
  YardProductSelection: () => <YardPlaceholder />,
  YardSearch: () => <YardPlaceholder />,
};

export function getScreenComponent(name: ScreenName) {
  return screenRegistry[name] ?? createPlaceholderScreen(name);
}

export const availableScreens = Object.keys(screenRegistry) as ScreenName[];
