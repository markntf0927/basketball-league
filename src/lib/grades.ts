export const REGIONS = [
  { key: "tky", label: "荃葵九" },
  { key: "tty", label: "屯天元" },
  { key: "kln", label: "九龍區" },
  { key: "youth", label: "青少年" },
  { key: "other", label: "其他" },
] as const;

export type RegionKey = (typeof REGIONS)[number]["key"];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function regionOfGrade(name: string): RegionKey {
  if (/荃葵九/.test(name)) return "tky";
  if (/屯天元/.test(name)) return "tty";
  if (/九龍/.test(name)) return "kln";
  if (/WonderKids|Youths|青少年/i.test(name)) return "youth";
  return "other";
}

export function seasonLabelOf(name: string, seasonId: string) {
  const matched = name.match(/Season\s*(\d+)/i);
  if (matched) return `Season ${matched[1]}`;
  const slug = seasonId.replace(/^season-/, "");
  if (slug === "other") return "其他賽季";
  return `Season ${slug}`;
}

export function shortGradeLabel(name: string) {
  let label = name
    .replace(/Phoenix Basketball League x WonderKids Youths League\s*/i, "")
    .replace(/荃葵九|屯天元|九龍區/g, "")
    .replace(/鳳凰盃\s*D(\d+)/g, "鳳凰盃 D$1")
    .replace(/Season\s*(\d+)/gi, "S$1")
    .replace(/\s+/g, " ")
    .trim();
  return label || name;
}

export function labeledGrades<
  T extends { id: string; name: string; seasonId: string; sortOrder?: number },
>(grades: T[]) {
  const grouped = new Map<string, T[]>();
  for (const grade of grades) {
    const key = shortGradeLabel(grade.name);
    const list = grouped.get(key) ?? [];
    list.push(grade);
    grouped.set(key, list);
  }

  const suffixes = new Map<string, string>();
  for (const [key, list] of grouped) {
    if (list.length < 2) continue;
    [...list]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .forEach((grade, index) => {
        suffixes.set(grade.id, `組${LETTERS[index] ?? index + 1}`);
      });
  }

  return grades.map((grade) => {
    const suffix = suffixes.get(grade.id);
    const short = shortGradeLabel(grade.name);
    return {
      ...grade,
      region: regionOfGrade(grade.name),
      seasonLabel: seasonLabelOf(grade.name, grade.seasonId),
      shortLabel: suffix ? `${short} · ${suffix}` : short,
    };
  });
}

export function parseRegion(value?: string) {
  return REGIONS.some((region) => region.key === value)
    ? (value as RegionKey)
    : undefined;
}

export function gradesInRegion<T extends { name: string }>(
  grades: T[],
  region?: string,
) {
  if (!region) return grades;
  return grades.filter((grade) => regionOfGrade(grade.name) === region);
}
