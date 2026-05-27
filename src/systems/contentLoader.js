const jsonFiles = {
  characters: "../../characters/characters.json",
  episodes: "../../episodes/episodes.json",
  scenes: "../../scenes/scenes.json",
  catalog: "../../ui/catalog.json",
  routes: "../../routes/routes.json",
  music: "../../music/manifest.json",
  episodeOne: "../../dialogues/episode-01.json"
};

async function fetchJson(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${url.pathname}: ${response.status}`);
  }
  return response.json();
}

export async function loadGameData() {
  const [characters, episodes, scenes, catalog, routes, music, episodeOne] = await Promise.all([
    fetchJson(jsonFiles.characters),
    fetchJson(jsonFiles.episodes),
    fetchJson(jsonFiles.scenes),
    fetchJson(jsonFiles.catalog),
    fetchJson(jsonFiles.routes),
    fetchJson(jsonFiles.music),
    fetchJson(jsonFiles.episodeOne)
  ]);

  return {
    characters: characters.characters,
    episodes: episodes.episodes,
    scenes: scenes.scenes,
    catalog,
    routes: routes.routes,
    music: music.tracks,
    dialogues: {
      [episodeOne.id]: episodeOne
    }
  };
}

export function indexById(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export function createDataIndexes(data) {
  return {
    characters: indexById(data.characters),
    episodes: indexById(data.episodes),
    scenes: indexById(data.scenes),
    tracks: indexById(data.music),
    inventory: indexById(data.catalog.inventory),
    outfits: indexById(data.catalog.outfits),
    cgs: indexById(data.catalog.cgs),
    routes: Object.fromEntries(data.routes.map((route) => [route.characterId, route]))
  };
}
