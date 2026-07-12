export interface StatusChipProps {
  /** every status is also readable in code via status() */
  status?: 'on-fire' | 'frozen' | 'tangled' | 'soaked' | 'gusted' | 'recharging' | 'rebooting';
  /** blinking dot, default true */
  blink?: boolean;
  style?: React.CSSProperties;
}
