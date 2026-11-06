
export type Anime = {
  id: string;
  title: string;
  year: number;
  episodes: number;
  status: string;
  genres: string[];
  moods: string[];
  storyTypes: string[];
  protagonistTypes: string[];
  contentNotes: string[];
};

export type RecommendationPreferences = {
  genres?: string[];
  moods?: string[];
  storyTypes?: string[];
  protagonistTypes?: string[];
  episodeLength?: "short" | "medium" | "long";
  releasePeriod?: "classic" | "2010s" | "2020s";
  watchedIds?: string[];
};

export type AnimeMatch = Anime & {
  matchScore: number;
  reasons: string[];
};

const weights = {
  genres: 35,
  moods: 25,
  storyTypes: 20,
  protagonistTypes: 15,
  episodeLength: 15,
  releasePeriod: 5,
};

function getOverlap(preferred: string[], actual: string[]) {
  return preferred.filter((item) => actual.includes(item));
}

function matchesEpisodeLength(
  episodes: number,
  preference: "short" | "medium" | "long"
) {
  if (preference === "short") return episodes <= 13;
  if (preference === "medium") return episodes > 13 && episodes <= 26;
  return episodes > 26;
}

function matchesReleasePeriod(
  year: number,
  period: "classic" | "2010s" | "2020s"
) {
  if (period === "classic") return year < 2010;
  if (period === "2010s") return year >= 2010 && year <= 2019;
  return year >= 2020;
}

export function getRecommendations(
  animeList: Anime[],
  preferences: RecommendationPreferences,
  limit = 10
): AnimeMatch[] {
  const watched = new Set(preferences.watchedIds ?? []);

  const activeWeights =
    (preferences.genres?.length ? weights.genres : 0) +
    (preferences.moods?.length ? weights.moods : 0) +
    (preferences.storyTypes?.length ? weights.storyTypes : 0) +
    (preferences.protagonistTypes?.length
      ? weights.protagonistTypes
      : 0) +
    (preferences.episodeLength ? weights.episodeLength : 0) +
    (preferences.releasePeriod ? weights.releasePeriod : 0);

  if (activeWeights === 0) return [];

  return animeList
    .filter((anime) => !watched.has(anime.id))
    .map((anime) => {
      let totalScore = 0;
      const reasons: string[] = [];

      function addArrayMatch(
        preferred: string[] | undefined,
        actual: string[],
        weight: number,
        label: string
      ) {
        if (!preferred?.length) return;

        const matched = getOverlap(preferred, actual);
        totalScore += (matched.length / preferred.length) * weight;

        if (matched.length) {
          reasons.push(`${label}: ${matched.join(", ")}`);
        }
      }

      addArrayMatch(
        preferences.genres,
        anime.genres,
        weights.genres,
        "Genres"
      );

      addArrayMatch(
        preferences.moods,
        anime.moods,
        weights.moods,
        "Mood"
      );

      addArrayMatch(
        preferences.storyTypes,
        anime.storyTypes,
        weights.storyTypes,
        "Story"
      );

      addArrayMatch(
        preferences.protagonistTypes,
        anime.protagonistTypes,
        weights.protagonistTypes,
        "Protagonist"
      );

      if (preferences.episodeLength) {
        const matched = matchesEpisodeLength(
          anime.episodes,
          preferences.episodeLength
        );

        if (matched) {
          totalScore += weights.episodeLength;
          reasons.push("Matches your episode preference");
        }
      }

      if (preferences.releasePeriod) {
        const matched = matchesReleasePeriod(
          anime.year,
          preferences.releasePeriod
        );

        if (matched) {
          totalScore += weights.releasePeriod;
          reasons.push("Matches your release period");
        }
      }

      return {
        ...anime,
        matchScore: Math.round((totalScore / activeWeights) * 100),
        reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
