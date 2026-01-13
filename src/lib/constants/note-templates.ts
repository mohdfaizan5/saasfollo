/**
 * Note templates for quick note creation
 */
export const NOTE_TEMPLATES = {
    icp: {
        title: 'Ideal Customer Profile (ICP)',
        content: `# Ideal Customer Profile

## Target Role
- Who is your ideal customer?
- What is their job title/role?

## Core Pain
- What problem are they trying to solve?
- How painful is this problem?

## Current Alternatives
- What do they currently use?
- Why is it not working for them?

## Why They Will Switch
- What makes your solution better?
- What's the compelling reason to change?

## Notes
- Additional insights about your ICP
`,
    },
    blank: {
        title: 'Untitled Note',
        content: '',
    },
} as const;

export type NoteTemplateKey = keyof typeof NOTE_TEMPLATES;
