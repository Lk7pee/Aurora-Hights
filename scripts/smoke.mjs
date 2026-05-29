import { access, readFile } from "node:fs/promises";

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
const achievementIds = new Set((catalog.achievements ?? []).map((achievement) => achievement.id));
const assetChecks = [];

function validateAsset(path, context) {
  if (!path || path.startsWith("data:") || /^https?:\/\//i.test(path)) return;
  const normalized = path.replace(/^\.\//, "");
  assetChecks.push(
    access(normalized).catch(() => {
      throw new Error(`${context} referencia arquivo ausente: ${path}`);
    })
  );
}

function validateEffects(effects = {}, context) {
  for (const outfitId of effects.wardrobeAdd ?? []) {
    if (!outfitIds.has(outfitId)) throw new Error(`${context} libera roupa ausente: ${outfitId}`);
  }
  for (const itemId of effects.inventoryAdd ?? []) {
    if (!inventoryIds.has(itemId)) throw new Error(`${context} libera item ausente: ${itemId}`);
  }
  for (const cgId of effects.galleryAdd ?? []) {
    if (!cgIds.has(cgId)) throw new Error(`${context} libera CG ausente: ${cgId}`);
  }
  for (const achievementId of effects.achievementAdd ?? []) {
    if (!achievementIds.has(achievementId)) throw new Error(`${context} libera conquista ausente: ${achievementId}`);
  }
}

for (const episode of episodes.episodes) {
  if (!episode.id || !episode.title) throw new Error("Episódio sem id/título.");
  if (episode.dialogue && !dialogues[episode.id]) throw new Error(`Episódio sem roteiro carregado: ${episode.id}`);
  validateAsset(episode.cover, `Capa de ${episode.id}`);
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
      validateEffects(choice.effects, `Escolha em ${episodeId}/${id}`);
    }
    for (const event of node.events ?? []) {
      if (!nodeIds.has(event.next)) throw new Error(`Evento de mapa em ${episodeId}/${id} aponta para ${event.next}`);
      if (event.revisitNext && !nodeIds.has(event.revisitNext)) throw new Error(`Retorno de mapa em ${episodeId}/${id} aponta para ${event.revisitNext}`);
      if (!sceneIds.has(event.location)) throw new Error(`Evento de mapa em ${episodeId}/${id} usa local ausente: ${event.location}`);
    }
    if (node.doneNext && !nodeIds.has(node.doneNext)) {
      throw new Error(`Mapa ${episodeId}/${id} tem doneNext ausente: ${node.doneNext}`);
    }
    validateEffects(node.effects, `${episodeId}/${id}`);
  }
}

for (const route of routes.routes) {
  if (!ids.has(route.characterId)) throw new Error(`Rota ausente: ${route.characterId}`);
  if (route.rewardCg && !cgIds.has(route.rewardCg)) throw new Error(`Rota ${route.characterId} recompensa CG ausente: ${route.rewardCg}`);
  if (route.rewardItem && !inventoryIds.has(route.rewardItem)) throw new Error(`Rota ${route.characterId} recompensa item ausente: ${route.rewardItem}`);
}

for (const character of characters.characters) {
  validateAsset(character.sprite, `Sprite de ${character.id}`);
  validateAsset(character.playerMasculino?.sprite, `Sprite masculino alternativo de ${character.id}`);
  validateAsset(character.playerFeminino?.sprite, `Sprite feminino alternativo de ${character.id}`);
}

for (const scene of scenes.scenes) {
  validateAsset(scene.image, `Cenario ${scene.id}`);
  validateAsset(scene.dayImage, `Cenario diurno ${scene.id}`);
  validateAsset(scene.nightImage, `Cenario noturno ${scene.id}`);
}

for (const cg of catalog.cgs) {
  validateAsset(cg.image, `CG ${cg.id}`);
}

for (const outfit of catalog.outfits) {
  for (const [variant, sprite] of Object.entries(outfit.sprites ?? {})) {
    validateAsset(sprite, `Roupa ${outfit.id}/${variant}`);
  }
}

await Promise.all(assetChecks);

console.log(`Smoke test OK: ${episodes.episodes.length} episódios, ${Object.keys(dialogues).length} roteiros, ${assetChecks.length} assets e referências principais consistentes.`);
