import { Changelog } from '@/types/changelog';

/**
 * Changelog data for the application.
 * Add new entries at the TOP of the array.
 * Follow the format: version, date, title, description, and categorized changes.
 */
export const changelog: Changelog = [
    {
        version: "1.6.6",
        date: "Jul 24, 2026",
        title: "Mobile Layout Fixes: Dashboard, Build, Sidebar, Filters",
        description: "A round of mobile-layout fixes across the dashboard, Build page, filters, and sidebar navigation.",
        improvements: [
            "Build page: the Kanban/To-do view toggle now sits on its own row below the header instead of crowding the New Task button, and the decorative header icon is hidden on small screens.",
            "Filter dropdowns (category/version/assignee) use smaller text and a narrower trigger on mobile so labels fit on one line; long category names in the dropdown list now wrap instead of being cut off."
        ],
        fixes: [
            "Fixed the dashboard's stats grid, Working On/Growth row, and Growth Pulse section: several cards had no responsive breakpoints at all (fixed 12-column spans, e.g. the Active Version card), so they rendered as unusable slivers on mobile.",
            "Fixed the dashboard's progress gauge being cut off: its wrapper forced a 400px-tall centering box while the card only showed the top 208px, clipping the percentage and label. Both are now sized to actually fit the gauge.",
            "Fixed the mobile sidebar not closing after tapping a navigation link — it navigated correctly but the slide-in menu stayed open over the new page."
        ],
        patches: []
    },
    {
        version: "1.6.5",
        date: "Jul 24, 2026",
        title: "Editor: Visible Image Resize Handles",
        description: "Image resize handles now actually appear on hover — the drag logic worked, but the handles had no visual styling at all.",
        fixes: [
            "Fixed image resize handles being invisible: the resize feature was fully wired up (drag, persistence) but shipped with zero visual styling, so there was nothing to see or click. Corner dots and edge cursors now appear on hover and stay visible mid-drag."
        ],
        improvements: [],
        patches: []
    },
    {
        version: "1.6.4",
        date: "Jul 24, 2026",
        title: "Editor: Image Resize Now Persists",
        description: "Resized images in notes and task descriptions now keep their size after saving and reopening; also switched to Tiptap's official resize handles for a smoother drag experience.",
        improvements: [
            "Switched the editor's image resizing to Tiptap's built-in resize handles (all 8 edges/corners, aspect-ratio preserved) instead of a custom single-corner handle."
        ],
        fixes: [
            "Fixed resized images reverting to their original size after saving and reopening a note or task: the editor's markdown format has no native way to store image width/height, so it was silently discarding the size on every save. The size is now encoded alongside the image and restored on load."
        ],
        patches: [
            "Card preview snippets no longer leak the hidden size marker used to persist image dimensions."
        ]
    },
    {
        version: "1.6.3",
        date: "Jul 24, 2026",
        title: "Notes: Real Masonry Layout",
        description: "Replaced the hand-rolled CSS-columns masonry grid with react-masonry-css for both the notes grid and the Version PRDs grid.",
        improvements: [
            "Notes and Version PRD cards now lay out via react-masonry-css instead of hand-rolled CSS columns, for more predictable, correctly-packed masonry columns at every breakpoint."
        ],
        fixes: [],
        patches: []
    },
    {
        version: "1.6.2",
        date: "Jul 24, 2026",
        title: "Notes Fixes, Notion-Style Editor, and Mobile Fixes",
        description: "Fixed the broken image upload callback, restored the notes masonry grid, gave the editor a Notion-style '/' command menu, and fixed mobile layout breakage on the landing page and blog.",
        improvements: [
            "Editor now supports a Notion-style '/' command menu: type '/' to insert headings, lists, a to-do list, quote, code block, table, image, or a divider, with keyboard navigation and search-as-you-type.",
            "The editor's empty-state placeholder now actually renders (it was silently non-functional before).",
            "The full-page notes/PRD editor no longer caps itself to a small internal scroll box — it grows naturally and the page scrolls, like any normal document.",
            "Notes preview snippets now correctly strip markdown syntax (checkboxes, tables, headings, etc.) instead of showing raw formatting characters."
        ],
        fixes: [
            "Fixed image uploads across notes, task descriptions, and project images: our own auth middleware was redirecting UploadThing's server-to-server upload-complete callback to the login page, silently breaking every upload.",
            "Fixed the notes grid: it was using a CSS class that didn't exist, so notes weren't laid out as a masonry grid at all.",
            "Fixed the landing page hero headline and the blog index page overflowing/clipping on mobile screens due to fixed pixel widths."
        ],
        patches: []
    },
    {
        version: "1.6.1",
        date: "Jul 24, 2026",
        title: "Image Uploads Moved to UploadThing",
        description: "Image uploads for notes, task descriptions, and project images now go through UploadThing for faster, more reliable hosting.",
        improvements: [
            "Note and task-description images (drag/drop, paste, or toolbar) now upload via UploadThing.",
            "Project images ('avatars') on the new-project flow and project settings now upload via UploadThing."
        ],
        fixes: [
            "Fixed unreliable image uploads in the notes editor by routing them through a dedicated upload service."
        ],
        patches: [
            "Added an /api/uploadthing route and a shared upload endpoint with server-side auth for all image uploads."
        ]
    },
    {
        version: "1.6.0",
        date: "Jul 24, 2026",
        title: "Build: Rich-Text Task Descriptions",
        description: "Task descriptions now use a proper rich-text editor with formatting, checklists, code, tables, and image uploads — a big step up from the plain text box.",
        improvements: [
            "Replaced the plain description box (in both the New Task dialog and the task detail view) with a rich-text editor built on Tiptap.",
            "Supports headings, bold/italic/strike, bullet/numbered/checklist lists, blockquotes, links, and tables.",
            "Code blocks now have syntax highlighting, and Markdown shortcuts (like '# ', '- ', '> ', and ```) work while typing.",
            "Images can be added by drag-and-drop, paste, or the toolbar; they upload to storage and can be resized by dragging a corner handle.",
            "Kanban cards show a clean plain-text snippet of rich descriptions; older plain-text descriptions keep working unchanged."
        ],
        fixes: [],
        patches: [
            "Added a dedicated public 'task-media' storage bucket and an authorized upload action for task description images."
        ]
    },
    {
        version: "1.5.5",
        date: "Jul 24, 2026",
        title: "Build: Nicer Inline Task Composer & Animated Progress",
        description: "Refined the in-column 'add task' composer and gave the Build progress bar a satisfying reveal animation on load.",
        improvements: [
            "Reworked the in-column task composer: the title is now a multi-line field, priority uses on-brand colored segments, and priority/category fill the card width instead of cramped fixed-width dropdowns.",
            "The Build progress bar and its percentage now animate up from zero when the page loads (respecting reduced-motion preferences)."
        ],
        fixes: [],
        patches: [
            "Added an inline spinner and disabled state to the in-column 'Add' button while a task is being created."
        ]
    },
    {
        version: "1.5.4",
        date: "Jul 24, 2026",
        title: "Kanban: Collapsible Columns",
        description: "Build board columns can now be collapsed into a compact vertical strip, keeping the task count and title visible while freeing up horizontal space.",
        improvements: [
            "Added a collapse toggle to each Kanban column that shrinks it into a narrow vertical strip showing the task count and column title.",
            "Collapsed columns remain a valid drop target, so dragging a task onto a collapsed strip still moves it into that column.",
            "Clicking a collapsed column strip expands it back to the full view.",
            "Collapsed state now persists across reloads and navigation via local storage, so a column stays collapsed until it's explicitly expanded again."
        ],
        fixes: [],
        patches: []
    },
    {
        version: "1.5.3",
        date: "Apr 15, 2026",
        title: "Roadmaps: Editable PRD Flow, Safer Navigation, and Sidebar Updates",
        description: "Improved roadmap usability with a cleaner save flow, unsaved-change protection on navigation, and direct Roadmaps access in project navigation.",
        improvements: [
            "Added a dedicated 'Roadmaps' item in project navigation that routes to the roadmap experience and supports the /version/roadmap path alias.",
            "Simplified roadmap editing UX by keeping a single top-level 'Save all changes' action instead of repeated inline save-all prompts.",
            "Polished project sidebar scrolling by hiding visible native scrollbar chrome while preserving scroll behavior."
        ],
        fixes: [
            "Fixed roadmap state synchronization that could trigger a 'Maximum update depth exceeded' render loop.",
            "Added unsaved-change confirmation when users attempt route changes via links/sidebar actions before saving roadmap edits.",
            "Added browser close/refresh warning behavior for unsaved roadmap changes to prevent accidental data loss."
        ],
        patches: [
            "Stabilized roadmap version derivation and state guards so local draft maps only update when values actually change.",
            "Refined timeline save-all visibility rules to render only when there are unsaved changes or an active save operation.",
            "Cleaned roadmap timeline markup by removing deprecated commented layout blocks."
        ]
    },
    {
        version: "1.5.2",
        date: "Mar 20, 2026",
        title: "Project Cards: Live Collaborators, Real Progress, and UI Stability",
        description: "Project cards now show real collaborator and task progress data, support dynamic progress color thresholds, and use deterministic icon variation with cleaner build/type safety.",
        improvements: [
            "Wired project cards to live collaborator data and replaced placeholder avatars with generated collaborator initials plus overflow count.",
            "Connected progress bar and progress label to real task completion metrics (completed/total and percentage) from server-side project queries.",
            "Added segmented progress color customization support via a single `color` prop that accepts Tailwind classes or CSS/hex colors.",
            "Implemented threshold-based progress coloring: <50 uses theme primary, 50–75 uses orange fade, 75–100 uses green fade.",
            "Updated project card icon rendering to use deterministic hash-based randomization with different criteria per UI slot while keeping the same icon pair."
        ],
        fixes: [
            "Removed `@ts-nocheck` usage from build/project surfaces and fixed newly exposed type mismatches.",
            "Resolved dialog and select prop incompatibilities that previously surfaced console/type warnings in task flows.",
            "Fixed project card badge/icon JSX issues and stabilized rendering behavior across re-renders."
        ],
        patches: [
            "Extended `ProjectWithStats` with progress and collaborator summary fields for UI consumption.",
            "Updated `getProjects()` to aggregate accepted collaborators and task completion statistics per project.",
            "Applied Tailwind class normalization and component-level diagnostics cleanup for changed files."
        ]
    },
    {
        version: "1.5.1",
        date: "Mar 8, 2026",
        title: "Workflow Optimizations & UI Polish",
        description: "Introduced secure project deletion, enhanced cross-page task workflows, colorful priority selectors, improved EditorJS stability, and aesthetic updates to the dashboard.",
        improvements: [
            "Enhanced project deletion securely on the dashboard with confirmation phrase validation and a timed 3-second countdown.",
            "Improved workflow between Project Versions and Task management by adding an 'Add Task' button that automatically opens the task creation modal upon redirecting.",
            "Upgraded Task Priority inputs from standard dropdowns to visually distinct toggle groups with semantic coloring (red, yellow, green) for quicker priority identification.",
            "Updated dashboard card aesthetics, adding a refined top-left curved cutout style for the contributors module.",
            "Unified EditorJS instances across the application for more consistent rich text editing behaviour."
        ],
        fixes: [
            "Implemented unified backend error handling to consistently surface user-friendly error messages when server mutations fail."
        ],
        patches: [

        ]
    },
    {
        version: "1.5",
        date: "Feb 23, 2026",
        title: "Build Board Customization, Version PRD Editing, and UX Polish",
        description: "Major workflow update across Build, Versions, Growth, and public content with custom Kanban columns, in-place editing, stronger loading states, and improved navigation consistency.",
        improvements: [
            "Reworked Build Kanban from fixed Now/Next/Later lanes to project-defined columns with editable title and description, in-column task quick add, and empty-column delete safeguards.",
            "Added column management actions in Kanban headers (plus action and three-dot menu) including move left/right ordering and delete when the column has no tasks.",
            "Implemented optimistic task updates for Kanban interactions so drag/drop and task edits reflect immediately before server confirmation.",
            "Added detailed task dialog from Kanban cards with editable title, description, priority, category, and in-dialog delete action.",
            "Enabled task quick-create from column actions to inherit active filters (version, section/category, assignee) for faster contextual planning.",
            "Added dynamic category management in Build filters with inline 'Add category' action and reuse of custom categories in task creation UI.",
            "Improved Versions experience with top-level version tabs, dropdown actions (set active/delete), and in-card editable PRD with save support.",
            "Refined Growth onboarding and dashboard UX with improved hierarchy, copy, and a reusable stepper number input component.",
            "Expanded loading UX coverage with route-level skeletons and mutation placeholders across Projects and project sub-routes for reduced layout shift.",
            "Redesigned blog flow to support both /blog index and /blog/[slug], added richer placeholder docs content, and wired SEO-oriented frontmatter handling."
        ],
        fixes: [
            "Fixed Kanban card completion visual behavior: completed titles keep normal color with strikethrough-only treatment and improved checkbox hover states.",
            "Fixed Build interactions where tasks appeared to jump back after drag due to async timing by applying optimistic state transitions.",
            "Fixed version tab behavior to switch selected version content at the top-level card area and align actions inside the three-dot menu.",
            "Fixed frontmatter parsing/build issues in docs by normalizing quoted values and aligning metadata expectations.",
            "Fixed metadata and typing inconsistencies in blog rendering and route handling after redesign.",
            "Fixed minor class and diagnostics issues introduced during UI refactors across Build and Versions components."
        ],
        patches: [
            "Added database migration for custom Kanban columns and task-to-column association with backward mapping from legacy task statuses.",
            "Extended database/task typing to support new Kanban and flexible category behavior used by Build UI.",
            "Added server actions for Kanban columns (fetch/create/update/delete) with project-level revalidation and empty-column validation.",
            "Updated Fumadocs schema/frontmatter validation to include required content fields plus optional SEO metadata fields."
        ]
    },
    {
        version: "1.4.0",
        date: "Feb 21, 2026",
        title: "Version Dashboard Improvements",
        description: "Enhanced the versions page with better task visualization and assignee display.",
        improvements: [
            "Added PRD and Goals sections to version view for better requirement tracking.",
            "Improved assignee display to show user names/emails instead of raw UUIDs.",
            "Created /resources page showcasing available guides (Copywriting, SEO)."
        ],
        fixes: [
            "Fixed radial progress chart to properly handle 0 tasks case (showed misleading '1 of 1')."
        ],
        patches: []
    },
    // {
    //     version: "0.6.0",
    //     date: "Feb 13, 2026",
    //     title: "Stability Improvements & Diagram Fixes",
    //     description: "Addressed critical issues in RPC handling and diagram rendering to ensure smoother system operation.",
    //     improvements: [
    //         "Enhanced error handling for RPC methods to prevent registration failures."
    //     ],
    //     fixes: [
    //         "Resolved syntax error in RPC handler registration causing '}' expected errors.",
    //         "Fixed Mermaid diagram rendering issues on documentation pages.",
    //         "Corrected duplicate transcript display bugs in the Talk interface.",
    //         "Fixed visual presentation of user and AI speaking indicators."
    //     ],
    //     patches: []
    // },
    // {
    //     version: "0.5.0",
    //     date: "Feb 12, 2026",
    //     title: "Interactive Classroom & Game Experiences",
    //     description: "Introduced the 'Family Feud' style game and significantly overhauled the visual experience of the Talk Page.",
    //     improvements: [
    //         "Implemented 'Family Feud' game logic with team scoring (Alpha, Beta, Gamma) and board display.",
    //         "Overhauled Talk Page UI with dynamic, directional matrix animations (right-to-left for AI, left-to-right for user).",
    //         "Integrated AI agent communication for the Pi Tutor system using LiveKit.",
    //         "Added enhanced background glow effects that respond to speaker activity.",
    //         "Implemented 'perform_rpc' calls for UI interactions like highlighting text and focusing students."
    //     ],
    //     fixes: [
    //         "Corrected data mismatches between agent student matrix and frontend seating matrix.",
    //         "Fixed environment variable configuration for AI services (OPENAI_API_KEY).",
    //         "Resolved potential infinite loops in RPC handler setup."
    //     ],
    //     patches: []
    // },
    // {
    //     version: "0.4.0",
    //     date: "Feb 05, 2026",
    //     title: "Build System & Authentication UI Refinement",
    //     description: "Focused on stabilizing the build process for production and refining the authentication user interface.",
    //     improvements: [
    //         "Redesigned sign-up and login pages for better visual consistency with landing page components.",
    //         "Standardized import casing to prevent build errors across different environments.",
    //         "Updated changelog tracking to accurately reflect build system fixes."
    //     ],
    //     fixes: [
    //         "Resolved 'module not found' errors in Vercel production builds.",
    //         "Fixed file casing issues in component imports (e.g., Logo component).",
    //         "Addressed circular reference errors in Supabase migrations."
    //     ],
    //     patches: []
    // },
    // {
    //     version: "0.3.0",
    //     date: "Feb 04, 2026",
    //     title: "Planning Board & Profile Customization",
    //     description: "Enhanced project management capabilities and user profile customization options.",
    //     improvements: [
    //         "Added drag-and-drop support for planning board cards using @dnd-kit.",
    //         "Implemented 'Create Column' functionality for Kanban boards.",
    //         "Refined profile link management with drag-and-drop reordering.",
    //         "Updated typography to 'Inter Tight' for improved readability.",
    //         "Simplified profile editing with inline editing features."
    //     ],
    //     fixes: [
    //         "Resolved Page overflow issues on the planning board.",
    //         "Fixed TypeScript errors in Link component usage.",
    //         "Addressed contrast issues in specific theme templates."
    //     ],
    //     patches: []
    // },
    // {
    //     version: "0.1.0",
    //     date: "Jan 16, 2026",
    //     title: "MVP Release",
    //     description: "Initial release of the Content Creator OS with core project management and collaboration features.",
    //     improvements: [
    //         "Established core project structure and UI component library.",
    //         "Implemented essential features: Secrets, Links, Tasks, Notes, Versioning.",
    //         "Set up database schema and initial migrations for collaboration tools.",
    //         "Created responsive dashboard layouts and project navigation."
    //     ],
    //     fixes: [],
    //     patches: []
    // }
];