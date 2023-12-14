
export class ArtMaths {
	static pixelToColor(imageData: Uint8ClampedArray) {
		const pixel = new DataView(imageData.buffer);
		const pixelToHex = (idx: number) => ('00' + (pixel.getUint8(idx).toString(16))).slice(-2);
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
			a: alpha
		}
	}
}