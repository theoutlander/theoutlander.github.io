export interface StarsProps {
  earned?: number;
  total?: number;
  /** append "13/15" count */
  showCount?: boolean;
  /** glyph px size, default 16 */
  size?: number;
  style?: React.CSSProperties;
}
