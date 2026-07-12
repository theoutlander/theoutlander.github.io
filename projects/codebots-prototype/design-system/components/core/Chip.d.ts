export interface ChipProps {
  /** amber=action/reward · cyan=info/next · green=ready/clear · red=error · pink=hazard · dim=neutral */
  color?: 'amber' | 'cyan' | 'green' | 'red' | 'pink' | 'dim';
  /** dashed border = locked / future / hint */
  dashed?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
