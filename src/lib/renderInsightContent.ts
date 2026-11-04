import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false
});

/** Supports both legacy HTML posts and Markdown authored in DatoCMS. */
export function renderInsightContent(content: string): string {
  return marked
    .parse(content, { async: false })
    .replaceAll("<h1>", "<h2>")
    .replaceAll("</h1>", "</h2>");
}
