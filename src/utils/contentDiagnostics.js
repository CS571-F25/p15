import { CONTENT_TYPES } from '../constants/contentConstants';

export function evaluateContentHealth(entries = [], options = {}) {
  const { knownTypes = CONTENT_TYPES, locationIds = [] } = options;
  const list = Array.isArray(entries) ? entries : [];

  const idSet = new Set();
  const duplicateIds = new Set();
  let missingIds = 0;

  list.forEach((entry) => {
    const id = entry?.id;
    if (id === undefined || id === null || id === '') {
      missingIds += 1;
      return;
    }
    const key = String(id);
    if (idSet.has(key)) {
      duplicateIds.add(key);
    } else {
      idSet.add(key);
    }
  });

  const knownTypeSet = new Set((knownTypes || []).map((type) => String(type).toLowerCase()));
  const unknownTypes = list
    .filter((entry) => {
      const type = String(entry?.type || '').toLowerCase();
      if (!type) return true;
      if (!knownTypeSet.size) return false;
      return !knownTypeSet.has(type);
    })
    .map((entry) => entry?.id || '(missing id)');

  const missingTitles = list
    .filter((entry) => !entry?.title)
    .map((entry) => entry?.id || '(missing id)');
  const missingSummaries = list
    .filter((entry) => !entry?.summary)
    .map((entry) => entry?.id || '(missing id)');

  const locationSet = new Set((locationIds || []).map((id) => String(id)));
  const badReferences = list
    .filter(
      (entry) =>
        entry?.mapLocationId !== null &&
        entry?.mapLocationId !== undefined &&
        !locationSet.has(String(entry.mapLocationId))
    )
    .map((entry) => entry?.id || String(entry?.mapLocationId));

  const issueCount =
    missingIds +
    duplicateIds.size +
    unknownTypes.length +
    missingTitles.length +
    missingSummaries.length +
    badReferences.length;

  let status = 'ok';
  if (missingIds || duplicateIds.size) {
    status = 'error';
  } else if (unknownTypes.length || missingTitles.length || missingSummaries.length || badReferences.length) {
    status = 'warn';
  }

  const message = list.length
    ? `${list.length} entries; missing ids=${missingIds}; duplicates=${duplicateIds.size}; unknown types=${unknownTypes.length}; missing titles=${missingTitles.length}; missing summaries=${missingSummaries.length}; broken location refs=${badReferences.length}`
    : 'No content entries loaded.';

  return {
    status: list.length ? status : 'warn',
    message,
    details: {
      missingIds,
      duplicateIds: Array.from(duplicateIds),
      unknownTypes,
      missingTitles,
      missingSummaries,
      badReferences,
      issueCount,
    },
  };
}

