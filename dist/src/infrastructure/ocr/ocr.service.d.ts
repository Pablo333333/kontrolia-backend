export declare class OcrService {
    private readonly logger;
    extractText(filePath: string): Promise<string>;
    extractTextFromUrl(url: string): Promise<string>;
}
