export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Crops `imageSrc` down to `pixelCrop` and returns it as a File, preserving
// the original mime type (falls back to PNG if none was given, e.g. for
// object URLs without a resolvable type).
export async function getCroppedImageFile(
    imageSrc: string,
    pixelCrop: PixelCrop,
    fileName: string,
    mimeType?: string
): Promise<File> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    const type = mimeType || "image/png";
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Failed to crop image"));
                return;
            }
            resolve(new File([blob], fileName, { type }));
        }, type);
    });
}
