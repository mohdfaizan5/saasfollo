export interface ChangelogEntry {
    version: string;
    date: string; // Format: "Jan 24, 2026" or ISO date
    title: string;
    description: string;
    improvements: string[];
    fixes: string[];
    patches: string[];
}

export type Changelog = ChangelogEntry[];
