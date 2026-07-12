export interface PartCardProps {
  name: string;
  desc?: string;
  /** weight cost, renders "WT +n" in pink */
  weight?: number;
  /** the command it grants, e.g. "grapple(dir)" */
  grants?: string;
  /** the coding idea it exercises, e.g. "coordinates" */
  idea?: string;
  status?: 'on-bot' | 'next' | 'locked';
  /** overrides the status chip text, e.g. "CLEAR CH 02" */
  lockReason?: string;
  style?: React.CSSProperties;
}
