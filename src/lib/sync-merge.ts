export type EditorialFields = {
  photoUrl?: string | null;
  videoUrl?: string | null;
  bio?: string | null;
  landingHtml?: string | null;
};

export type SyncedEntity = {
  sourceId: string;
  stats: Record<string, number | string | null>;
  editorial: EditorialFields;
};

function keepEditorial(
  local: string | null | undefined,
  incoming: string | null | undefined,
): string | null | undefined {
  if (local !== undefined && local !== null && local !== "") return local;
  return incoming;
}

export function mergeFromLegacy(
  local: SyncedEntity,
  incoming: SyncedEntity,
): SyncedEntity {
  return {
    sourceId: local.sourceId,
    stats: { ...incoming.stats },
    editorial: {
      photoUrl: keepEditorial(local.editorial.photoUrl, incoming.editorial.photoUrl),
      videoUrl: keepEditorial(local.editorial.videoUrl, incoming.editorial.videoUrl),
      bio: keepEditorial(local.editorial.bio, incoming.editorial.bio),
      landingHtml: keepEditorial(
        local.editorial.landingHtml,
        incoming.editorial.landingHtml,
      ),
    },
  };
}
