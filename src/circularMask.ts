import { P5CanvasInstance } from "@p5-wrapper/react";
import * as P5 from "p5";

export function circularMask(p5: P5CanvasInstance, img: P5.Image): any {
    const d = img.width;
    let mask = p5.createGraphics(d, d);
    mask.circle(d / 2, d / 2, d);
    let maskImg = p5.createImage(d, d);
    let imgSmall = p5.createImage(d, d);
    imgSmall.copy(img, 0, 0, d, d, 0, 0, d, d);
    maskImg.copy(mask, 0, 0, d, d, 0, 0, d, d);
    imgSmall.mask(maskImg);
    return imgSmall;
}
