declare module "piexifjs" {
  interface ExifDict {
    [ifd: string]: Record<string, unknown>;
  }
  interface Piexif {
    load(jpegBase64: string): ExifDict;
    dump(exifDict: ExifDict): string;
    insert(exifBytes: string, jpegBase64: string): string;
    ExifIFD: Record<string, number>;
    ImageIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  }
  const piexif: Piexif;
  export default piexif;
}
