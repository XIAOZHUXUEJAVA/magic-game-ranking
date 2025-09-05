declare module "html-to-image" {
  export interface Options {
    quality?: number;
    width?: number;
    height?: number;
    backgroundColor?: string;
    pixelRatio?: number;
    skipFonts?: boolean;
    preferredFontFormat?: "woff" | "woff2" | "truetype" | "opentype";
    style?: Record<string, string>;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  export function toCanvas(
    node: HTMLElement,
    options?: Options
  ): Promise<HTMLCanvasElement>;
  export function toPixelData(
    node: HTMLElement,
    options?: Options
  ): Promise<Uint8ClampedArray>;
}
