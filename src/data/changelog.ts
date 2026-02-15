import { Changelog } from '@/types/changelog';

/**
 * Changelog data for the application.
 * Add new entries at the TOP of the array.
 * Follow the format: version, date, title, description, and categorized changes.
 */
export const changelog: Changelog = [
    {
        version: "0.6.0",
        date: "Feb 13, 2026",
        title: "Stability Improvements & Diagram Fixes",
        description: "Addressed critical issues in RPC handling and diagram rendering to ensure smoother system operation.",
        improvements: [
            "Enhanced error handling for RPC methods to prevent registration failures."
        ],
        fixes: [
            "Resolved syntax error in RPC handler registration causing '}' expected errors.",
            "Fixed Mermaid diagram rendering issues on documentation pages.",
            "Corrected duplicate transcript display bugs in the Talk interface.",
            "Fixed visual presentation of user and AI speaking indicators."
        ],
        patches: []
    },
    {
        version: "0.5.0",
        date: "Feb 12, 2026",
        title: "Interactive Classroom & Game Experiences",
        description: "Introduced the 'Family Feud' style game and significantly overhauled the visual experience of the Talk Page.",
        improvements: [
            "Implemented 'Family Feud' game logic with team scoring (Alpha, Beta, Gamma) and board display.",
            "Overhauled Talk Page UI with dynamic, directional matrix animations (right-to-left for AI, left-to-right for user).",
            "Integrated AI agent communication for the Pi Tutor system using LiveKit.",
            "Added enhanced background glow effects that respond to speaker activity.",
            "Implemented 'perform_rpc' calls for UI interactions like highlighting text and focusing students."
        ],
        fixes: [
            "Corrected data mismatches between agent student matrix and frontend seating matrix.",
            "Fixed environment variable configuration for AI services (OPENAI_API_KEY).",
            "Resolved potential infinite loops in RPC handler setup."
        ],
        patches: []
    },
    {
        version: "0.4.0",
        date: "Feb 05, 2026",
        title: "Build System & Authentication UI Refinement",
        description: "Focused on stabilizing the build process for production and refining the authentication user interface.",
        improvements: [
            "Redesigned sign-up and login pages for better visual consistency with landing page components.",
            "Standardized import casing to prevent build errors across different environments.",
            "Updated changelog tracking to accurately reflect build system fixes."
        ],
        fixes: [
            "Resolved 'module not found' errors in Vercel production builds.",
            "Fixed file casing issues in component imports (e.g., Logo component).",
            "Addressed circular reference errors in Supabase migrations."
        ],
        patches: []
    },
    {
        version: "0.3.0",
        date: "Feb 04, 2026",
        title: "Planning Board & Profile Customization",
        description: "Enhanced project management capabilities and user profile customization options.",
        improvements: [
            "Added drag-and-drop support for planning board cards using @dnd-kit.",
            "Implemented 'Create Column' functionality for Kanban boards.",
            "Refined profile link management with drag-and-drop reordering.",
            "Updated typography to 'Inter Tight' for improved readability.",
            "Simplified profile editing with inline editing features."
        ],
        fixes: [
            "Resolved Page overflow issues on the planning board.",
            "Fixed TypeScript errors in Link component usage.",
            "Addressed contrast issues in specific theme templates."
        ],
        patches: []
    },
    {
        version: "0.1.0",
        date: "Jan 16, 2026",
        title: "MVP Release",
        description: "Initial release of the Content Creator OS with core project management and collaboration features.",
        improvements: [
            "Established core project structure and UI component library.",
            "Implemented essential features: Secrets, Links, Tasks, Notes, Versioning.",
            "Set up database schema and initial migrations for collaboration tools.",
            "Created responsive dashboard layouts and project navigation."
        ],
        fixes: [],
        patches: []
    }
];