import { loadGameData, createDataIndexes } from "./systems/contentLoader.js";
import { collectAssetUrls, preloadImages } from "./systems/preloadSystem.js";
import {
  createInitialState,
  DEFAULT_PROFILE_APPEARANCE,
  DEFAULT_SETTINGS,
  DEFAULT_MAX_AP,
  deleteSave,
  getActiveSlot,
  getAllSaves,
  hasAnySave,
  loadGame,
  saveGame,
  slotIds,
  setActiveSlot
} from "./systems/saveSystem.js";
import {
  buyApPack,
  buyOutfit,
  chooseOption,
  continueNode,
  dismissToast,
  equipOutfit,
  finishMap,
  getCurrentNode,
  leaveMiniGame,
  playMiniGameMove,
  playEncounter,
  startMiniGame,
  startEpisode,
  travelToMapEvent
} from "./systems/gameEngine.js";
import { AudioSystem } from "./systems/audioSystem.js";
import { renderApp, renderBoot } from "./ui/renderers.js";

const root = document.querySelector("#app");
const audio = new AudioSystem();

let data = null;
let state = null;
let autoTimer = null;
const toastTimers = new Map();
const TOAST_LIFETIME_MS = 3600;
const PLAYER_PRESETS = {
  feminino: { avatar: "Brendap", pronouns: "ela/dela" },
  masculino: { avatar: "Lipep", pronouns: "ele/dele" }
};
let renderRuntime = {
  progress: 0,
  label: "Carregando dados",
  saves: {},
  hasSave: false
};

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function addToast(nextState, message, tone = "info") {
  nextState.ui.toasts = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message,
      tone
    },
    ...(nextState.ui.toasts ?? [])
  ].slice(0, 4);
  return nextState;
}

function shouldPersist(nextState) {
  return Boolean(nextState?.profile) && !["start", "login"].includes(nextState.view);
}

function normalizeAppearance(appearance = {}) {
  return {
    ...DEFAULT_PROFILE_APPEARANCE,
    ...(appearance ?? {})
  };
}

function applyPlayerPreset(profile = {}, requestedGender = "feminino") {
  const gender = requestedGender === "masculino" ? "masculino" : "feminino";
  const preset = PLAYER_PRESETS[gender];
  return {
    ...profile,
    gender,
    avatar: preset.avatar,
    uniformOutside: Boolean(profile.uniformOutside),
    appearance: {
      ...normalizeAppearance(profile.appearance),
      presentation: gender,
      pronouns: preset.pronouns
    }
  };
}

function refreshRuntime() {
  renderRuntime.saves = getAllSaves();
  renderRuntime.hasSave = hasAnySave();
}

function persist(nextState) {
  if (!shouldPersist(nextState)) return;
  const slotId = nextState.activeSlot || getActiveSlot() || "auto";
  saveGame(slotId, nextState);
  nextState.activeSlot = slotId;
  refreshRuntime();
}

function setState(updater, options = {}) {
  const previous = state;
  const nextState = typeof updater === "function" ? updater(clone(previous)) : updater;
  state = nextState;
  if (options.persist !== false) persist(state);
  render();
  if (options.sfx) audio.playSfx(options.sfx);
}

function findBestSave() {
  const activeSlot = getActiveSlot();
  const active = loadGame(activeSlot);
  if (active) return { slotId: activeSlot, state: active };

  const saves = getAllSaves();
  for (const [slotId, save] of Object.entries(saves)) {
    if (save?.state) {
      setActiveSlot(slotId);
      return { slotId, state: save.state };
    }
  }
  return null;
}

function normalizeLoadedSave(save, view = null) {
  const loaded = clone(save.state);
  const previousMaxAp = loaded.stats?.maxAp ?? 0;
  if (previousMaxAp < DEFAULT_MAX_AP) {
    loaded.stats = {
      ...loaded.stats,
      ap: Math.min(DEFAULT_MAX_AP, (loaded.stats?.ap ?? 0) + (DEFAULT_MAX_AP - previousMaxAp)),
      maxAp: DEFAULT_MAX_AP
    };
  }
  loaded.activeSlot = save.slotId;
  const gender = loaded.profile?.gender === "masculino" || loaded.profile?.appearance?.presentation === "masculino"
    ? "masculino"
    : "feminino";
  loaded.profile = applyPlayerPreset(loaded.profile, gender);
  loaded.settings = {
    ...DEFAULT_SETTINGS,
    ...(loaded.settings ?? {})
  };
  loaded.minigames = {
    cooldowns: { ...(loaded.minigames?.cooldowns ?? {}) },
    lastSequences: { ...(loaded.minigames?.lastSequences ?? {}) },
    wins: loaded.minigames?.wins ?? 0,
    session: null
  };
  loaded.achievements = loaded.achievements ?? [];
  const targetView = view ?? (loaded.view === "start" || loaded.view === "login" ? "menu" : loaded.view || "menu");
  loaded.view = targetView === "customize" ? "character" : targetView;
  loaded.ui = {
    ...(loaded.ui ?? {}),
    previousView: loaded.view,
    auto: false,
    toasts: [],
    loading: false,
    transition: false,
    mapPulse: null,
    galleryPreview: null,
    confirmReset: false
  };
  return loaded;
}

function getAmbienceForState(currentState) {
  if (!currentState || currentState.view === "start") return "school-night";
  if (["menu", "episodes", "gallery", "achievements", "settings", "credits"].includes(currentState.view)) return "school-hall";

  const sceneId = currentState.currentBackground;
  if (sceneId === "terrace" || sceneId === "observatory") return "wind";
  if (sceneId === "library" || sceneId === "archive") return "library";
  if (sceneId === "garden" || sceneId === "courtyard") return "rain";
  if (sceneId === "gate" || sceneId === "corridor" || sceneId === "atrium") return "school-hall";
  return null;
}

function syncToastTimers() {
  if (!state?.ui) return;
  const visibleIds = new Set((state.ui.toasts ?? []).map((toast) => toast.id));

  for (const [toastId, timerId] of toastTimers.entries()) {
    if (!visibleIds.has(toastId)) {
      window.clearTimeout(timerId);
      toastTimers.delete(toastId);
    }
  }

  for (const toastId of visibleIds) {
    if (toastTimers.has(toastId)) continue;
    const timerId = window.setTimeout(() => {
      toastTimers.delete(toastId);
      setState((current) => dismissToast(current, toastId), { persist: false });
    }, TOAST_LIFETIME_MS);
    toastTimers.set(toastId, timerId);
  }
}

function render() {
  if (!root) return;
  refreshRuntime();
  root.innerHTML = data && state ? renderApp(state, data, renderRuntime) : renderBoot(renderRuntime.progress, renderRuntime.label);

  if (state?.settings) audio.applySettings(state.settings);
  const trackId = state?.currentMusic ?? (state?.view === "menu" ? "room" : "morning");
  const track = data?.indexes?.tracks?.[trackId];
  if (track) audio.playMusic(track);
  audio.playAmbience(getAmbienceForState(state));

  clearTimeout(autoTimer);
  const node = data && state ? getCurrentNode(state, data) : null;
  if (state?.ui?.auto && node?.type === "dialogue") {
    const autoDelay = {
      slow: 3400,
      normal: 2200,
      fast: 1300
    }[state.settings.textSpeed] ?? 2200;
    autoTimer = window.setTimeout(() => {
      setState((current) => continueNode(current, data), { sfx: "page" });
    }, autoDelay);
  }
  syncToastTimers();
}

function updateSetting(input) {
  audio.unlock(state?.settings);
  const key = input.dataset.setting;
  const value = input.type === "checkbox" ? input.checked : input.type === "range" ? Number(input.value) : input.value;
  setState((current) => ({
    ...current,
    settings: {
      ...current.settings,
      [key]: value
    }
  }), { sfx: "click" });
}

function updateProfileSetting(input) {
  const key = input.dataset.profileSetting;
  const value = input.type === "checkbox" ? input.checked : input.value;
  setState((current) => ({
    ...current,
    profile: {
      ...current.profile,
      [key]: value
    }
  }), { sfx: "click" });
}

function goToView(view) {
  setState((current) => ({
    ...current,
    view,
    ui: {
      ...current.ui,
      previousView: current.view,
      auto: false
    }
  }), { sfx: "page" });
}

function handleAction(button) {
  if (!button || button.disabled) return;
  audio.unlock(state?.settings);

  const action = button.dataset.action;
  switch (action) {
    case "noop":
      return;
    case "dismiss-toast":
      setState((current) => dismissToast(current, button.dataset.toastId), { persist: false });
      return;
    case "new-game":
      setState(() => {
        const next = createInitialState("Brenda", data.characters.map((character) => character.id));
        next.settings = { ...DEFAULT_SETTINGS, ...(state.settings ?? {}) };
        next.view = "login";
        return next;
      }, { persist: false, sfx: "page" });
      return;
    case "back-start":
      setState((current) => ({ ...current, view: "start" }), { persist: false, sfx: "page" });
      return;
    case "continue-save": {
      const save = findBestSave();
      if (!save) return;
      const loaded = normalizeLoadedSave(save);
      loaded.settings = { ...DEFAULT_SETTINGS, ...(loaded.settings ?? {}), theme: state.settings.theme };
      setState(loaded, { sfx: "success" });
      return;
    }
    case "go-start-load": {
      const save = findBestSave();
      if (!save) return;
      setState(normalizeLoadedSave(save, "saves"), { sfx: "page" });
      return;
    }
    case "go":
      goToView(button.dataset.view || "menu");
      return;
    case "open-cg":
      setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          galleryPreview: button.dataset.cgId
        }
      }), { persist: false, sfx: "page" });
      return;
    case "close-modal":
      setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          galleryPreview: null,
          confirmReset: false
        }
      }), { persist: false, sfx: "click" });
      return;
    case "toggle-fullscreen":
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setState((current) => addToast(current, "Modo tela cheia alternado", "info"), { persist: false, sfx: "menu" });
      return;
    case "confirm-reset-progress":
      setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          confirmReset: true
        }
      }), { persist: false, sfx: "warning" });
      return;
    case "cancel-reset-progress":
      setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          confirmReset: false
        }
      }), { persist: false, sfx: "click" });
      return;
    case "reset-progress":
      for (const slotId of slotIds) deleteSave(slotId);
      setActiveSlot("auto");
      setState((current) => {
        const next = createInitialState(current.profile?.name ?? "Brenda", data.characters.map((character) => character.id));
        next.settings = { ...DEFAULT_SETTINGS, ...(current.settings ?? {}) };
        next.profile = applyPlayerPreset(next.profile, current.profile?.gender ?? "feminino");
        next.view = "start";
        next.ui.toasts = [];
        return addToast(next, "Progresso local reiniciado", "success");
      }, { persist: false, sfx: "success" });
      return;
    case "quick-save":
      setState((current) => addToast(current, "Progresso salvo no slot automático", "success"), { sfx: "success" });
      return;
    case "start-episode":
      setState((current) => {
        const episodeId = button.dataset.episodeId;
        if (!data.dialogues[episodeId]) {
          return addToast(current, "Este episódio está preparado, mas o roteiro ainda não foi criado.", "warning");
        }
        return startEpisode(current, episodeId, data);
      }, { sfx: "page" });
      return;
    case "continue-dialogue":
      setState((current) => continueNode(current, data), { sfx: "page" });
      return;
    case "choice":
      setState((current) => chooseOption(current, Number(button.dataset.choiceIndex), data), { sfx: "choice" });
      return;
    case "map-event":
      setState((current) => travelToMapEvent(current, Number(button.dataset.eventIndex), data), { sfx: "page" });
      return;
    case "finish-map":
      setState((current) => finishMap(current, data), { sfx: "success" });
      return;
    case "equip-outfit":
      setState((current) => equipOutfit(current, button.dataset.outfitId, data), { sfx: "success" });
      return;
    case "buy-outfit":
      setState((current) => buyOutfit(current, button.dataset.outfitId, data), { sfx: "coin" });
      return;
    case "buy-ap-pack":
      setState((current) => buyApPack(current, button.dataset.packId, data), { sfx: "coin" });
      return;
    case "start-minigame":
      setState((current) => startMiniGame(current, button.dataset.gameId), { sfx: "page" });
      return;
    case "minigame-move":
      setState((current) => playMiniGameMove(current, button.dataset.move, data), { sfx: "click" });
      return;
    case "leave-minigame":
      setState((current) => leaveMiniGame(current), { sfx: "page" });
      return;
    case "play-encounter":
      setState((current) => playEncounter(current, button.dataset.characterId, data), { sfx: "heart" });
      return;
    case "save-slot": {
      const slotId = button.dataset.slotId;
      setState((current) => {
        current.activeSlot = slotId;
        setActiveSlot(slotId);
        return addToast(current, `Salvo em ${slotId === "auto" ? "Autosave" : slotId}`, "success");
      }, { sfx: "success" });
      return;
    }
    case "load-slot": {
      const slotId = button.dataset.slotId;
      const loaded = loadGame(slotId);
      if (!loaded) return;
      setState(normalizeLoadedSave({ slotId, state: loaded }), { sfx: "success" });
      return;
    }
    case "delete-slot": {
      const slotId = button.dataset.slotId;
      deleteSave(slotId);
      setState((current) => addToast(current, "Slot excluído", "warning"), { persist: false, sfx: "warning" });
      return;
    }
    case "toggle-auto":
      setState((current) => ({
        ...current,
        ui: {
          ...current.ui,
          auto: !current.ui.auto
        }
      }), { sfx: "click" });
      return;
    case "set-theme":
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          theme: button.dataset.theme === "escuro" ? "escuro" : "claro"
        }
      }), { persist: false, sfx: "click" });
      return;
    default:
      return;
  }
}

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  handleAction(button);
});

root.addEventListener("change", (event) => {
  const input = event.target.closest("[data-setting]");
  if (input) updateSetting(input);
  const profileInput = event.target.closest("[data-profile-setting]");
  if (profileInput) updateProfileSetting(profileInput);
});

root.addEventListener("input", (event) => {
  const input = event.target.closest('input[type="range"][data-setting]');
  if (input) updateSetting(input);
});

root.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form='create-profile']");
  const characterForm = event.target.closest("[data-form='choose-character']");
  if (!form && !characterForm) return;
  event.preventDefault();
  audio.unlock(state?.settings);

  if (characterForm) {
    const formData = new FormData(characterForm);
    const gender = String(formData.get("gender") || "feminino");
    setState((current) => ({
      ...current,
      view: "menu",
      profile: applyPlayerPreset(current.profile, gender),
      ui: {
        ...current.ui,
        previousView: "character"
      }
    }), { sfx: "success" });
    return;
  }

  const formData = new FormData(form);
  const name = String(formData.get("profileName") || "Brenda");
  const next = createInitialState(name, data.characters.map((character) => character.id));
  next.settings = { ...DEFAULT_SETTINGS, ...(state.settings ?? {}) };
  next.view = "character";
  next.activeSlot = "auto";
  setActiveSlot("auto");
  saveGame("auto", next);
  setState(next, { sfx: "success" });
});

window.addEventListener("beforeunload", () => {
  if (state && shouldPersist(state)) persist(state);
});

window.setInterval(() => {
  if (state?.view !== "minigames" || (state.minigames?.session && !state.minigames.session.completed)) return;

  const cooldowns = Object.values(state.minigames?.cooldowns ?? {});
  const countdownRunning = cooldowns.some((expiresAt) => expiresAt > Date.now());
  const waitingButton = root.querySelector('.minigame-card [data-action="start-minigame"][disabled]');
  const completedGameId = state.minigames?.session?.completed ? state.minigames.session.gameId : null;
  const justFinishedCountdown = completedGameId
    ? (state.minigames.cooldowns?.[completedGameId] ?? 0) >= Date.now() - 1000
    : false;

  if (countdownRunning || waitingButton || justFinishedCountdown) {
    render();
  }
}, 1000);

async function bootstrap() {
  root.innerHTML = renderBoot(0, "Carregando dados");
  data = await loadGameData();
  data.indexes = createDataIndexes(data);

  const shell = createInitialState("Brenda", data.characters.map((character) => character.id));
  shell.view = "start";
  shell.ui.toasts = [];
  state = shell;

  renderRuntime.label = "Carregando imagens";
  render();
  await preloadImages(collectAssetUrls(data), (progress) => {
    renderRuntime.progress = progress;
    render();
  });

  const save = findBestSave();
  if (save) {
    const startState = normalizeLoadedSave(save, "start");
    startState.ui.toasts = [];
    state = startState;
  }
  renderRuntime.progress = 100;
  render();
}

bootstrap().catch((error) => {
  console.error(error);
  root.innerHTML = `
    <main class="app-shell">
      <section class="empty-state">
        <h1>Não foi possível iniciar o jogo</h1>
        <p>${error.message}</p>
      </section>
    </main>
  `;
});
