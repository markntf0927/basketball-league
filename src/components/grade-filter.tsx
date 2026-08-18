"use client";

import { useRouter } from "next/navigation";
import { REGIONS, type RegionKey } from "@/lib/grades";
import Link from "next/link";

type GradeOption = {
  id: string;
  shortLabel: string;
  region: RegionKey;
  seasonLabel: string;
};

export function GradeFilter({
  basePath,
  region,
  gradeId,
  grades,
}: {
  basePath: "/schedule" | "/teams";
  region?: string;
  gradeId?: string;
  grades: GradeOption[];
}) {
  const router = useRouter();
  const visible = region
    ? grades.filter((grade) => grade.region === region)
    : grades;
  const seasons = [...new Set(visible.map((grade) => grade.seasonLabel))].sort(
    (a, b) => {
      const numA = Number(a.match(/\d+/)?.[0] ?? -1);
      const numB = Number(b.match(/\d+/)?.[0] ?? -1);
      return numB - numA;
    },
  );
  const hrefFor = (nextRegion?: string) => {
    if (!nextRegion) return basePath;
    return `${basePath}?region=${nextRegion}`;
  };

  return (
    <div className="grade-filter">
      <div className="filter-row region-tabs" role="tablist" aria-label="地區">
        <Link href={basePath} className={!region ? "active" : ""}>
          全部
        </Link>
        {REGIONS.map((item) =>
          grades.some((grade) => grade.region === item.key) ? (
            <Link
              key={item.key}
              href={hrefFor(item.key)}
              className={region === item.key ? "active" : ""}
            >
              {item.label}
            </Link>
          ) : null,
        )}
      </div>

      <label className="grade-select-row">
        <span>組別</span>
        <select
          value={gradeId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              router.push(hrefFor(region));
              return;
            }
            const selected = grades.find((grade) => grade.id === value);
            const params = new URLSearchParams();
            params.set("region", selected?.region ?? region ?? "");
            params.set("grade", value);
            router.push(`${basePath}?${params.toString()}`);
          }}
        >
          <option value="">
            {region ? "此地區全部組別" : "全部組別"}
          </option>
          {seasons.map((season) => (
            <optgroup key={season} label={season}>
              {visible
                .filter((grade) => grade.seasonLabel === season)
                .map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.shortLabel}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  );
}
