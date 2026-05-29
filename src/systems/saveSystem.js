const SAVE_KEY = "aurora-high.saves";
const ACTIVE_SLOT_KEY = "aurora-high.active-slot";

export const slotIds = ["auto", "slot-1", "slot-2", "slot-3"];
export const DEFAULT_START_AP = 60;
export const DEFAULT_MAX_AP = 60;
export const DEFAULT_SETTINGS = {
  theme: "claro",
  music: true,
  sfx: true,
  muted: false,
  musicVolume: 0.32,
  sfxVolume: 0.45,
  ambienceVolume: 0.2,
  textSpeed: "normal",
  textAnimation: true,
  reducedMotion: false
};
export const DEFAULT_PROFILE_APPEARANCE = {
  presentation: "feminino",
  pronouns: "ela/dela",
  body: "medio",
  skin: "#d99d80",
  hairStyle: "bob",
  hairColor: "#2a2345",
  eyeColor: "#1e3a5f",
  face: "suave",
  nose: "pequeno",
  brows: "gentil",
  mouth: "sorriso",
  accessory: "laço azul",
  detailColor: "#70d6ff"
};

const emptySaves = () => ({
  auto: null,
  "slot-1": null,
  "slot-2": null,
  "slot-3": null
});

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAllSaves() {
  return { ...emptySaves(), ...readStorage(SAVE_KEY, emptySaves()) };
}

export function getActiveSlot() {
  return localStorage.getItem(ACTIVE_SLOT_KEY) || "auto";
}

export function setActiveSlot(slotId) {
  localStorage.setItem(ACTIVE_SLOT_KEY, slotId);
}

function sanitizeState(state) {
  return {
    ...state,
    ui: {
      ...state.ui,
      toasts: [],
      transition: false,
      loading: false
    },
    savedAt: new Date().toISOString()
  };
}

export function saveGame(slotId, state, label = "") {
  const saves = getAllSaves();
  const savedState = sanitizeState(state);
  saves[slotId] = {
    slotId,
    label: label || savedState.profile?.name || "Save local",
    updatedAt: new Date().toISOString(),
    state: savedState,
    summary: {
      playerName: savedState.profile?.name ?? "Sem perfil",
      episodeId: savedState.activeEpisodeId,
      nodeId: savedState.currentNodeId,
      ap: savedState.stats?.ap ?? 0,
      coins: savedState.stats?.coins ?? 0,
      completed: savedState.completedEpisodes?.length ?? 0
    }
  };
  writeStorage(SAVE_KEY, saves);
  setActiveSlot(slotId);
  return saves[slotId];
}

export function loadGame(slotId) {
  const save = getAllSaves()[slotId];
  if (!save?.state) return null;
  setActiveSlot(slotId);
  return save.state;
}

export function deleteSave(slotId) {
  const saves = getAllSaves();
  saves[slotId] = null;
  writeStorage(SAVE_KEY, saves);
  if (getActiveSlot() === slotId) setActiveSlot("auto");
}

export function hasAnySave() {
  return Object.values(getAllSaves()).some(Boolean);
}

export function createInitialState(profileName, characterIds) {
  return {
    version: 1,
    view: "menu",
    profile: {
      name: profileName.trim() || "Brenda",
      gender: "feminino",
      avatar: "Brendap",
      uniformOutside: false,
      createdAt: new Date().toISOString(),
      outfit: "uniforme-aurora",
      appearance: { ...DEFAULT_PROFILE_APPEARANCE }
    },
    stats: {
      ap: DEFAULT_START_AP,
      maxAp: DEFAULT_MAX_AP,
      coins: 120,
      gems: 5
    },
    affinity: Object.fromEntries(characterIds.map((id) => [id, 0])),
    flags: {},
    inventory: ["diario-lilas"],
    wardrobe: ["uniforme-aurora"],
    gallery: [],
    achievements: [],
    minigames: {
      cooldowns: {},
      lastSequences: {},
      wins: 0,
      session: null
    },
    completedEpisodes: [],
    unlockedEpisodes: ["episode-01"],
    activeEpisodeId: null,
    currentNodeId: null,
    currentBackground: "gate",
    currentMusic: "morning",
    dialogueHistory: [],
    system: {
      appliedNodeEffects: []
    },
    ui: {
      previousView: "menu",
      auto: false,
      toasts: [],
      loading: false,
      transition: false,
      mapPulse: null
    },
    settings: { ...DEFAULT_SETTINGS },
    activeSlot: "auto"
  };
}
