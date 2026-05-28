import {
  FileCheck2, HardHat, Receipt, Scale, Ruler, BarChart3, FolderOpen,
  type LucideIcon,
} from 'lucide-react'

export interface Category {
  value: string
  label: string
  description: string
  icon: LucideIcon
  textColor: string
  bgColor: string
  borderColor: string
  activeBorder: string
  activeBg: string
  activeText: string
}

export const CATEGORIES: Category[] = [
  {
    value: 'contracts',
    label: 'Contracts',
    description: 'Construction, supplier & service agreements',
    icon: FileCheck2,
    textColor:    'text-blue-600',
    bgColor:      'bg-blue-50',
    borderColor:  'border-blue-200',
    activeBorder: 'border-blue-500',
    activeBg:     'bg-blue-50',
    activeText:   'text-blue-700',
  },
  {
    value: 'site-reports',
    label: 'Site Reports',
    description: 'Progress, inspection & survey reports',
    icon: HardHat,
    textColor:    'text-amber-600',
    bgColor:      'bg-amber-50',
    borderColor:  'border-amber-200',
    activeBorder: 'border-amber-500',
    activeBg:     'bg-amber-50',
    activeText:   'text-amber-700',
  },
  {
    value: 'finance',
    label: 'Finance',
    description: 'Invoices, budgets & payment schedules',
    icon: Receipt,
    textColor:    'text-green-600',
    bgColor:      'bg-green-50',
    borderColor:  'border-green-200',
    activeBorder: 'border-green-500',
    activeBg:     'bg-green-50',
    activeText:   'text-green-700',
  },
  {
    value: 'legal',
    label: 'Legal',
    description: 'Permits, title deeds & compliance docs',
    icon: Scale,
    textColor:    'text-purple-600',
    bgColor:      'bg-purple-50',
    borderColor:  'border-purple-200',
    activeBorder: 'border-purple-500',
    activeBg:     'bg-purple-50',
    activeText:   'text-purple-700',
  },
  {
    value: 'design-plans',
    label: 'Design & Plans',
    description: 'Architectural drawings & specifications',
    icon: Ruler,
    textColor:    'text-cyan-600',
    bgColor:      'bg-cyan-50',
    borderColor:  'border-cyan-200',
    activeBorder: 'border-cyan-500',
    activeBg:     'bg-cyan-50',
    activeText:   'text-cyan-700',
  },
  {
    value: 'board-reports',
    label: 'Board Reports',
    description: 'Executive briefings & board minutes',
    icon: BarChart3,
    textColor:    'text-indigo-600',
    bgColor:      'bg-indigo-50',
    borderColor:  'border-indigo-200',
    activeBorder: 'border-indigo-500',
    activeBg:     'bg-indigo-50',
    activeText:   'text-indigo-700',
  },
  {
    value: 'general',
    label: 'General',
    description: 'Other workspace documents',
    icon: FolderOpen,
    textColor:    'text-gray-500',
    bgColor:      'bg-gray-50',
    borderColor:  'border-gray-200',
    activeBorder: 'border-gray-400',
    activeBg:     'bg-gray-50',
    activeText:   'text-gray-700',
  },
]

export const SENSITIVITIES = [
  { value: 'public',       label: 'Public',        desc: 'All workspace members' },
  { value: 'internal',     label: 'Internal',      desc: 'Team access (default)' },
  { value: 'confidential', label: 'Confidential',  desc: 'Senior members only' },
  { value: 'restricted',   label: 'Restricted',    desc: 'Admins only' },
]

export function getCategoryByValue(value: string | null | undefined): Category | undefined {
  return CATEGORIES.find(c => c.value === value)
}
