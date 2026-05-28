import { readFile } from "node:fs/promises";

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const [episodes, characters, scenes, catalog, routes] = await Promise.all([
  readJson("episodes/episodes.json"),
  readJson("characters/characters.json"),
  readJson("scenes/scenes.json"),
  readJson("ui/catalog.json"),
  readJson("routes/routes.json")
]);

const dialogues = Object.fromEntries(
  await Promise.all(
    episodes.episodes
      .filter((episode) => episode.dialogue)
      .map(async (episode) => {
        const path = episode.dialogue.replace(/^\.\//, "");
        const dialogue = await readJson(path);
        return [episode.id, dialogue];
      })
  )
);

const ids = new Set(characters.characters.map((character) => character.id));
const sceneIds = new Set(scenes.scenes.map((scene) => scene.id));
const cgIds = new Set(catalog.cgs.map((cg) => cg.id));
const outfitIds = new Set(catalog.outfits.map((outfit) => outfit.id));
const inventoryIds = new Set(catalog.inventory.map((item) => item.id));

for (const episode of episodes.episodes) {
  if (!episode.id || !episode.title) throw new Error("Episódio sem id/título.");
  if (episode.dialogue && !dialogues[episode.id]) throw new Error(`Episódio sem roteiro carregado: ${episode.id}`);
}

for (const [episodeId, dialogue] of Object.entries(dialogues)) {
  if (dialogue.id !== episodeId) throw new Error(`Roteiro ${episodeId} declara id ${dialogue.id}.`);
  const nodeIds = new Set(Object.keys(dialogue.nodes));
  if (!nodeIds.has(dialogue.startNode)) throw new Error(`${episodeId} usa startNode ausente: ${dialogue.startNode}`);

  for (const [id, node] of Object.entries(dialogue.nodes)) {
    if (node.speaker && node.speaker !== "narrator" && !ids.has(node.speaker)) {
      throw new Error(`${episodeId}/${id} referencia personagem ausente: ${node.speaker}`);
    }
    if (node.background && !sceneIds.has(node.background)) {
      throw new Error(`${episodeId}/${id} referencia cenário ausente: ${node.background}`);
    }
    if (node.next && !nodeIds.has(node.next)) {
      throw new Error(`${episodeId}/${id} aponta para node ausente: ${node.next}`);
    }
    if (node.cg && !cgIds.has(node.cg)) {
      throw new Error(`${episodeId}/${id} referencia CG ausente: ${node.cg}`);
    }
    for (const character of node.characters ?? []) {
      if (!ids.has(character.id)) throw new Error(`${episodeId}/${id} usa personagem ausente: ${character.id}`);
    }
    for (const choice of node.choices ?? []) {
      if (!nodeIds.has(choice.next)) throw new Error(`Escolha em ${episodeId}/${id} aponta para ${choice.next}`);
      for (const outfitId of choice.effects?.wardrobeAdd ?? []) {
        if (!outfitIds.has(outfitId)) throw new Error(`Escolha em ${episodeId}/${id} libera roupa ausente: ${outfitId}`);
      }
      for (const itemId of choice.effects?.inventoryAdd ?? []) {
        if (!inventoryIds.has(itemId)) throw new Error(`Escolha em ${episodeId}/${id} libera item ausente: ${itemId}`);
      }
    }
    for (const event of node.events ?? []) {
      if (!nodeIds.has(event.next)) throw new Error(`Evento de mapa em ${episodeId}/${id} aponta para ${event.next}`);
      if (event.revisitNext && !nodeIds.has(event.revisitNext)) throw new Error(`Retorno de mapa em ${episodeId}/${id} aponta para ${event.revisitNext}`);
      if (!sceneIds.has(event.location)) throw new Error(`Evento de mapa em ${episodeId}/${id} usa local ausente: ${event.location}`);
    }
    if (node.doneNext && !nodeIds.has(node.doneNext)) {
      throw new Error(`Mapa ${episodeId}/${id} tem doneNext ausente: ${node.doneNext}`);
    }
    for (const outfitId of node.effects?.wardrobeAdd ?? []) {
      if (!outfitIds.has(outfitId)) throw new Error(`${episodeId}/${id} libera roupa ausente: ${outfitId}`);
    }
    for (const itemId of node.effects?.inventoryAdd ?? []) {
      if (!inventoryIds.has(itemId)) throw new Error(`${episodeId}/${id} libera item ausente: ${itemId}`);
    }
  }
}

for (const route of routes.routes) {
  if (!ids.has(route.characterId)) throw new Error(`Rota ausente: ${route.characterId}`);
}

console.log(`Smoke test OK: ${episodes.episodes.length} episódios, ${Object.keys(dialogues).length} roteiros e referências principais consistentes.`);
