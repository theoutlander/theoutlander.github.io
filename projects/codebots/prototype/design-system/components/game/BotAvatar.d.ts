/** @startingPoint section="CodeBots" subtitle="The bot mascot, paintable" viewport="220x180" */
export interface BotAvatarProps {
  /** hull + barrel paint (CSS color or --paint-* var), from bot.json paint.body */
  body?: string;
  /** dome paint, from bot.json paint.dome */
  dome?: string;
  eyes?: boolean;
  antenna?: boolean;
  /** rendered width px (base drawing is 150×106 + antenna overflow) */
  width?: number;
  /** rotation deg, 0 = facing east */
  facing?: number;
  style?: React.CSSProperties;
}
