'use client';

import { useMemo, useState, type ReactElement } from 'react';
import {
  IoAnalyticsOutline,
  IoArrowBack,
  IoCalendarOutline,
  IoCheckmarkCircle,
  IoClipboardOutline,
  IoCloseCircle,
  IoCubeOutline,
  IoFlaskOutline,
  IoFolderOpenOutline,
  IoGitPullRequestOutline,
  IoInformationCircleOutline,
  IoLibraryOutline,
  IoMapOutline,
  IoPeopleOutline,
  IoResizeOutline,
  IoSearch,
  IoWaterOutline,
  IoCalculatorOutline,
  IoSadOutline,
} from 'react-icons/io5';
import { useNavigationStore } from '@/state/navigationStore';
import { useAggregateLibraryStore } from '@/state/aggregateLibraryStore';
import { useAdmixLibraryStore } from '@/state/admixLibraryStore';
import { useContactsStore } from '@/state/contactsStore';
import { AggregateLibraryItem } from '@/types/aggregate-library';
import { AdmixLibraryItem } from '@/types/admix-library';
import { ContactItem } from '@/types/contacts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ToolCard {
  id: string;
  name: string;
  description: string;
  icon: ReactElement;
  color: string;
  bgColor: string;
  route?: keyof import('@/navigation/types').RootStackParamList;
  comingSoon?: boolean;
}

const toolCards: ToolCard[] = [
  {
    id: 'camber-calculator',
    name: 'Camber Calculator',
    description: 'Calculate precast concrete member camber with strand patterns',
    icon: <IoCalculatorOutline className="h-6 w-6 text-white" />,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    route: 'Calculator',
  },
  {
    id: 'slippage-identifier',
    name: 'Slippage Identifier',
    description: 'Track and report strand slippage with cross-section templates',
    icon: <IoResizeOutline className="h-6 w-6 text-white" />,
    color: '#10B981',
    bgColor: '#F0FDF4',
    route: 'ProductDetails',
  },
  {
    id: 'stressing-calculator',
    name: 'Stressing Force & Elongation',
    description: 'Calculate expected strand elongation during prestressing',
    icon: <IoGitPullRequestOutline className="h-6 w-6 text-white" />,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    route: 'StressingCalculator',
  },
  {
    id: 'aggregate-gradation',
    name: 'Aggregate Gradation Analysis',
    description: 'Perform sieve analysis and verify ASTM C33 compliance',
    icon: <IoAnalyticsOutline className="h-6 w-6 text-white" />,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    route: 'AggregateGradation',
  },
  {
    id: 'quality-logs',
    name: 'Quality Logs',
    description: 'Track quality issues and production logs by department',
    icon: <IoClipboardOutline className="h-6 w-6 text-white" />,
    color: '#EC4899',
    bgColor: '#FCE7F3',
    route: 'QualityLogDashboard',
  },
  {
    id: 'daily-pour-schedule',
    name: 'Daily Pour Schedule',
    description: 'Manage concrete pours by department and form/bed',
    icon: <IoCalendarOutline className="h-6 w-6 text-white" />,
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    route: 'DailyPourSchedule',
  },
  {
    id: 'yard-maps',
    name: 'Yard Maps',
    description: 'Track and locate yarded pieces by department',
    icon: <IoMapOutline className="h-6 w-6 text-white" />,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    route: 'YardMap',
  },
  {
    id: 'product-library',
    name: 'Product Library',
    description: 'Manage product types and tolerance specifications',
    icon: <IoCubeOutline className="h-6 w-6 text-white" />,
    color: '#6366F1',
    bgColor: '#EEF2FF',
    route: 'ProductLibrary',
  },
  {
    id: 'project-library',
    name: 'Project Library',
    description: 'Manage projects, team assignments, and piece counts',
    icon: <IoFolderOpenOutline className="h-6 w-6 text-white" />,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    route: 'ProjectLibrary',
  },
  {
    id: 'aggregate-library',
    name: 'Aggregate Library',
    description: 'Comprehensive database of aggregate characteristics',
    icon: <IoFlaskOutline className="h-6 w-6 text-white" />,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    route: 'AggregateLibrary',
  },
  {
    id: 'admix-library',
    name: 'Admix Library',
    description: 'Manage admixture products and dosage information',
    icon: <IoWaterOutline className="h-6 w-6 text-white" />,
    color: '#0891B2',
    bgColor: '#ECFEFF',
    route: 'AdmixLibrary',
  },
  {
    id: 'contacts',
    name: 'Contacts',
    description: 'Manage vendors, suppliers, and sales representatives',
    icon: <IoPeopleOutline className="h-6 w-6 text-white" />,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    route: 'Contacts',
  },
  {
    id: 'strand-library',
    name: 'Strand Library',
    description: 'Manage strand definitions and material properties',
    icon: <IoLibraryOutline className="h-6 w-6 text-white" />,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    route: 'StrandLibrary',
  },
];

type SearchResults = {
  aggregates: AggregateLibraryItem[];
  admixes: AdmixLibraryItem[];
  contacts: ContactItem[];
};

export function DashboardScreen() {
  const push = useNavigationStore((state) => state.push);
  const getAllAggregates = useAggregateLibraryStore((state) => state.getAllAggregates);
  const getAllAdmixes = useAdmixLibraryStore((state) => state.getAllAdmixes);
  const getAllContacts = useContactsStore((state) => state.getAllContacts);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo<SearchResults>(() => {
    if (!searchQuery.trim()) {
      return { aggregates: [], admixes: [], contacts: [] };
    }
    const query = searchQuery.toLowerCase().trim();

    const aggregates = getAllAggregates()
      .filter((item) =>
        [item.name, item.source, item.type]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      );

    const admixes = getAllAdmixes()
      .filter((item) =>
        [item.name, item.manufacturer, item.class]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      );

    const contacts = getAllContacts()
      .filter((item) =>
        [item.name, item.company, item.role, item.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      );

    return { aggregates, admixes, contacts };
  }, [searchQuery, getAllAggregates, getAllAdmixes, getAllContacts]);

  const totalResults =
    searchResults.aggregates.length +
    searchResults.admixes.length +
    searchResults.contacts.length;

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <div className="flex items-center justify-between px-6 pb-6 pt-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
            Quality Toolkit
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Select a tool to get started</h1>
        </div>
        <Button variant="primary" size="lg" onClick={() => setShowSearch(true)}>
          <IoSearch className="h-5 w-5" />
          Global Search
        </Button>
      </div>

      <div className="px-6 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {toolCards.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => tool.route && push(tool.route, undefined)}
              disabled={!tool.route}
              className="group relative overflow-hidden rounded-3xl border border-transparent bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: tool.bgColor }}
            >
              <div className="flex flex-col gap-4 p-6 text-left">
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex rounded-xl p-3"
                    style={{ backgroundColor: tool.color }}
                  >
                    {tool.icon}
                  </div>
                  {tool.comingSoon && <Badge variant="warning">Coming soon</Badge>}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{tool.name}</h3>
                  <p className="text-sm leading-6 text-slate-600">{tool.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-500 p-2 text-white">
              <IoInformationCircleOutline className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-blue-900">More tools coming</h2>
              <p className="text-sm text-blue-700">
                We are continuously adding new quality control tools to help you work more efficiently. Check back for updates!
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowSearch(false)}
          />
          <div className="relative z-10 ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSearch(false)} className="rounded-full p-1 text-slate-600 hover:bg-slate-100">
                  <IoArrowBack className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-semibold text-slate-900">Global Search</h2>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3">
                <IoSearch className="h-5 w-5 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search across all libraries..."
                  autoFocus
                  className="flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                  type="search"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <IoCloseCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-slate-500">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!searchQuery.trim() ? (
                <div className="mt-24 flex flex-col items-center gap-3 text-center text-slate-500">
                  <IoSearch className="h-12 w-12 text-slate-300" />
                  <p className="text-base font-medium">Start typing to search</p>
                  <p className="text-sm">Search across Aggregate Library, Admix Library, and Contacts</p>
                </div>
              ) : totalResults === 0 ? (
                <div className="mt-24 flex flex-col items-center gap-3 text-center text-slate-500">
                  <IoSadOutline className="h-12 w-12 text-slate-300" />
                  <p className="text-base font-medium">No results found</p>
                  <p className="text-sm">Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchResults.aggregates.length > 0 && (
                    <section>
                      <header className="mb-3 flex items-center gap-2">
                        <IoFlaskOutline className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Aggregate Library ({searchResults.aggregates.length})
                        </h3>
                      </header>
                      <div className="space-y-2">
                        {searchResults.aggregates.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                            setShowSearch(false);
                            push('AggregateLibraryDetail', { aggregateId: item.id });
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            {item.source && (
                              <p className="text-xs text-slate-600">Source: {item.source}</p>
                            )}
                            {item.type && <Badge className="mt-2">{item.type}</Badge>}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {searchResults.admixes.length > 0 && (
                    <section>
                      <header className="mb-3 flex items-center gap-2">
                        <IoWaterOutline className="h-5 w-5 text-sky-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Admix Library ({searchResults.admixes.length})
                        </h3>
                      </header>
                      <div className="space-y-2">
                        {searchResults.admixes.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                            setShowSearch(false);
                            push('AdmixLibraryDetail', { admixId: item.id });
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-600">{item.manufacturer}</p>
                            <Badge className="mt-2" variant="outline">
                              {item.class}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {searchResults.contacts.length > 0 && (
                    <section>
                      <header className="mb-3 flex items-center gap-2">
                        <IoPeopleOutline className="h-5 w-5 text-violet-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Contacts ({searchResults.contacts.length})
                        </h3>
                      </header>
                      <div className="space-y-2">
                        {searchResults.contacts.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                            setShowSearch(false);
                            push('ContactDetail', { contactId: item.id });
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            {item.company && (
                              <p className="text-xs text-slate-600">{item.company}</p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                              {item.role && <span>{item.role}</span>}
                              {item.email && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                  <IoCheckmarkCircle className="h-3 w-3" /> {item.email}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
