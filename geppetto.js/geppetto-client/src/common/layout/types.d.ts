export interface BorderNode {
    type: string;
    location: string;
    children: BorderNode[];
    config?: {
        isMinimizedPanel?: boolean;
    };

    getId(): string;

    getConfig(): any;
}