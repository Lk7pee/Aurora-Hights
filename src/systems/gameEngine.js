const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ENCOUNTER_AP_COST = 2;
export const MINIGAMES = {
  constellation: {
    id: "constellation",
    name: "Ligar constelações",
    ap: 4,
    cooldownMs: 60_000,
    sequence: ["1", "2", "3", "4", "5"],
    controls: ["1", "2", "3", "4", "5"]
  },
  rhythm: {
    id: "rhythm",
    name: "Ensaio de ritmo",
    ap: 5,
    cooldownMs: 60_000,
    roundLength: 6,
    controls: ["left", "up", "right", "down"]
  }
};
const REPLAY_MEMORY_BY_LOCATION = {
  library: "library-note",
  terrace: "star-rooftop"
};

function cloneState(state) {
  return typeof structuredClone === "function" ? structuredClone(state) : JSON.parse(JSON.stringify(state));
}

function uniquePush(list, values) {
  const set = new Set(list);
  for (const value of values) set.add(value);
  return [...set];
}

function shuffle(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createMiniGameRound(game, previousSequence = []) {
  if (game.id === "constellation") {
    return {
      sequence: [...game.sequence],
      board: shuffle(game.controls)
    };
  }

  const previousKey = previousSequence.join("|");
  let sequence = [];
  do {
    sequence = Array.from(
      { length: game.roundLength },
      () => game.controls[Math.floor(Math.random() * game.controls.length)]
    );
  } while (sequence.join("|") === previousKey);

  return { sequence };
}

function addToast(state, message, tone = "info") {
  const toast = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    tone
  };
  state.ui.toasts = [toast, ...(state.ui.toasts ?? [])].slice(0, 4);
}

function storyEffectsForState(state, effects = {}) {
  const replayLocksAffinity = state.activeEpisodeId === "episode-01" && state.flags?.replaying_episode_01;
  if (!replayLocksAffinity || !effects.affinity) return effects;
  const { affinity, ...effectsWithoutAffinity } = effects;
  return effectsWithoutAffinity;
}

export function dismissToast(state, toastId) {
  const next = cloneState(state);
  next.ui.toasts = next.ui.toasts.filter((toast) => toast.id !== toastId);
  return next;
}

export function getEpisodeData(data, episodeId) {
  return data.dialogues[episodeId];
}

export function getCurrentNode(state, data) {
  if (!state.activeEpisodeId || !state.currentNodeId) return null;
  return getEpisodeData(data, state.activeEpisodeId)?.nodes[state.currentNodeId] ?? null;
}

export function getScene(data, sceneId) {
  return data.indexes.scenes[sceneId] ?? data.scenes[0];
}

export function getCharacter(data, characterId, state = null) {
  const character = data.indexes.characters[characterId];
  if (!character || !state?.profile) return character;
  const variant = state.profile.gender === "masculino" ? character.playerMasculino : character.playerFeminino;
  return variant ? { ...character, ...variant } : character;
}

export function getCg(data, cgId) {
  return data.indexes.cgs[cgId];
}

export function canPlayEpisode(state, episode) {
  if (episode.status === "future") return false;
  if (state.unlockedEpisodes.includes(episode.id)) return true;
  return (episode.requiresCompleted ?? []).every((id) => state.completedEpisodes.includes(id));
}

export function applyEffects(state, effects = {}, data) {
  const next = cloneState(state);
  if (!effects || Object.keys(effects).length === 0) return next;

  if (Number.isFinite(effects.ap)) {
    const previous = next.stats.ap;
    next.stats.ap = clamp(next.stats.ap + effects.ap, 0, next.stats.maxAp);
    if (effects.ap !== 0) addToast(next, `${effects.ap > 0 ? "+" : ""}${next.stats.ap - previous} AP`, "ap");
  }
  if (Number.isFinite(effects.coins)) {
    next.stats.coins = Math.max(0, next.stats.coins + effects.coins);
    addToast(next, `${effects.coins > 0 ? "+" : ""}${effects.coins} moedas`, "coins");
  }
  if (Number.isFinite(effects.gems)) {
    next.stats.gems = Math.max(0, next.stats.gems + effects.gems);
    addToast(next, `${effects.gems > 0 ? "+" : ""}${effects.gems} gemas`, "coins");
  }
  if (effects.affinity) {
    for (const [characterId, delta] of Object.entries(effects.affinity)) {
      next.affinity[characterId] = (next.affinity[characterId] ?? 0) + delta;
      const character = getCharacter(data, characterId, next);
      const label = character ? character.name : characterId;
      addToast(next, `${label}: ${delta > 0 ? "+" : ""}${delta} afinidade`, delta >= 0 ? "affinity" : "warning");
    }
  }
  if (effects.flags) {
    next.flags = { ...next.flags, ...effects.flags };
  }
  if (effects.inventoryAdd?.length) {
    next.inventory = uniquePush(next.inventory, effects.inventoryAdd);
    for (const itemId of effects.inventoryAdd) {
      const item = data.indexes.inventory[itemId];
      addToast(next, `${item?.name ?? itemId} adicionado ao inventário`, "item");
    }
  }
  if (effects.wardrobeAdd?.length) {
    next.wardrobe = uniquePush(next.wardrobe, effects.wardrobeAdd);
    for (const outfitId of effects.wardrobeAdd) {
      const outfit = data.indexes.outfits[outfitId];
      addToast(next, `${outfit?.name ?? outfitId} desbloqueado`, "item");
    }
  }
  if (effects.galleryAdd?.length) {
    next.gallery = uniquePush(next.gallery, effects.galleryAdd);
    for (const cgId of effects.galleryAdd) {
      const cg = data.indexes.cgs[cgId];
      addToast(next, `CG desbloqueada: ${cg?.title ?? cgId}`, "cg");
    }
  }
  if (effects.outfit && next.wardrobe.includes(effects.outfit)) {
    next.profile.outfit = effects.outfit;
    addToast(next, "Roupa atualizada", "item");
  }
  if (effects.completeEpisode) {
    next.completedEpisodes = uniquePush(next.completedEpisodes, [effects.completeEpisode]);
    for (const episode of data.episodes) {
      const requirements = episode.requiresCompleted ?? [];
      if (requirements.length && requirements.every((id) => next.completedEpisodes.includes(id))) {
        next.unlockedEpisodes = uniquePush(next.unlockedEpisodes, [episode.id]);
      }
    }
    addToast(next, "Episódio concluído", "success");
  }

  return next;
}

function pushHistory(state, node) {
  if (!node?.text) return;
  const speaker = node.speaker === "narrator" ? "Narrador" : node.speaker;
  state.dialogueHistory = [
    {
      speaker,
      text: node.text,
      nodeId: state.currentNodeId,
      at: new Date().toISOString()
    },
    ...(state.dialogueHistory ?? [])
  ].slice(0, 24);
}

export function moveToNode(state, nodeId, data) {
  const next = cloneState(state);
  const episode = getEpisodeData(data, next.activeEpisodeId);
  const node = episode?.nodes[nodeId];
  if (!node) return next;

  next.currentNodeId = nodeId;
  next.currentBackground = node.background ?? next.currentBackground;
  next.currentMusic = node.music ?? next.currentMusic;
  next.view = "game";
  next.ui.previousView = "game";

  const effectKey = `${next.activeEpisodeId}:${nodeId}`;
  let withEffects = next;
  if (node.effects && !next.system.appliedNodeEffects.includes(effectKey)) {
    withEffects = applyEffects(next, storyEffectsForState(next, node.effects), data);
    withEffects.system.appliedNodeEffects = uniquePush(withEffects.system.appliedNodeEffects, [effectKey]);
  }

  pushHistory(withEffects, node);
  return withEffects;
}

export function startEpisode(state, episodeId, data) {
  const episode = data.indexes.episodes[episodeId];
  const dialogue = getEpisodeData(data, episodeId);
  if (!episode || !dialogue || !canPlayEpisode(state, episode)) return state;

  let next = cloneState(state);
  const replaying = next.completedEpisodes.includes(episodeId);
  next.flags = {
    ...next.flags,
    replaying_episode_01: episodeId === "episode-01" && replaying
  };
  if (episodeId === "episode-01" && replaying) {
    addToast(next, "Replay: explore biblioteca e terraço para liberar memórias ocultas", "cg");
  }
  const minimumStartAp = episode.minimumStartAp ?? 0;
  if (next.stats.ap < minimumStartAp) {
    next = applyEffects(next, { ap: minimumStartAp - next.stats.ap }, data);
    addToast(next, "AP preparado para concluir este capítulo", "success");
  }
  next.activeEpisodeId = episodeId;
  next.currentNodeId = dialogue.startNode;
  next.ui.previousView = "menu";
  next.ui.auto = false;
  next.dialogueHistory = [];
  next.system.appliedNodeEffects = next.system.appliedNodeEffects ?? [];
  return moveToNode(next, dialogue.startNode, data);
}

export function getMiniGameCooldownRemaining(state, gameId, now = Date.now()) {
  return Math.max(0, (state.minigames?.cooldowns?.[gameId] ?? 0) - now);
}

export function startMiniGame(state, gameId) {
  const game = MINIGAMES[gameId];
  if (!game) return state;
  const next = cloneState(state);
  const remaining = getMiniGameCooldownRemaining(next, gameId);
  if (remaining > 0) {
    addToast(next, `Aguarde ${Math.ceil(remaining / 1000)}s para jogar novamente`, "warning");
    return next;
  }
  next.minigames = next.minigames ?? { cooldowns: {}, session: null };
  next.minigames.cooldowns = next.minigames.cooldowns ?? {};
  next.minigames.lastSequences = next.minigames.lastSequences ?? {};
  const round = createMiniGameRound(game, next.minigames.lastSequences[gameId] ?? []);
  next.minigames.lastSequences[gameId] = round.sequence;
  next.minigames.session = {
    gameId,
    ...round,
    progress: 0,
    mistakes: 0,
    completed: false,
    startedAt: Date.now()
  };
  next.view = "minigames";
  next.ui.previousView = "minigames";
  return next;
}

export function playMiniGameMove(state, move, data) {
  const session = state.minigames?.session;
  const game = MINIGAMES[session?.gameId];
  if (!session || !game || session.completed) return state;

  const next = cloneState(state);
  const sequence = session.sequence ?? game.sequence;
  const expected = sequence[session.progress];
  if (move !== expected) {
    next.minigames.session.progress = 0;
    next.minigames.session.mistakes += 1;
    addToast(next, "Sequência incorreta. Tente outra vez.", "warning");
    return next;
  }

  next.minigames.session.progress += 1;
  if (next.minigames.session.progress < sequence.length) return next;

  const previousAp = next.stats.ap;
  let rewarded = applyEffects(next, { ap: game.ap }, data);
  const gained = rewarded.stats.ap - previousAp;
  rewarded.minigames.cooldowns[game.id] = Date.now() + game.cooldownMs;
  rewarded.minigames.session = {
    ...rewarded.minigames.session,
    completed: true,
    gained,
    completedAt: Date.now()
  };
  addToast(rewarded, gained > 0 ? `${game.name} completo: +${gained} AP` : "Minigame completo: AP já estava cheio", gained > 0 ? "success" : "info");
  return rewarded;
}

export function leaveMiniGame(state) {
  const next = cloneState(state);
  next.minigames = next.minigames ?? { cooldowns: {}, session: null };
  next.minigames.session = null;
  return next;
}

export function continueNode(state, data) {
  const node = getCurrentNode(state, data);
  if (!node) return state;
  if (node.type === "end") {
    const next = cloneState(state);
    next.view = "menu";
    next.activeEpisodeId = null;
    next.currentNodeId = null;
    next.currentMusic = "room";
    return next;
  }
  if (!node.next) return state;
  return moveToNode(state, node.next, data);
}

export function chooseOption(state, choiceIndex, data) {
  const node = getCurrentNode(state, data);
  const choice = node?.choices?.[choiceIndex];
  if (!choice) return state;

  let next = applyEffects(state, storyEffectsForState(state, choice.effects), data);
  next.ui.auto = false;
  return moveToNode(next, choice.next, data);
}

export function travelToMapEvent(state, eventIndex, data) {
  const node = getCurrentNode(state, data);
  const event = node?.events?.[eventIndex];
  if (!event) return state;

  if (state.stats.ap < event.apCost) {
    const next = cloneState(state);
    addToast(next, "AP insuficiente para se deslocar", "warning");
    return next;
  }

  let next = applyEffects(state, { ap: -event.apCost }, data);
  const memoryId = next.flags.replaying_episode_01 ? REPLAY_MEMORY_BY_LOCATION[event.location] : null;
  if (memoryId && !next.gallery.includes(memoryId)) {
    next = applyEffects(next, { galleryAdd: [memoryId] }, data);
  }
  next.ui.mapPulse = event.location;
  const destination = event.onceFlag && state.flags[event.onceFlag] && event.revisitNext ? event.revisitNext : event.next;
  return moveToNode(next, destination, data);
}

export function canFinishMap(state, node) {
  return (node.doneWhenFlags ?? []).every((flag) => Boolean(state.flags[flag]));
}

export function finishMap(state, data) {
  const node = getCurrentNode(state, data);
  if (!node?.doneNext || !canFinishMap(state, node)) return state;
  return moveToNode(state, node.doneNext, data);
}

export function equipOutfit(state, outfitId, data) {
  if (!state.wardrobe.includes(outfitId)) return state;
  const next = cloneState(state);
  next.profile.outfit = outfitId;
  addToast(next, `${data.indexes.outfits[outfitId]?.name ?? "Roupa"} equipada`, "item");
  return next;
}

export function buyOutfit(state, outfitId, data) {
  const outfit = data.indexes.outfits[outfitId];
  if (!outfit || state.wardrobe.includes(outfitId)) return state;
  if ((outfit.price ?? 0) > state.stats.coins) {
    const next = cloneState(state);
    addToast(next, "Moedas insuficientes", "warning");
    return next;
  }
  let next = applyEffects(state, { coins: -outfit.price, wardrobeAdd: [outfitId] }, data);
  next.profile.outfit = outfitId;
  return next;
}

export function playEncounter(state, characterId, data) {
  const route = data.indexes.routes[characterId];
  if (!route) return state;
  const requirements = route.requirements ?? {};
  const hasAffinity = (state.affinity[characterId] ?? 0) >= (requirements.affinity ?? 0);
  const hasFlags = (requirements.flags ?? []).every((flag) => state.flags[flag]);

  if (!hasAffinity || !hasFlags) {
    const next = cloneState(state);
    addToast(next, "Encontro ainda bloqueado por afinidade ou evento", "warning");
    return next;
  }
  if (state.stats.ap < ENCOUNTER_AP_COST) {
    const next = cloneState(state);
    addToast(next, "AP insuficiente para iniciar o encontro", "warning");
    return next;
  }

  let next = applyEffects(
    state,
    {
      ap: -ENCOUNTER_AP_COST,
      coins: -10,
      affinity: { [characterId]: 2 },
      flags: { [`encounter_${characterId}_01`]: true },
      galleryAdd: route.rewardCg ? [route.rewardCg] : [],
      inventoryAdd: route.rewardItem ? [route.rewardItem] : []
    },
    data
  );
  const character = getCharacter(data, characterId, next);
  addToast(next, `Encontro com ${character?.name ?? characterId} registrado`, "success");
  return next;
}
