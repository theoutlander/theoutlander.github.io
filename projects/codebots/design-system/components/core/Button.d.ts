export interface ButtonProps {
  /** primary = amber fill (one per view) · ghost = outlined · quiet = dashed helper */
  variant?: 'primary' | 'ghost' | 'quiet';
  size?: 'md' | 'sm';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
