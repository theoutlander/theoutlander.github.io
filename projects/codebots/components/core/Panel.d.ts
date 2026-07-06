export interface PanelProps {
  /** ALL-CAPS section label rendered at top (e.g. "BRIEFING") */
  label?: string;
  labelColor?: string;
  /** amber border + glow — the spotlighted card */
  active?: boolean;
  /** dashed border + reduced opacity — pair with a reason Chip */
  locked?: boolean;
  /** use --surface-deep instead of --surface-panel */
  deep?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
