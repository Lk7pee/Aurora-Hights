import { readFile } from "node:fs/promises";

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const [episodes, characters, scenes, episodeOne, catalog, routes] = await Promise.all([
  readJson("episodes/episodes.json"),
  readJson("characters/characters.json"),
  readJson("scenes/scenes.json"),
  readJson("dialogues/episode-01.json"),
  readJson("ui/catalog.json"),
  readJson("routes/routes.json")
]);

const ids = new Set(characters.characters.map((character) => character.id));
const sceneIds = new Set(scenes.scenes.map((scene) => scene.id));
const nodeIds = new Set(Object.keys(episodeOne.nodes));
const cgIds = new Set(catalog.cgs.map((cg) => cg.id));

for (const episode of episodes.episodes) {
  if (!episode.id || !episode.title) throw new Error("Episódio sem id/título.");
}

for (const [id, node] of Object.entries(episodeOne.nodes)) {
  if (node.speaker && node.speaker !== "narrator" && !ids.has(node.speaker)) {
    throw new Error(`Node ${id} referencia personagem ausente: ${node.speaker}`);
  }
  if (node.background && !sceneIds.has(node.background)) {
    throw new Error(`Node ${id} referencia cenário ausente: ${node.background}`);
  }
  if (node.next && !nodeIds.has(node.next)) {
    throw new Error(`Node ${id} aponta para node ausente: ${node.next}`);
  }
  if (node.cg && !cgIds.has(node.cg)) {
    throw new Error(`Node ${id} referencia CG ausente: ${node.cg}`);
  }
  for (const character of node.characters ?? []) {
    if (!ids.has(character.id)) throw new Error(`Node ${id} usa personagem ausente: ${character.id}`);
  }
  for (const choice of node.choices ?? []) {
    if (!nodeIds.has(choice.next)) throw new Error(`Escolha em ${id} aponta para ${choice.next}`);
  }
  for (const event of node.events ?? []) {
    if (!nodeIds.has(event.next)) throw new Error(`Evento de mapa em ${id} aponta para ${event.next}`);
    if (event.revisitNext && !nodeIds.has(event.revisitNext)) throw new Error(`Retorno de mapa em ${id} aponta para ${event.revisitNext}`);
  }
  if (node.doneNext && !nodeIds.has(node.doneNext)) {
    throw new Error(`Mapa ${id} tem doneNext ausente: ${node.doneNext}`);
  }
}

for (const route of routes.routes) {
  if (!ids.has(route.characterId)) throw new Error(`Rota ausente: ${route.characterId}`);
}

console.log("Smoke test OK: dados, rotas e referências principais estão consistentes.");
