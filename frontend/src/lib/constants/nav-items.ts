import type { NavItem } from '@/lib/types';
import { m } from '@/paraglide/messages';

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: m.nav_ledger(), icon: 'i-lucide-align-left' },
  { to: '/insights', label: m.nav_insights(), icon: 'i-lucide-bar-chart-3' },
  { to: '/budgets', label: m.nav_budgets(), icon: 'i-lucide-circle' },
  { to: '/settings', label: m.nav_settings(), icon: 'i-lucide-settings' },
];
