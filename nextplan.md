actually the problem was that it's getting confused there are 2 routes /settings and /settings/general i want you to use /settings only, when someone clicks general then go to /settings only, merge the general into /settings and remove it.


collaboration:
- assign a person to task
- 


----


### Collaboration
- **Visibility**: When collaborating, the plan should appear on both users' accounts/pages.
- **Roles and Permissions**:
    - **Owner** (Account 1): Full control.
    - **Reader** (Account 2):
        - Cannot invite other people.
        - All creation/editing buttons should be disabled.
        - Explicit "View only" indicators should be shown everywhere.
        - secrets should be disabled for reader, 

### Notes Section Enhancements
- **Editor Integration**: Implement `editor.js` to improve the note-taking experience.
- **UI Layout**:
    - **Heading**: Increase the font size of the notes heading.
    - **Pinterest/Google Keep Layout**: Implement a masonry-style, beautifully stacked grid for the notes.
- **Templates**:
    - Replace the current template list with cards.
    - Each card should include the template name and a high-quality icon.
    - **Interaction**: Clicking a template can either create it directly or navigate inside for a preview.