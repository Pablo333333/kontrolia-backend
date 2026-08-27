export declare class AiService {
    private openai;
    constructor();
    summarize(text: string): Promise<string>;
    classifyPriority(text: string): Promise<'ALTA' | 'BAJA'>;
    draftFormalDocument(baseDraft: string, metadata: Record<string, unknown>): Promise<string>;
    expandSearchQuery(query: string): Promise<string[]>;
    private fallbackExpand;
}
