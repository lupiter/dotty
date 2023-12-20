export class ArtMaths {
  static pixelToColor(imageData: Uint8ClampedArray) {
    const pixel = new DataView(imageData.buffer);
    const pixelToHex = (idx: number) =>
      ("00" + pixel.getUint8(idx).toString(16)).slice(-2);
    return "#" + pixelToHex(0) + pixelToHex(1) + pixelToHex(2) + pixelToHex(3);
  }

  static colorToPixel(color: string) {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);
    const alpha = Number.parseInt(color.slice(7), 16);
    return {
      r: red,
      g: green,
      b: blue,
      a: alpha,
    };
  }

  static colorToHSV(color: string) {
    const rgb = ArtMaths.colorToPixel(color);
    const maxC = Math.max(rgb.r, rgb.g, rgb.b);
    const minC = Math.min(rgb.r, rgb.g, rgb.b);
    if (minC === maxC) {
      return { h: 0, s: 0, v: maxC };
    }
    const s = (maxC - minC) / maxC;
    const rc = (maxC - rgb.r) / (maxC - minC);
    const gc = (maxC - rgb.g) / (maxC - minC);
    const bc = (maxC - rgb.b) / (maxC - minC);
    let h = 4.0 + gc - rc;
    if (rgb.r === maxC) {
      h = 0.0 + bc - gc;
    } else if (rgb.g === maxC) {
      h = 2.0 + rc - bc;
    }
    h = (h / 6.0) % 1.0;
    return { h: h * 360, s: s * 100, v: maxC * 100 };
  }

  static colorSort(a: string, b: string): number {
    const aHSV = ArtMaths.colorToHSV(a);
    const bHSV = ArtMaths.colorToHSV(b);

		if (aHSV.h !== bHSV.h) {
			return aHSV.h - bHSV.h;
		} else if (aHSV.s !== bHSV.s) {
			return aHSV.s - bHSV.s;
		}
		return aHSV.v - bHSV.v;
  }
}
