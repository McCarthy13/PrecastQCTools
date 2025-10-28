'use client';

import { Fragment, createElement } from 'react';
import { useAuthStore } from '@/state/authStore';
import { useNavigationStore } from '@/state/navigationStore';
import { getScreenComponent } from '@/screens/registry';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IoAnalyticsOutline,
  IoCalendarOutline,
  IoClipboardOutline,
  IoFlaskOutline,
  IoCubeOutline,
  IoFolderOpenOutline,
  IoInformationCircleOutline,
  IoGridOutline,
  IoLibraryOutline,
  IoLogOutOutline,
  IoMapOutline,
  IoPeopleOutline,
  IoResizeOutline,
  IoWaterOutline,
  IoCalculatorOutline,
  IoGitPullRequestOutline,
  IoArrowBackOutline,
  IoHomeOutline,
} from 'react-icons/io5';
import type { IconType } from 'react-icons';
import type { RootStackParamList } from '@/navigation/types';
import { useShallow } from 'zustand/react/shallow';

type ScreenName = keyof RootStackParamList;

interface NavItem {
  screen: ScreenName;
  label: string;
  icon: IconType;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { screen: 'Dashboard', label: 'Dashboard', icon: IoAnalyticsOutline },
    ],
  },
  {
    label: 'Camber & Strand',
    items: [
      { screen: 'Calculator', label: 'Camber Calculator', icon: IoCalculatorOutline },
      { screen: 'History', label: 'Camber History', icon: IoClipboardOutline },
      { screen: 'StrandPatterns', label: 'Strand Patterns', icon: IoLibraryOutline },
      { screen: 'StrandLibrary', label: 'Strand Library', icon: IoLibraryOutline },
    ],
  },
  {
    label: 'Slippage & Stressing',
    items: [
      { screen: 'SlippageIdentifier', label: 'Slippage Identifier', icon: IoResizeOutline },
      { screen: 'StressingCalculator', label: 'Stressing Calculator', icon: IoGitPullRequestOutline },
    ],
  },
  {
    label: 'Aggregates & Admix',
    items: [
      { screen: 'AggregateGradation', label: 'Gradation Lab', icon: IoAnalyticsOutline },
      { screen: 'AggregateLibrary', label: 'Aggregate Library', icon: IoFlaskOutline },
      { screen: 'AdmixLibrary', label: 'Admix Library', icon: IoWaterOutline },
    ],
  },
  {
    label: 'Quality & Production',
    items: [
      { screen: 'QualityLogDashboard', label: 'Quality Logs', icon: IoClipboardOutline },
      { screen: 'DailyPourSchedule', label: 'Pour Schedule', icon: IoCalendarOutline },
      { screen: 'YardMap', label: 'Yard Maps', icon: IoMapOutline },
    ],
  },
  {
    label: 'Libraries & People',
    items: [
      { screen: 'ProductLibrary', label: 'Product Library', icon: IoCubeOutline },
      { screen: 'ProjectLibrary', label: 'Project Library', icon: IoFolderOpenOutline },
      { screen: 'Contacts', label: 'Contacts', icon: IoPeopleOutline },
      { screen: 'IssueCodeLibrary', label: 'Issue Codes', icon: IoInformationCircleOutline },
    ],
  },
];

const findNavLabel = (screen: ScreenName): string | undefined => {
  for (const section of navSections) {
    const match = section.items.find((item) => item.screen === screen);
    if (match) {
      return match.label;
    }
  }
  return undefined;
};

export function ProtectedApp() {
  const { logout, currentUser } = useAuthStore(
    useShallow((state) => ({
      logout: state.logout,
      currentUser: state.currentUser,
    }))
  );
  const { current, reset, back, canGoBack } = useNavigationStore(
    useShallow((state) => ({
      current: state.current,
      reset: state.reset,
      back: state.back,
      canGoBack: state.stack.length > 1,
    }))
  );

  const ScreenComponent = getScreenComponent(current.name);
  const activeLabel = findNavLabel(current.name) || current.name;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-5 py-8 lg:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
            <IoGridOutline className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Precast QC</p>
            <p className="text-base font-semibold text-slate-900">Quality Tools</p>
          </div>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
          {navSections.map((section) => (
            <Fragment key={section.label}>
              <div className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.label}
              </div>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = current.name === item.screen;
                  return (
                    <button
                      key={item.screen}
                      type="button"
                      onClick={() => reset(item.screen, undefined)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && <Badge variant="outline">{item.badge}</Badge>}
                    </button>
                  );
                })}
              </div>
            </Fragment>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          <p>Web parity build based on the QC Tools mobile reference. Modules unlock as they are ported.</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Tool</p>
            <h1 className="text-lg font-semibold text-slate-900">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => back()}
                disabled={!canGoBack}
                className="flex items-center gap-2"
              >
                <IoArrowBackOutline className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reset('Dashboard', undefined)}
                className="flex items-center gap-2"
              >
                <IoHomeOutline className="h-4 w-4" />
                Home
              </Button>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            )}
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <IoLogOutOutline className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            {createElement(ScreenComponent, { params: current.params as never })}
          </div>
        </main>
      </div>
    </div>
  );
}
