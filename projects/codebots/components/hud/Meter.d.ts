export interface MeterProps {
  /** ALL-CAPS label, e.g. "ARMOR" */
  label?: string;
  /** 0–100 */
  value?: number;
  /** omit to auto-color by value (green > 60, amber > 30, red below) */
  color?: 'green' | 'amber' | 'cyan' | 'red';
  showValue?: boolean;
  /** value suffix, default "%" */
  suffix?: string;
  style?: React.CSSProperties;
}
