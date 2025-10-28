'use client';

import type { FC } from 'react';

export interface JobAutocompleteInputProps {
  jobNumber: string;
  jobName: string;
  onJobNumberChange: (value: string) => void;
  onJobNameChange: (value: string) => void;
  onJobSelect?: (jobNumber: string, jobName: string) => void;
  disabled?: boolean;
  jobNumberLabel?: string;
  jobNameLabel?: string;
  required?: boolean;
  theme?: 'light' | 'dark';
  enableCreatePrompt?: boolean;
}

/**
 * Mobile-only job autocomplete component.
 * The web application currently omits this behaviour.
 */
const JobAutocompleteInput: FC<JobAutocompleteInputProps> = () => null;

export default JobAutocompleteInput;
