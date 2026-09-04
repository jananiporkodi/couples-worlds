import "server-only";
import heicConvert from "heic-convert";
import exifr from "exifr";
import piexif from "piexifjs";

const HEIC_EXTENSIONS = [".heic", ".heif"];
const HEIC_MIME_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];

function looksLikeHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  if (HEIC_EXTENSIONS.some((ext) => name.endsWith(ext))) return true;
  if (file.type && HEIC_MIME_TYPES.includes(file.type.toLowerCase())) return true;
  return false;
}

function hasHeicMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer.toString("ascii", 4, 8) !== "ftyp") return false;
  const brand = buffer.toString("ascii", 8, 12).toLowerCase();
  const HEIC_BRANDS = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];
  return HEIC_BRANDS.includes(brand);
}

interface ConvertedFile {
  buffer: Buffer;
  contentType?: string;
  ext: string;
}

/**
 * Detects HEIC/HEIF photos (the default format for recent iPhone camera
 * shots) and converts them to a JPEG buffer, carrying over the original
 * capture date into the JPEG's EXIF so "memory_date" style features keep
 * working. Any file that isn't HEIC, or that fails conversion for any
 * reason, is returned untouched so uploads never hard-fail on this step.
 */
export async function convertHeicIfNeeded(file: File): Promise<ConvertedFile> {
  const originalExt = file.name.split(".").pop() || "bin";
  const originalBuffer = Buffer.from(await file.arrayBuffer());

  const heicSuspected = looksLikeHeic(file) || hasHeicMagicBytes(originalBuffer);
  if (!heicSuspected) {
    return { buffer: originalBuffer, contentType: file.type || undefined, ext: originalExt };
  }

  try {
    const exif = await exifr
      .parse(originalBuffer, { pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"] })
      .catch(() => null);

    const jpegBuffer = (await heicConvert({ buffer: originalBuffer, format: "JPEG", quality: 0.92 })) as Buffer;

    const captureDate: Date | undefined = exif?.DateTimeOriginal || exif?.CreateDate || exif?.ModifyDate;
    const finalBuffer = captureDate ? injectCaptureDate(jpegBuffer, captureDate) : jpegBuffer;

    return { buffer: finalBuffer, contentType: "image/jpeg", ext: "jpg" };
  } catch (err) {
    console.error("HEIC conversion failed, uploading the original file instead:", err);
    return { buffer: originalBuffer, contentType: file.type || undefined, ext: originalExt };
  }
}

function formatExifDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function injectCaptureDate(jpegBuffer: Buffer, date: Date): Buffer {
  try {
    const jpegBase64 = "data:image/jpeg;base64," + jpegBuffer.toString("base64");
    const exifDict = piexif.load(jpegBase64);
    const dateStr = formatExifDate(date);
    exifDict["Exif"] = exifDict["Exif"] || {};
    exifDict["Exif"][piexif.ExifIFD.DateTimeOriginal] = dateStr;
    exifDict["0th"] = exifDict["0th"] || {};
    exifDict["0th"][piexif.ImageIFD.DateTime] = dateStr;
    const exifBytes = piexif.dump(exifDict);
    const newJpegBase64 = piexif.insert(exifBytes, jpegBase64);
    return Buffer.from(newJpegBase64.replace(/^data:image\/jpeg;base64,/, ""), "base64");
  } catch (err) {
    console.error("Failed to write EXIF date into converted JPEG:", err);
    return jpegBuffer;
  }
}
