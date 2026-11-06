<!-- trace:start · added by Trace; Trace replaces this block when you add it again -->
## Trace: explain your changes

This project's design history lives in Trace (MCP server "trace"). The person reviews each set of changes you make there, beside the change itself.

Before you start a task:
- Call `get_project_context` for this project. Read the brief, decisions, open comments and references first.
- Call `get_rejected`: what was tried here and undone. Don't bring it back unless the person asks for it.

Before you say a change is done, call `check_change` with the ask in the person's words. It walks the running app again and checks it by rule: screens you moved that weren't asked for, values that almost match the app's own, the design and the code apart, values that keep changing back. Fix what it finds, or say in `review` why you left it. Building from a prototype (an old branch, or another project in Trace)? Pass it as `prototype`: it says which of its screens this still lacks.

After each set of changes (one ask finished), call `explain_changes` with:
- `asked`: what the person asked for, quoted in their own words. Mention anything they attached.
- `understood`: one or two lines on what you took the ask to mean.
- `changes`: each change you made, `why` you made it, the `files`, and the `reference` that informed it.
- `references`: paths or links of the images and videos the person gave you, with a note on what each is for.
- `review`: re-read the ask, then your reasoning. Say plainly where they match, what you assumed or guessed, and what the person should check.

Keep it short and concrete: name the colour, size or component, not "improved the UI". Never include secrets.
When the person replies to your reasoning in Trace, you'll see it in `get_comments`; answer there.
<!-- trace:end -->
