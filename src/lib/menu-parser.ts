// Parses the raw Google Doc text. Sections are introduced by a line wrapped in [brackets].
// Inside each section, every non-empty line is split by `|` into fields.

export type MenuRow = string[];
export type MenuSection = { title: string; rows: MenuRow[] };
export type ParsedMenu = { sections: MenuSection[]; parsed_at: string };

export function parseMenuText(raw: string): ParsedMenu {
  const sections: MenuSection[] = [];
  let current: MenuSection | null = null;

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const bracket = line.match(/^\[(.+)\]$/);
    if (bracket) {
      current = { title: bracket[1].trim(), rows: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      // Implicit section if doc has rows before the first [bracket]
      current = { title: "Menu", rows: [] };
      sections.push(current);
    }
    if (line.includes("|")) {
      current.rows.push(line.split("|").map((s) => s.trim()).filter(Boolean));
    } else {
      current.rows.push([line]);
    }
  }
  return { sections, parsed_at: new Date().toISOString() };
}
