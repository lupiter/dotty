import { PALETTE } from "../modal/palette-limit";

export class Color {
  static fromHex(hex: string): Color {
    // Validate hex format
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(hex)) {
      throw new Error('Invalid hex color format');
    }

    // Handle shorthand hex (#RGB -> #RRGGBB)
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return new Color(r, g, b, 255);
  }

  static fromHexWithAlpha(hex: string): Color {
    // Validate hex+alpha format
    if (!/^#[A-Fa-f0-9]{8}$/.test(hex)) {
      throw new Error('Invalid hex color with alpha format');
    }

    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 24) & 255;
    const g = (bigint >> 16) & 255;
    const b = (bigint >> 8) & 255;
    const a = bigint & 255;
    return new Color(r, g, b, a);
  }

  static fromPixel(imageData: Uint8ClampedArray): Color {
    // Validate pixel array
    if (imageData.length < 4) {
      throw new Error('Invalid pixel data: requires at least 4 components (RGBA)');
    }

    return new Color(imageData[0], imageData[1], imageData[2], imageData[3]);
  }

  constructor(
    r: number,
    g: number,
    b: number,
    a: number
  ) {
    // Clamp values to 0-255 range
    this.r = Math.min(255, Math.max(0, Math.round(r)));
    this.g = Math.min(255, Math.max(0, Math.round(g)));
    this.b = Math.min(255, Math.max(0, Math.round(b)));
    this.a = Math.min(255, Math.max(0, Math.round(a)));
  }

  // Make r, g, b, a readonly after clamping in constructor
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  static roundTo(component: number, possibilities: number[]): number {
    return possibilities.reduce((prev, curr) => {
      if (prev === undefined) {
        return curr;
      }
      if (Math.abs(curr - component) < Math.abs(prev - component)) {
        return curr;
      }
      return prev;
    });
  }

  static roundToWeb(component: number): number {
    if (component < 0x33 - component) {
      return 0;
    } else if (0x33 - component < 0x66 - component) {
      return 0x33;
    } else if (0x66 - component < 0x99 - component) {
      return 0x66;
    } else if (0x99 - component < 0xcc - component) {
      return 0x99;
    } else if (0xcc - component < 0xff - component) {
      return 0xcc;
    } else {
      return 0xff;
    }
  }

  static toHex(d: number): string {
    return Number(d).toString(16).padStart(2, "0");
  }

  cga(): Color {
    const cgaFragments = [0x00, 0x55, 0xaa, 0xff];
    const r = Color.roundTo(this.r, cgaFragments);
    let greenOptions;
    if (r === 0x00) {
      greenOptions = [0x00, 0xaa];
    } else if (r === 0x55) {
      greenOptions = [0x55, 0xff];
    } else if (r === 0xaa) {
      greenOptions = [0x00, 0x55, 0xaa];
    } else {
      greenOptions = [0x55, 0xff];
    }
    const g = Color.roundTo(this.g, greenOptions);
    let blueOptions;
    if (r === 0x00) {
      blueOptions = [0x00, 0xaa];
    } else if (r === 0x55) {
      blueOptions = [0x55, 0xff];
    } else if (r === 0xaa) {
      if (g === 0x00) {
        blueOptions = [0x00, 0xaa];
      } else if (g === 0x55) {
        return new Color(r, g, 0x00, 255);
      } else {
        return new Color(r, g, 0xaa, 255);
      }
    } else {
      blueOptions = [0x55, 0xff];
    }
    const b = Color.roundTo(this.b, blueOptions);
    return new Color(r, g, b, 255);
  }

  web(): Color {
    const webFragments = [0x00, 0x33, 0x66, 0x99, 0xcc, 0xff];
    let r = Color.roundTo(this.r, webFragments);
    let g = Color.roundTo(this.g, webFragments);
    let b = Color.roundTo(this.b, webFragments);
    let a = Color.roundTo(this.a, webFragments);
    return new Color(r, g, b, a);
  }

  gbc() {
    let r = Math.round(this.r / 5) * 5;
    let g = Math.round(this.g / 5) * 5;
    let b = Math.round(this.b / 5) * 5;
    let a = Color.roundTo(this.a, [0, 255]);
    return new Color(r, g, b, a);
  }

  limit(palette: PALETTE): Color {
    switch (palette) {
      case PALETTE.CGA:
        return this.cga();
      case PALETTE.WEB:
        return this.web();
      case PALETTE.GBC:
        return this.gbc();
      case PALETTE.FULL:
        return this;
    }
  }

  hsv(): { h: number; s: number; v: number } {
    const maxC = Math.max(this.r, this.g, this.b);
    const minC = Math.min(this.r, this.g, this.b);
    if (minC === maxC) {
      return { h: 0, s: 0, v: maxC };
    }
    const s = (maxC - minC) / maxC;
    const rc = (maxC - this.r) / (maxC - minC);
    const gc = (maxC - this.g) / (maxC - minC);
    const bc = (maxC - this.b) / (maxC - minC);
    let h = 4.0 + gc - rc;
    if (this.r === maxC) {
      h = 0.0 + bc - gc;
    } else if (this.g === maxC) {
      h = 2.0 + rc - bc;
    }
    h = (h / 6.0) % 1.0;
    return { h: h * 360, s: s * 100, v: maxC * 100 };
  }

  get hex(): string {
    return (
      "#" + Color.toHex(this.r) + Color.toHex(this.g) + Color.toHex(this.b)
    );
  }

  get hexWithAlpha(): string {
    return this.hex + Color.toHex(this.a);
  }

  static sort(a: Color, b: Color): number {
    const aHSV = a.hsv();
    const bHSV = b.hsv();

    if (aHSV.h !== bHSV.h) {
      return aHSV.h - bHSV.h;
    } else if (aHSV.s !== bHSV.s) {
      return aHSV.s - bHSV.s;
    }
    return aHSV.v - bHSV.v;
  }

  static includes(list: Color[], value: Color): boolean {
    const match = list.find((col) => value.hex === col.hex);
    return match !== undefined;
  }

  static dedupe(list: Color[]): Color[] {
    const unique: Color[] = [];
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      if (!Color.includes(unique, current)) {
        unique.push(current);
      }
    }
    return unique;
  }
}
