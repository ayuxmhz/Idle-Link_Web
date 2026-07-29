import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// jsdom has no real layout engine or canvas, so react-easy-crop's actual
// drag/zoom interaction never fires its onCropComplete callback in tests.
// Stub it to fire immediately with a fixed crop area so the "Apply" button
// in ImageCropModal becomes enabled and the confirm flow can be exercised.
function MockCropper({ onCropComplete }: { onCropComplete: (a: unknown, p: unknown) => void }) {
    React.useEffect(() => {
        onCropComplete({}, { x: 0, y: 0, width: 100, height: 100 });
    }, [onCropComplete]);
    return null;
}

vi.mock("react-easy-crop", () => ({
    default: MockCropper,
}));

// jsdom doesn't implement canvas rendering, so the real cropping logic
// (which draws to a <canvas> and reads it back via toBlob) has nothing to
// operate on. Stub it to just return the original file's bytes as-is.
vi.mock("@/lib/cropImage", () => ({
    getCroppedImageFile: vi.fn(async (_imageSrc: string, _pixelCrop: unknown, fileName: string, mimeType?: string) =>
        new File(["cropped"], fileName, { type: mimeType || "image/png" })
    ),
}));
