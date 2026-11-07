/**
 * For pictures below the first screen: start loading with the page, behind its own files, so a picture is already there when you scroll
 * to it. Lazy loading waited until a picture was nearly on screen (Safari waits longest), and after a deploy each one then took about a
 * second to come back from the image optimiser. They're small, so fetching them early costs little.
 */
export const EARLY = { loading: "eager", fetchPriority: "low" } as const;
