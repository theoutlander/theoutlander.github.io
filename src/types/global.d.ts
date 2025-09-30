// Global type declarations

// Styled system module declarations
declare module '../../styled-system/css/index.mjs' {
  export function css(styles: any): string;
  export function cva(styles: any): (props?: any) => string;
  export function cx(...args: any[]): string;
  export function sva(styles: any): (props?: any) => string;
  export function container(options: any): string;
}

declare module '../../../styled-system/css/index.mjs' {
  export function css(styles: any): string;
  export function cva(styles: any): (props?: any) => string;
  export function cx(...args: any[]): string;
  export function sva(styles: any): (props?: any) => string;
  export function container(options: any): string;
}

declare module '../../styled-system/patterns/index.mjs' {
  export function flex(options: any): string;
  export function hstack(options: any): string;
  export function vstack(options: any): string;
  export function stack(options: any): string;
  export function grid(options: any): string;
  export function center(options: any): string;
  export function container(options: any): string;
  export function circle(options: any): string;
  export function square(options: any): string;
  export function spacer(options: any): string;
  export function divider(options: any): string;
  export function bleed(options: any): string;
  export function aspectRatio(options: any): string;
  export function box(options: any): string;
  export function float(options: any): string;
  export function cq(options: any): string;
  export function visuallyHidden(options: any): string;
  export function linkOverlay(options: any): string;
  export function wrap(options: any): string;
  export function gridItem(options: any): string;
}

declare module '../../../styled-system/patterns/index.mjs' {
  export function flex(options: any): string;
  export function hstack(options: any): string;
  export function vstack(options: any): string;
  export function stack(options: any): string;
  export function grid(options: any): string;
  export function center(options: any): string;
  export function container(options: any): string;
  export function circle(options: any): string;
  export function square(options: any): string;
  export function spacer(options: any): string;
  export function divider(options: any): string;
  export function bleed(options: any): string;
  export function aspectRatio(options: any): string;
  export function box(options: any): string;
  export function float(options: any): string;
  export function cq(options: any): string;
  export function visuallyHidden(options: any): string;
  export function linkOverlay(options: any): string;
  export function wrap(options: any): string;
  export function gridItem(options: any): string;
}

declare module '../../styled-system/css' {
  export * from '../../styled-system/css/index.mjs';
}

declare module '../../../styled-system/css' {
  export * from '../../../styled-system/css/index.mjs';
}
