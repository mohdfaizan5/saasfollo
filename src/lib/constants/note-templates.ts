/**
 * Note templates for quick note creation
 */
export const NOTE_TEMPLATES = {
    icp: {
        title: 'Ideal Customer Profile',
        description: 'Define your target audience',
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
        title: 'Blank Note',
        description: 'Start from scratch',
        content: '',
    },
    meetingNotes: {
        title: 'Meeting Notes',
        description: 'Structured meeting template',
        content: `# Meeting Notes

**Date:** 
**Attendees:** 

## Agenda
1. 

## Discussion Points


## Action Items
- [ ] 

## Next Steps

`,
    },
    productRequirements: {
        title: 'Product Requirements',
        description: 'PRD template for features',
        content: `# Product Requirements Document

## Overview
Brief description of the feature/product.

## Problem Statement
What problem are we solving?

## Goals & Success Metrics
- Goal 1:
- Metric: 

## User Stories
As a [user], I want to [action] so that [benefit].

## Requirements

### Must Have
- 

### Nice to Have
- 

## Technical Considerations


## Timeline

`,
    },
    brainstorm: {
        title: 'Brainstorm',
        description: 'Capture ideas freely',
        content: `# Brainstorm Session

**Topic:** 
**Date:** 

## Ideas
- 

## Promising Concepts


## Next Actions

`,
    },
} as const;

export type NoteTemplateKey = keyof typeof NOTE_TEMPLATES;
