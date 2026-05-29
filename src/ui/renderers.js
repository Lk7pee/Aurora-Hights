import { icon } from "./icons.js";
import {
  MINIGAMES,
  canFinishMap,
  canPlayEpisode,
  getCg,
  getCharacter,
  getCurrentNode,
  getMiniGameCooldownRemaining,
  getScene
} from "../systems/gameEngine.js";
import { DEFAULT_PROFILE_APPEARANCE } from "../systems/saveSystem.js";

const GAME_TITLE = "Aurora High: Ecos no Jardim";
const DEMO_NOTICE = "Esta é uma versão em desenvolvimento de Aurora High: Ecos no Jardim. Novos episódios, rotas e segredos serão adicionados em futuras atualizações.";

const viewTitles = {
  menu: "Menu principal",
  episodes: "Episódios",
  profile: "Perfil",
  inventory: "Inventário",
  wardrobe: "Guarda-roupa",
  apShop: "Loja de AP",
  achievements: "Conquistas",
  gallery: "Galeria",
  settings: "Configurações",
  credits: "Créditos",
  saves: "Saves",
  encounters: "Encontros",
  character: "Personagem",
  minigames: "Minigames"
};

const appearanceOptions = {
  presentation: [
    ["feminino", "Feminino"],
    ["masculino", "Masculino"],
    ["androgino", "Andrógino"]
  ],
  pronouns: [
    ["ela/dela", "ela/dela"],
    ["ele/dele", "ele/dele"],
    ["elu/delu", "elu/delu"]
  ],
  body: [
    ["leve", "Leve"],
    ["medio", "Médio"],
    ["forte", "Forte"]
  ],
  hairStyle: [
    ["bob", "Curto arredondado"],
    ["curto", "Curto repicado"],
    ["longo", "Longo"],
    ["ondulado", "Ondulado"]
  ],
  face: [
    ["suave", "Suave"],
    ["marcante", "Marcante"],
    ["delicado", "Delicado"]
  ],
  nose: [
    ["pequeno", "Pequeno"],
    ["reto", "Reto"],
    ["arrebitado", "Arrebitado"],
    ["suave", "Suave"]
  ],
  brows: [
    ["gentil", "Gentil"],
    ["confiante", "Confiante"],
    ["serio", "Sério"]
  ],
  mouth: [
    ["sorriso", "Sorriso"],
    ["neutro", "Neutro"],
    ["timido", "Tímido"]
  ],
  accessory: [
    ["laço azul", "Laço azul"],
    ["óculos", "Óculos"],
    ["brinco estrela", "Brinco estrela"],
    ["presilha", "Presilha"],
    ["nenhum", "Nenhum"]
  ]
};

function normalizeAppearance(appearance = {}) {
  return {
    ...DEFAULT_PROFILE_APPEARANCE,
    ...(appearance ?? {})
  };
}

function safeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value)) ? String(value) : fallback;
}

function isSelected(current, value) {
  return current === value ? "selected" : "";
}

function renderSelectField(label, name, current, options) {
  return `
    <label class="custom-field">
      <span>${escapeHtml(label)}</span>
      <select name="${escapeHtml(name)}" data-appearance="${escapeHtml(name)}">
        ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${isSelected(current, value)}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderColorField(label, name, current) {
  return `
    <label class="custom-field color-field">
      <span>${escapeHtml(label)}</span>
      <input type="color" name="${escapeHtml(name)}" data-appearance="${escapeHtml(name)}" value="${escapeHtml(current)}" />
    </label>
  `;
}

function renderAvatarPortrait(appearance = {}, size = "medium") {
  const current = normalizeAppearance(appearance);
  const skin = safeColor(current.skin, DEFAULT_PROFILE_APPEARANCE.skin);
  const hair = safeColor(current.hairColor, DEFAULT_PROFILE_APPEARANCE.hairColor);
  const eyes = safeColor(current.eyeColor, DEFAULT_PROFILE_APPEARANCE.eyeColor);
  const detail = safeColor(current.detailColor, DEFAULT_PROFILE_APPEARANCE.detailColor);
  const shoulder = current.body === "forte" ? 76 : current.body === "leve" ? 58 : 66;
  const neckWidth = current.presentation === "masculino" ? 28 : 24;
  const facePath = current.face === "marcante"
    ? "M110 58c31 0 51 25 51 57 0 36-22 59-51 62-29-3-51-26-51-62 0-32 20-57 51-57Z"
    : current.face === "delicado"
      ? "M110 59c28 0 46 24 46 55 0 34-20 57-46 60-26-3-46-26-46-60 0-31 18-55 46-55Z"
      : "M110 58c30 0 49 24 49 56 0 35-21 58-49 61-28-3-49-26-49-61 0-32 19-56 49-56Z";
  const browTilt = current.brows === "serio" ? -5 : current.brows === "confiante" ? 5 : 0;
  const mouthPath = current.mouth === "neutro"
    ? "M95 144h30"
    : current.mouth === "timido"
      ? "M94 143c8 7 23 7 32 0"
      : "M88 139c11 14 34 15 46 0";
  const nosePath = current.nose === "reto"
    ? "M112 123c-2 8-3 15-1 19 2 2 6 2 9 0"
    : current.nose === "arrebitado"
      ? "M112 124c-4 8-4 14 0 17 4 2 9 0 11-3"
      : current.nose === "suave"
        ? "M112 124c-3 7-3 13 1 16 3 2 7 1 10-1"
        : "M112 125c-3 7-3 12 1 15 3 1 6 0 8-2";
  const hairBack = current.hairStyle === "longo"
    ? `<path fill="${hair}" d="M51 82c0-35 24-56 59-56s59 21 59 56c18 41 12 101-9 140H60C39 183 33 123 51 82Z"/>`
    : current.hairStyle === "ondulado"
      ? `<path fill="${hair}" d="M50 82c-19 29-20 78-2 118 14-7 20-22 17-42 13 17 34 19 48 4 5 23 16 35 33 39 22-39 19-91-4-120-23-31-68-31-92 1Z"/>`
      : `<path fill="${hair}" d="M52 82c0-34 23-55 58-55 34 0 57 21 58 55 12 33 6 78-10 107-15-9-22-26-21-48-17 14-37 18-56 9 0 20-8 35-23 43-17-32-20-79-6-111Z"/>`;
  const hairFront = current.hairStyle === "curto"
    ? `<path fill="${hair}" d="M54 103c4-43 28-68 61-68 29 0 50 17 58 45-28 5-56-2-80-22-9 21-22 36-39 45Z"/><path fill="${hair}" d="M63 91c8 13 9 30 2 45-8-12-8-30-2-45Z"/>`
    : current.hairStyle === "longo"
      ? `<path fill="${hair}" d="M53 105c5-47 30-73 63-73 31 0 53 18 60 53-30 3-58-8-78-29-10 23-25 39-45 49Z"/><path fill="${hair}" d="M63 90c9 16 10 37 1 56-10-14-10-37-1-56Z"/>`
      : current.hairStyle === "ondulado"
        ? `<path fill="${hair}" d="M53 104c5-44 31-70 64-70 30 0 51 18 58 48-27 6-54-2-76-22-11 20-27 35-46 44Z"/><path fill="${hair}" d="M63 91c10 13 13 30 6 45-10-10-12-30-6-45Z"/>`
        : `<path fill="${hair}" d="M54 104c5-45 30-71 62-71 31 0 52 19 58 49-31 5-60-4-82-27-9 23-22 39-38 49Z"/><path fill="${hair}" d="M63 91c9 14 11 31 4 47-9-11-10-31-4-47Z"/>`;
  const accessory = current.accessory === "laço azul"
    ? `<path fill="${detail}" d="M56 70c-10-7-20-5-26 5 7 8 17 9 27 3l-1-8Zm8 0c10-7 20-5 26 5-7 8-17 9-27 3l1-8Z"/><rect x="56" y="68" width="8" height="11" rx="3" fill="${detail}"/>`
    : current.accessory === "óculos"
      ? `<g fill="none" stroke="${detail}" stroke-width="4"><rect x="67" y="103" width="28" height="19" rx="8"/><rect x="117" y="103" width="28" height="19" rx="8"/><path d="M95 112h22"/></g>`
      : current.accessory === "brinco estrela"
        ? `<path fill="${detail}" d="M52 116l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Zm104 0l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z"/>`
        : current.accessory === "presilha"
          ? `<rect x="132" y="78" width="30" height="9" rx="4" fill="${detail}"/>`
          : "";

  return `
    <svg class="avatar-portrait avatar-${escapeHtml(size)}" viewBox="24 30 172 214" role="img" aria-label="Retrato da personagem">
      <defs>
        <linearGradient id="uniform-${escapeHtml(size)}" x1="58" y1="168" x2="166" y2="250" gradientUnits="userSpaceOnUse">
          <stop stop-color="#5135a5"/><stop offset="1" stop-color="#1b1538"/>
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="244" rx="68" ry="12" fill="#05050a" opacity=".35"/>
      ${hairBack}
      <path fill="${skin}" opacity=".92" d="M62 105c-13 0-21 12-18 28 4 18 17 26 28 18l2-40c-3-4-7-6-12-6Zm96 0c13 0 21 12 18 28-4 18-17 26-28 18l-2-40c3-4 7-6 12-6Z"/>
      <path fill="${skin}" d="M${110 - neckWidth / 2} 139h${neckWidth}v33c0 10-7 18-14 18s-14-8-14-18v-33Z"/>
      <path fill="url(#uniform-${escapeHtml(size)})" d="M${110 - shoulder} 244c4-54 18-84 46-92h${shoulder * 0.54}c28 8 42 38 46 92H${110 - shoulder}Z"/>
      <path fill="#f4f7ff" d="M80 164l30 50 30-50 18 24-28 56H90l-28-56 18-24Z"/>
      <path fill="${detail}" d="M94 172h32l-16 34-16-34Z"/>
      <path fill="${skin}" d="${facePath}"/>
      ${hairFront}
      <path d="M75 ${104 + browTilt}c10-6 22-6 32 0M114 ${104 - browTilt}c10-6 22-6 32 0" fill="none" stroke="#120f1d" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="88" cy="116" rx="6" ry="8" fill="${eyes}"/>
      <ellipse cx="132" cy="116" rx="6" ry="8" fill="${eyes}"/>
      <circle cx="90" cy="113" r="2" fill="#fff"/>
      <circle cx="134" cy="113" r="2" fill="#fff"/>
      <path d="${nosePath}" fill="none" stroke="#9b655e" stroke-width="3" stroke-linecap="round" opacity=".42"/>
      <path d="${mouthPath}" fill="none" stroke="#9d5062" stroke-width="5" stroke-linecap="round"/>
      ${accessory}
    </svg>
  `;
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtDate(value) {
  if (!value) return "Vazio";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function percent(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

const ASSET_VERSION = "aurora-polish-20260528a";

function assetUrl(src = "") {
  if (!src || /^(?:https?:|data:|blob:)/.test(src) || src.includes("?")) return src;
  return `${src}?v=${ASSET_VERSION}`;
}

function assetImg(src, alt = "", className = "") {
  return `<img src="${escapeHtml(assetUrl(src))}" alt="${escapeHtml(alt)}" ${className ? `class="${escapeHtml(className)}"` : ""} />`;
}

const playerPresets = {
  feminino: {
    label: "Brenda",
    kind: "Feminino",
    pronouns: "ela/dela",
    image: "./presaves/Brendap.png",
    schoolImage: "./presaves/fardamentoP/brendaf.PNG"
  },
  masculino: {
    label: "Filipe",
    kind: "Masculino",
    pronouns: "ele/dele",
    image: "./presaves/Lipep.png",
    schoolImage: "./presaves/fardamentoP/filipef.PNG"
  }
};

function getPlayerPreset(profile = {}) {
  const gender = profile.gender === "masculino" || profile.appearance?.presentation === "masculino"
    ? "masculino"
    : "feminino";
  return { gender, ...playerPresets[gender] };
}

function getPlayerSprite(profile = {}, data = null, { forceSchool = false } = {}) {
  const preset = getPlayerPreset(profile);
  if (forceSchool || profile.uniformOutside) return preset.schoolImage;
  const outfit = data?.indexes?.outfits?.[profile.outfit];
  return outfit?.sprites?.[preset.gender] ?? (profile.outfit === "uniforme-aurora" ? preset.schoolImage : preset.image);
}

function renderPlayerPortrait(profile = {}, size = "medium", data = null) {
  const preset = getPlayerPreset(profile);
  return assetImg(getPlayerSprite(profile, data), preset.label, `player-portrait player-${size}`);
}

function getCast(state, data) {
  return data.characters.map((character) => getCharacter(data, character.id, state));
}

function sceneBackdrop(scene, timeOfDay = "day") {
  const image = timeOfDay === "night" ? scene?.nightImage : scene?.dayImage;
  return assetImg(image ?? scene?.image ?? "", "", "scene-backdrop");
}

function isCampusScene(sceneId) {
  return !["dorm", "boutique"].includes(sceneId);
}

function renderDialoguePlayerPortrait(state, data, sceneId) {
  const sprite = getPlayerSprite(state.profile, data, { forceSchool: isCampusScene(sceneId) });
  return `
    <span class="dialogue-player-portrait" title="${escapeHtml(state.profile.name)}">
      ${assetImg(sprite, state.profile.name)}
    </span>
  `;
}

function adaptStoryText(value, state, node = null) {
  let text = String(value ?? "");
  const masculinePlayer = state.profile?.gender === "masculino";
  const names = masculinePlayer
    ? { Noa: "Nina", Theo: "Thea", Ravi: "Ravena", Caio: "Clara", Miguel: "Mirela" }
    : { Davi: "Diana" };
  for (const [from, to] of Object.entries(names)) {
    text = text.replaceAll(from, to);
  }
  const variantIds = masculinePlayer ? ["noa", "theo", "ravi", "caio", "miguel"] : ["davi"];
  const variantPresent = variantIds.includes(node?.speaker) || (node?.characters ?? []).some((entry) => variantIds.includes(entry.id));
  if (variantPresent) {
    text = text
      .replaceAll("Ele ", "Ela ")
      .replaceAll(" ele ", " ela ")
      .replaceAll("dele", "dela")
      .replaceAll("garoto", "garota")
      .replaceAll("Aluno ", "Aluna ")
      .replaceAll("Monitor ", "Monitora ");
  }
  if (masculinePlayer) {
    text = text
      .replaceAll("Transferida detectada", "Transferido detectado")
      .replaceAll("aluna nova", "aluno novo")
      .replaceAll("sozinha", "sozinho")
      .replaceAll("corajosa", "corajoso");
  }
  return text;
}

function conditionMatches(condition = {}, state = {}) {
  const flags = condition.flags ?? [];
  const missingFlags = condition.missingFlags ?? [];
  const inventory = condition.inventory ?? [];
  const affinity = condition.affinity ?? {};

  return flags.every((flag) => state.flags?.[flag])
    && missingFlags.every((flag) => !state.flags?.[flag])
    && inventory.every((itemId) => state.inventory?.includes(itemId))
    && Object.entries(affinity).every(([characterId, value]) => (state.affinity?.[characterId] ?? 0) >= value);
}

function resolveNodeText(node, state) {
  const variant = (node?.variants ?? []).find((entry) => conditionMatches(entry.when, state));
  return variant?.text ?? node?.text ?? "";
}

function renderStoryText(value, state, node = null) {
  const importantTerms = [
    "fita azul",
    "observatório",
    "Clube Aurora",
    "conselho",
    "memória",
    "Helena",
    "Lavínia",
    "flor de vidro"
  ];
  let text = escapeHtml(adaptStoryText(value, state, node));
  for (const term of importantTerms) {
    const escapedTerm = escapeHtml(term);
    const pattern = new RegExp(`(${escapedTerm})`, "gi");
    text = text.replace(pattern, "<mark>$1</mark>");
  }
  return text;
}

function getNarrativeTone(node, state) {
  const text = adaptStoryText(resolveNodeText(node, state), state, node).toLowerCase();
  if (/fita azul|observat[oó]rio|mem[oó]ria|helena|lav[ií]nia|clube aurora/.test(text)) return "mystery";
  if (/m[aã]o encosta|perto|cora[cç][aã]o|sorr/.test(text)) return "romance";
  return "neutral";
}

function renderMysteryCue(node, state) {
  const text = adaptStoryText(resolveNodeText(node, state), state, node).toLowerCase();
  let cue = "";
  if (text.includes("fita azul")) cue = "A fita azul parece responder ao que foi dito.";
  else if (text.includes("observatório")) cue = "O observatório pesa no silêncio da escola.";
  else if (text.includes("helena")) cue = "O nome de Helena deixa a cena mais fria.";
  else if (text.includes("memória")) cue = "Uma memória antiga tenta atravessar a superfície.";
  else if (text.includes("conselho")) cue = "O conselho ainda está presente, mesmo quando ninguém olha.";
  if (!cue) return "";
  return `<div class="mystery-cue">${icon("star")}<span>${escapeHtml(cue)}</span></div>`;
}

function appFrame(content, state, { showToasts = true } = {}) {
  return `
    <main class="app-shell theme-${escapeHtml(state.settings?.theme ?? "claro")} ${state.settings?.reducedMotion ? "reduce-motion" : ""} ${state.settings?.textAnimation === false ? "no-text-animation" : "text-animation"} screen-${escapeHtml(state.view ?? "boot")}">
      ${content}
      ${showToasts ? renderToasts(state) : ""}
      <div class="transition-veil" aria-hidden="true"></div>
    </main>
  `;
}

function actionButton(action, label, iconName, variant = "primary", extra = "") {
  return `
    <button class="btn ${variant}" data-action="${action}" ${extra}>
      ${icon(iconName)}
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function iconButton(action, label, iconName, extra = "") {
  return `
    <button class="icon-btn" data-action="${action}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}" ${extra}>
      ${icon(iconName)}
    </button>
  `;
}

function renderToasts(state) {
  const toasts = state.ui?.toasts ?? [];
  if (!toasts.length) return "";
  return `
    <section class="toast-stack" aria-label="Notificações" aria-live="polite" aria-atomic="false">
      ${toasts
        .map(
          (toast) => `
            <button class="toast ${toast.tone}" data-action="dismiss-toast" data-toast-id="${toast.id}">
              ${icon(toast.tone === "warning" ? "lock" : toast.tone === "success" ? "check" : toast.tone === "cg" ? "image" : toast.tone === "affinity" ? "heart" : "star")}
              <span>${escapeHtml(toast.message)}</span>
            </button>
          `
        )
        .join("")}
    </section>
  `;
}

function renderHud(state, data, compact = false) {
  const outfit = data.indexes.outfits[state.profile?.outfit] ?? data.catalog.outfits[0];
  return `
    <header class="hud ${compact ? "compact" : ""}">
      <button class="profile-chip" data-action="go" data-view="profile">
        <span class="avatar-mark">${renderPlayerPortrait(state.profile, "mini", data)}</span>
        <span>
          <strong>${escapeHtml(state.profile?.name ?? "Brenda")}</strong>
          <small>${escapeHtml(outfit?.name ?? "Uniforme")}</small>
        </span>
      </button>
      <div class="hud-stat ap-stat" title="AP: energia usada para investigar locais e escolhas importantes">
        ${icon("bolt")}
        <span>AP</span>
        <strong>${state.stats.ap}/${state.stats.maxAp}</strong>
        <i style="--value:${percent(state.stats.ap, state.stats.maxAp)}%"></i>
      </div>
      <div class="hud-stat">${icon("coin")}<span>Moedas</span><strong>${state.stats.coins}</strong></div>
      <div class="hud-stat">${icon("gem")}<span>Gemas</span><strong>${state.stats.gems}</strong></div>
      <nav class="hud-actions" aria-label="Atalhos">
        ${iconButton("go", "Mapa", "map", 'data-view="episodes"')}
        ${iconButton("go", "Inventário", "bag", 'data-view="inventory"')}
        ${iconButton("go", "Guarda-roupa", "shirt", 'data-view="wardrobe"')}
        ${iconButton("go", "Saves", "save", 'data-view="saves"')}
        ${iconButton("go", "Configurações", "settings", 'data-view="settings"')}
      </nav>
    </header>
  `;
}

function renderPanelHeader(state, title, subtitle = "") {
  const cameFromStart = state.ui?.previousView === "start";
  return `
    <header class="panel-header">
      <button class="icon-btn" data-action="${cameFromStart ? "back-start" : "go"}" ${cameFromStart ? "" : 'data-view="menu"'} title="Voltar ao menu" aria-label="Voltar ao menu">
        ${icon("back")}
      </button>
      <div>
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </div>
    </header>
  `;
}

export function renderBoot(progress = 0, label = "Carregando") {
  return appFrame(
    `
      <section class="loading-screen">
        <img src="./assets/ui/logo.svg" alt="Aurora High" class="loading-logo" />
        <div class="loading-card">
          <span class="spark-ring"></span>
          <strong>${escapeHtml(label)}</strong>
          <div class="loading-bar"><i style="width:${progress}%"></i></div>
          <small>${progress}%</small>
        </div>
      </section>
    `,
    { ui: {}, settings: {} }
  );
}

export function renderApp(state, data, runtime = {}) {
  if (!state || !data) return renderBoot(runtime.progress ?? 0, runtime.label);

  const view = state.view;
  if (view === "start") return renderStart(state, runtime);
  if (view === "login") return renderLogin(state);
  if (view === "game") return renderGame(state, data);

  const content = `
    <section class="menu-screen">
      ${renderHud(state, data)}
      <div class="menu-layout">
        <aside class="menu-rail">
          <img src="./assets/ui/logo.svg" alt="Aurora High" />
          ${renderMainNav(view)}
        </aside>
        <section class="content-panel">
          ${renderView(view, state, data, runtime)}
        </section>
      </div>
    </section>
  `;
  return appFrame(content, state);
}

function renderStart(state, runtime) {
  const hasSave = Boolean(runtime.hasSave);
  return appFrame(
    `
      <section class="start-screen">
        <div class="start-backdrop"></div>
        <div class="start-content">
          <span class="demo-pill">Demo em desenvolvimento</span>
          <img src="./assets/ui/logo.svg" alt="${GAME_TITLE}" class="title-logo" />
          <h1>${GAME_TITLE}</h1>
          <p class="start-tagline">Na Aurora High, algumas memórias foram apagadas. Outras estão esperando você encontrar.</p>
          <div class="start-actions primary-actions">
            ${actionButton("new-game", "Novo Jogo", "star", "primary")}
            ${actionButton("continue-save", "Continuar", "play", "secondary", hasSave ? "" : "disabled")}
          </div>
          <div class="start-actions secondary-actions">
            ${actionButton("go", "Galeria", "image", "ghost", 'data-view="gallery"')}
            ${actionButton("go", "Conquistas", "trophy", "ghost", 'data-view="achievements"')}
            ${actionButton("go", "Créditos", "book", "ghost", 'data-view="credits"')}
            ${actionButton("go", "Configurações", "settings", "ghost", 'data-view="settings"')}
          </div>
          <div class="start-theme" aria-label="Tema da interface">
            <span>Interface</span>
            <button class="${state.settings?.theme !== "escuro" ? "active" : ""}" data-action="set-theme" data-theme="claro">Claro</button>
            <button class="${state.settings?.theme === "escuro" ? "active" : ""}" data-action="set-theme" data-theme="escuro">Escuro</button>
          </div>
          <p class="demo-copy">${DEMO_NOTICE}</p>
        </div>
        <div class="start-footer">
          <span>Visual novel escolar misteriosa</span>
          <span>Save local preservado</span>
          <span>Capítulo 1 em expansão</span>
        </div>
      </section>
    `,
    state
  );
}

function renderLogin(state) {
  return appFrame(
    `
      <section class="login-screen">
        <form class="login-card" data-form="create-profile">
          <img src="./assets/ui/logo-mark.svg" alt="" />
          <h1>Criar perfil local</h1>
          <p>Seu progresso fica salvo neste navegador e pode ser movido para um backend no futuro.</p>
          <label>
            <span>Nome da personagem</span>
            <input name="profileName" maxlength="18" autocomplete="off" placeholder="Brenda" />
          </label>
          <div class="login-actions">
            ${actionButton("back-start", "Voltar", "back", "ghost", 'type="button"')}
            <button class="btn primary" type="submit">${icon("check")}<span>Entrar</span></button>
          </div>
        </form>
      </section>
    `,
    state
  );
}

function renderMainNav(activeView) {
  const items = [
    ["menu", "Início", "home"],
    ["episodes", "Episódios", "book"],
    ["encounters", "Encontros", "heart"],
    ["character", "Personagem", "user"],
    ["profile", "Perfil", "user"],
    ["inventory", "Inventário", "bag"],
    ["wardrobe", "Roupas", "shirt"],
    ["apShop", "Loja AP", "bolt"],
    ["achievements", "Conquistas", "trophy"],
    ["minigames", "Minigames", "star"],
    ["gallery", "CGs", "image"],
    ["credits", "Créditos", "book"],
    ["saves", "Saves", "save"],
    ["settings", "Configurações", "settings"]
  ];

  return `
    <nav class="main-nav" aria-label="Menu principal">
      ${items
        .map(
          ([view, label, iconName]) => `
            <button class="${activeView === view ? "active" : ""}" data-action="go" data-view="${view}">
              ${icon(iconName)}
              <span>${escapeHtml(label)}</span>
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderView(view, state, data, runtime) {
  if (view === "menu") return renderMainMenu(state, data);
  if (view === "episodes") return renderEpisodes(state, data);
  if (view === "profile") return renderProfile(state, data);
  if (view === "character") return renderCharacterSelection(state, data);
  if (view === "inventory") return renderInventory(state, data);
  if (view === "wardrobe") return renderWardrobe(state, data);
  if (view === "apShop") return renderApShop(state, data);
  if (view === "achievements") return renderAchievements(state, data);
  if (view === "minigames") return renderMinigames(state);
  if (view === "gallery") return renderGallery(state, data);
  if (view === "credits") return renderCredits(state, data);
  if (view === "settings") return renderSettings(state);
  if (view === "saves") return renderSaves(state, runtime.saves ?? {});
  if (view === "encounters") return renderEncounters(state, data);
  return renderMainMenu(state, data);
}

function renderPhoneTips(state) {
  const tips = [
    ["AP", "AP é sua energia para investigar locais, abrir cenas de mapa e insistir em respostas difíceis."],
    ["Escolhas", "Algumas respostas mudam afinidade, pistas e lembranças que podem voltar depois."],
    ["Itens", "Pistas no inventário podem destravar cenas, CGs e rotas conforme a história avançar."],
    ["Atalhos", "Mapa, roupas, galeria e conquistas ficam no menu superior sempre que você não estiver em uma cena."]
  ];

  return `
    <section class="phone-tips" aria-label="Mensagens no celular">
      <header>
        ${icon("message")}
        <div>
          <strong>Celular</strong>
          <span>${escapeHtml(state.profile.name)}, novas notas de orientação</span>
        </div>
      </header>
      <div>
        ${tips.map(([title, text]) => `<article><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderMainMenu(state, data) {
  const completed = state.completedEpisodes.length;
  const hasActiveScene = Boolean(state.activeEpisodeId && state.currentNodeId);
  const topAffinity = [...getCast(state, data)]
    .sort((a, b) => (state.affinity[b.id] ?? 0) - (state.affinity[a.id] ?? 0))
    .slice(0, 3);

  return `
    <div class="dashboard">
      <section class="dashboard-hero">
        <div>
          <span class="eyebrow">${GAME_TITLE}</span>
          <h1>${escapeHtml(state.profile.name)}, seu mapa está piscando.</h1>
          <p>A fita azul já entrou na sua história. Agora cada pista, escolha e rota pode aproximar você da verdade que a Aurora High tentou apagar.</p>
          <div class="hero-actions">
            ${actionButton("go", hasActiveScene ? "Continuar cena" : "Jogar episódio", "play", "primary", `data-view="${hasActiveScene ? "game" : "episodes"}"`)}
            ${actionButton("go", "Ver encontros", "heart", "secondary", 'data-view="encounters"')}
          </div>
        </div>
        ${assetImg("./assets/cgs/blue-ribbon-scene.png")}
      </section>
      ${renderPhoneTips(state)}
      <section class="quick-grid">
        <button class="quick-card" data-action="go" data-view="episodes">${icon("book")}<strong>Episódios</strong><span>${completed} concluído(s)</span></button>
        <button class="quick-card" data-action="go" data-view="wardrobe">${icon("shirt")}<strong>Roupas</strong><span>${state.wardrobe.length} liberada(s)</span></button>
        <button class="quick-card" data-action="go" data-view="apShop">${icon("bolt")}<strong>Loja AP</strong><span>${state.stats.gems} diamante(s)</span></button>
        <button class="quick-card" data-action="go" data-view="achievements">${icon("trophy")}<strong>Conquistas</strong><span>${state.achievements?.length ?? 0}/${data.catalog.achievements?.length ?? 0}</span></button>
        <button class="quick-card" data-action="go" data-view="gallery">${icon("image")}<strong>CGs</strong><span>${state.gallery.length}/${data.catalog.cgs.length}</span></button>
        <button class="quick-card" data-action="go" data-view="minigames">${icon("star")}<strong>Minigames</strong><span>Recupere AP</span></button>
        <button class="quick-card" data-action="quick-save">${icon("save")}<strong>Save rápido</strong><span>Slot automático</span></button>
      </section>
      <section class="affinity-preview">
        <h2>Rotas em destaque</h2>
        <div class="mini-affinity-list">
          ${topAffinity.map((character) => renderMiniAffinity(character, state)).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderMiniAffinity(character, state) {
  const value = state.affinity[character.id] ?? 0;
  return `
    <article class="mini-affinity">
      ${assetImg(character.sprite)}
      <div>
        <strong>${escapeHtml(character.name)}</strong>
        <span>${escapeHtml(character.archetype)}</span>
        <i><b style="width:${percent(value, 20)}%"></b></i>
      </div>
      <em>${value}</em>
    </article>
  `;
}

function renderEpisodes(state, data) {
  return `
    ${renderPanelHeader(state, "Episódios", "Escolha um capítulo liberado e acompanhe sua progressão.")}
    <section class="demo-note">
      ${icon("star")}
      <p>${DEMO_NOTICE}</p>
    </section>
    <div class="episode-grid">
      ${data.episodes
        .map((episode) => {
          const hasDialogue = Boolean(data.dialogues[episode.id]);
          const playable = canPlayEpisode(state, episode) && hasDialogue;
          const completed = state.completedEpisodes.includes(episode.id);
          const locked = !playable;
          return `
            <article class="episode-card ${locked ? "locked" : ""}">
              ${assetImg(episode.cover)}
              <div>
                <span>Capítulo ${episode.chapter ?? 1} · Episódio ${episode.number}${episode.durationMinutes ? ` · ${episode.durationMinutes}+ min` : ""}</span>
                <h2>${escapeHtml(episode.title)}</h2>
                <p>${escapeHtml(episode.subtitle)}</p>
                ${episode.preview ? `<p class="episode-preview">${escapeHtml(episode.preview)}</p>` : ""}
                <footer>
                  <small>${completed ? "Concluído" : locked ? hasDialogue ? "Bloqueado" : "Em breve" : "Disponível"}</small>
                  <button class="btn ${locked ? "ghost" : "primary"}" data-action="start-episode" data-episode-id="${episode.id}" ${locked ? "disabled" : ""}>
                    ${icon(locked ? "lock" : "play")}
                    <span>${completed ? "Rejogar" : locked ? "Bloqueado" : "Começar"}</span>
                  </button>
                </footer>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProfile(state, data) {
  const outfit = data.indexes.outfits[state.profile.outfit];
  const preset = getPlayerPreset(state.profile);
  return `
    ${renderPanelHeader(state, "Perfil", "Afinidade, personagem, estilo atual e histórico da jogadora.")}
    <div class="profile-layout">
      <section class="profile-card-large">
        <div class="profile-avatar">${renderPlayerPortrait(state.profile, "profile", data)}</div>
        <h2>${escapeHtml(state.profile.name)}</h2>
        <p>${escapeHtml(outfit?.name ?? "Uniforme Aurora")} · ${escapeHtml(preset.pronouns)}</p>
        <dl>
          <div><dt>Personagem</dt><dd>${escapeHtml(preset.label)}</dd></div>
          <div><dt>AP</dt><dd>${state.stats.ap}/${state.stats.maxAp}</dd></div>
          <div><dt>Moedas</dt><dd>${state.stats.coins}</dd></div>
          <div><dt>Diamantes</dt><dd>${state.stats.gems}</dd></div>
          <div><dt>CGs</dt><dd>${state.gallery.length}/${data.catalog.cgs.length}</dd></div>
          <div><dt>Conquistas</dt><dd>${state.achievements?.length ?? 0}/${data.catalog.achievements?.length ?? 0}</dd></div>
        </dl>
        <button class="btn secondary" data-action="go" data-view="character">${icon("user")}<span>Trocar personagem</span></button>
      </section>
      <section class="affinity-board">
        <h2>Afinidade</h2>
        ${getCast(state, data).map((character) => renderAffinityRow(character, state)).join("")}
      </section>
    </div>
  `;
}

function renderCharacterSelection(state) {
  const selected = getPlayerPreset(state.profile);
  return `
    ${renderPanelHeader(state, "Escolha seu personagem", `${state.profile?.name ?? "Brenda"}, selecione quem vai representar você na história.`)}
    <form class="character-selection" data-form="choose-character">
      <div class="character-options" role="radiogroup" aria-label="Personagem">
        ${Object.entries(playerPresets)
          .map(([gender, preset]) => `
            <label class="character-option">
              <input type="radio" name="gender" value="${gender}" ${gender === selected.gender ? "checked" : ""} />
              <span class="character-option-card">
                ${assetImg(preset.image, `Personagem ${preset.label.toLowerCase()}`)}
                <strong>${preset.label}</strong>
                <small>${preset.kind} · ${preset.pronouns}</small>
              </span>
            </label>
          `)
          .join("")}
      </div>
      <footer class="character-actions">
        <button class="btn primary" type="submit">${icon("check")}<span>Confirmar e jogar</span></button>
      </footer>
    </form>
  `;
}

function renderAffinityRow(character, state) {
  const value = state.affinity[character.id] ?? 0;
  return `
    <article class="affinity-row">
      ${assetImg(character.sprite)}
      <div>
        <strong>${escapeHtml(character.name)}</strong>
        <span>${escapeHtml(character.role)}</span>
        <i><b style="width:${percent(value, 20)}%"></b></i>
      </div>
      <em>${value}</em>
    </article>
  `;
}

function renderInventory(state, data) {
  return `
    ${renderPanelHeader(state, "Inventário", "Itens de história, rota e acesso ficam aqui.")}
    <div class="item-grid">
      ${data.catalog.inventory
        .map((item) => {
          const owned = state.inventory.includes(item.id);
          return `
            <article class="item-card ${owned ? "owned" : "locked"}">
              <div class="item-icon">${icon(item.icon === "music" ? "star" : item.icon === "ticket" ? "save" : "book")}</div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.rarity)}</span>
              <p>${escapeHtml(owned ? item.description : "Ainda não encontrado.")}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderWardrobe(state, data) {
  const gender = getPlayerPreset(state.profile).gender;
  return `
    ${renderPanelHeader(state, "Guarda-roupa", "Compre, desbloqueie e equipe roupas para eventos futuros.")}
    <label class="uniform-toggle">
      <span>Na escola, o fardamento é obrigatório. Usar fardamento também fora dela.</span>
      <input type="checkbox" data-profile-setting="uniformOutside" ${state.profile.uniformOutside ? "checked" : ""} />
    </label>
    <div class="wardrobe-grid">
      ${data.catalog.outfits
        .map((outfit) => {
          const owned = state.wardrobe.includes(outfit.id);
          const equipped = state.profile.outfit === outfit.id;
          const spritePreview = outfit.sprites?.[gender];
          return `
            <article class="outfit-card ${equipped ? "equipped" : ""}">
              <div class="outfit-preview ${outfit.preview}">
                ${spritePreview
                  ? assetImg(spritePreview, outfit.name, "outfit-sprite-preview")
                  : (outfit.palette ?? []).map((color) => `<i style="background:${color}"></i>`).join("")}
              </div>
              <div>
                <strong>${escapeHtml(outfit.name)}</strong>
                <span>${escapeHtml(outfit.style)}</span>
                <p>${escapeHtml(outfit.description)}</p>
              </div>
              <footer>
                ${owned
                  ? `<button class="btn ${equipped ? "secondary" : "primary"}" data-action="equip-outfit" data-outfit-id="${outfit.id}" ${equipped ? "disabled" : ""}>${icon("shirt")}<span>${equipped ? "Equipada" : "Equipar"}</span></button>`
                  : `<button class="btn primary" data-action="buy-outfit" data-outfit-id="${outfit.id}">${icon("coin")}<span>${outfit.price ?? 0}</span></button>`}
              </footer>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderApShop(state, data) {
  const packs = data.catalog.apPacks ?? [];
  return `
    ${renderPanelHeader(state, "Loja de AP", "Troque diamantes por energia sem encher tudo de graça entre episódios.")}
    <section class="ap-shop-summary">
      <div>${icon("bolt")}<span>AP atual</span><strong>${state.stats.ap}/${state.stats.maxAp}</strong></div>
      <div>${icon("gem")}<span>Diamantes</span><strong>${state.stats.gems}</strong></div>
      <button class="btn secondary" data-action="go" data-view="minigames">${icon("star")}<span>Ganhar AP nos minigames</span></button>
    </section>
    <div class="ap-pack-grid">
      ${packs
        .map((pack) => {
          const disabled = state.stats.ap >= state.stats.maxAp || state.stats.gems < pack.gems;
          return `
            <article class="ap-pack-card">
              <div class="ap-pack-icon">${icon("bolt")}</div>
              <strong>${escapeHtml(pack.name)}</strong>
              <p>${escapeHtml(pack.description)}</p>
              <dl>
                <div><dt>Recebe</dt><dd>+${pack.ap} AP</dd></div>
                <div><dt>Custa</dt><dd>${pack.gems} diamante(s)</dd></div>
              </dl>
              <button class="btn ${disabled ? "ghost" : "primary"}" data-action="buy-ap-pack" data-pack-id="${pack.id}" ${disabled ? "disabled" : ""}>
                ${icon(disabled ? "lock" : "gem")}
                <span>${state.stats.ap >= state.stats.maxAp ? "AP cheio" : state.stats.gems < pack.gems ? "Sem diamantes" : "Comprar"}</span>
              </button>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderAchievements(state, data) {
  const unlocked = new Set(state.achievements ?? []);
  const total = data.catalog.achievements?.length ?? 0;
  return `
    ${renderPanelHeader(state, "Conquistas", "Objetivos desbloqueados por história, exploração, roupas, loja e minigames.")}
    <section class="achievement-summary">
      ${icon("trophy")}
      <div>
        <strong>${unlocked.size}/${total}</strong>
        <span>conquistas desbloqueadas</span>
      </div>
    </section>
    <div class="achievement-grid">
      ${(data.catalog.achievements ?? [])
        .map((achievement) => {
          const owned = unlocked.has(achievement.id);
          return `
            <article class="achievement-card ${owned ? "unlocked" : "locked"}">
              <div class="achievement-icon">${icon(owned ? "trophy" : "lock")}</div>
              <strong>${escapeHtml(owned ? achievement.title : "Conquista oculta")}</strong>
              <span>${escapeHtml(achievement.category)}</span>
              <p>${escapeHtml(owned ? achievement.description : achievement.hint)}</p>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderGallery(state, data) {
  const preview = data.indexes.cgs[state.ui?.galleryPreview];
  const previewUnlocked = preview && state.gallery.includes(preview.id);
  return `
    ${renderPanelHeader(state, "Galeria de CGs", "Ilustrações especiais desbloqueadas por escolhas e encontros.")}
    <section class="gallery-summary">
      ${icon("image")}
      <strong>${state.gallery.length}/${data.catalog.cgs.length}</strong>
      <span>memórias registradas</span>
    </section>
    <div class="gallery-grid">
      ${data.catalog.cgs
        .map((cg) => {
          const unlocked = state.gallery.includes(cg.id);
          return `
            <article class="cg-card ${unlocked ? "unlocked" : "locked"}">
              <button class="cg-frame" data-action="open-cg" data-cg-id="${escapeHtml(cg.id)}" ${unlocked ? "" : "disabled"}>
                ${unlocked ? assetImg(cg.image, cg.title) : `<div>${icon("lock")}<span>Bloqueada</span></div>`}
              </button>
              <strong>${escapeHtml(unlocked ? cg.title : "Memória oculta")}</strong>
              <p>${escapeHtml(unlocked ? `Episódio: ${cg.episode}` : cg.hint)}</p>
            </article>
          `;
        })
        .join("")}
    </div>
    ${previewUnlocked ? `
      <section class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(preview.title)}">
        <div class="cg-modal">
          <button class="icon-btn modal-close" data-action="close-modal" aria-label="Fechar">${icon("x")}</button>
          ${assetImg(preview.image, preview.title)}
          <footer>
            <strong>${escapeHtml(preview.title)}</strong>
            <span>${escapeHtml(preview.episode)}</span>
          </footer>
        </div>
      </section>
    ` : ""}
  `;
}

function renderCredits(state, data) {
  return `
    ${renderPanelHeader(state, "Créditos", "Informações da versão atual da demo.")}
    <section class="credits-screen">
      <div class="credits-hero">
        <img src="./assets/ui/logo.svg" alt="${GAME_TITLE}" />
        <h1>${GAME_TITLE}</h1>
        <p>${DEMO_NOTICE}</p>
      </div>
      <div class="credits-grid">
        <article>
          ${icon("star")}
          <strong>Criação e direção</strong>
          <p>Projeto local de visual novel, roteiro, sistemas e interface para a demo de Aurora High.</p>
        </article>
        <article>
          ${icon("image")}
          <strong>Arte e presaves</strong>
          <p>Assets visuais gerados e organizados a partir dos presaves aprovados do projeto.</p>
        </article>
        <article>
          ${icon("volume")}
          <strong>Áudio</strong>
          <p>Sistema Web Audio sintético preparado para música, ambiente e efeitos de interface.</p>
        </article>
        <article>
          ${icon("book")}
          <strong>Versão</strong>
          <p>Demo local v0.1.0 · Capítulo 1 em desenvolvimento · ${data.episodes.filter((episode) => data.dialogues[episode.id]).length} episódio(s) jogável(is).</p>
        </article>
      </div>
      <div class="credits-actions">
        ${actionButton("back-start", "Voltar ao menu inicial", "home", "primary")}
        ${actionButton("go", "Configurações", "settings", "ghost", 'data-view="settings"')}
      </div>
    </section>
  `;
}

function renderMinigames(state) {
  const session = state.minigames?.session;
  if (session) return renderMiniGameSession(state, session);

  return `
    ${renderPanelHeader(state, "Minigames", "Atividades rápidas recuperam AP para que a história nunca pare no meio.")}
    <div class="minigame-grid">
      ${Object.values(MINIGAMES).map((game) => {
        const seconds = Math.ceil(getMiniGameCooldownRemaining(state, game.id) / 1000);
        const description = game.id === "constellation"
          ? "Descubra a rota acendendo as estrelas da menor luz para a maior."
          : "Repita uma nova sequência de setas a cada rodada.";
        return `
          <article class="minigame-card">
            ${icon(game.id === "constellation" ? "star" : "play")}
            <h2>${escapeHtml(game.name)}</h2>
            <p>${escapeHtml(description)}</p>
            <button class="btn primary" data-action="start-minigame" data-game-id="${game.id}" ${seconds ? "disabled" : ""}>
              ${icon(seconds ? "lock" : "bolt")}
              <span>${seconds ? `Disponível em ${seconds}s` : `Jogar · +${game.ap} AP`}</span>
            </button>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function rhythmSymbol(move) {
  return {
    left: "&larr;",
    up: "&uarr;",
    right: "&rarr;",
    down: "&darr;"
  }[move] ?? move;
}

function constellationLabel(move) {
  return {
    "1": "muito suave",
    "2": "suave",
    "3": "media",
    "4": "forte",
    "5": "mais forte"
  }[move] ?? move;
}

function renderMiniGameSession(state, session) {
  const game = MINIGAMES[session.gameId];
  if (!game) return "";
  const seconds = Math.ceil(getMiniGameCooldownRemaining(state, game.id) / 1000);
  const progress = session.progress ?? 0;
  const sequence = session.sequence ?? game.sequence ?? [];

  if (session.completed) {
    return `
      ${renderPanelHeader(state, game.name, "Rodada concluída. A energia recebida já foi aplicada.")}
      <section class="minigame-result">
        ${icon("check")}
        <h2>Concluído!</h2>
        <p>Você recuperou <strong>+${session.gained ?? 0} AP</strong>.</p>
        <p>Nova tentativa liberada em <strong>${seconds}s</strong>.</p>
        <button class="btn primary" data-action="leave-minigame">${icon("back")}<span>Voltar aos minigames</span></button>
      </section>
    `;
  }

  const isConstellation = game.id === "constellation";
  return `
    ${renderPanelHeader(state, game.name, isConstellation ? "Acenda as estrelas do brilho mais suave ao mais intenso. Um erro apaga a rota." : "Repita a sequência sorteada para esta rodada.")}
    <section class="minigame-play ${isConstellation ? "constellation-game" : "rhythm-game"}">
      <header>
        <span>Progresso</span>
        <strong>${progress}/${sequence.length}</strong>
        <small>Erros: ${session.mistakes ?? 0}</small>
      </header>
      ${isConstellation
        ? `<div class="constellation-board">${(session.board ?? game.controls).map((move) => `
            <button class="constellation-node rank-${move} ${sequence.indexOf(move) < progress ? "done" : ""}" data-action="minigame-move" data-move="${move}" aria-label="Estrela de brilho ${constellationLabel(move)}">
              ${icon("star")}
            </button>
          `).join("")}</div>
          <p class="constellation-rule">Observe o tamanho e o brilho. Tocar uma estrela intensa cedo demais reinicia a tentativa.</p>`
        : `<div class="rhythm-target">${sequence.map((move, index) => `<span class="${index < progress ? "done" : index === progress ? "current" : ""}">${rhythmSymbol(move)}</span>`).join("")}</div>
           <div class="rhythm-controls">${game.controls.map((move) => `
             <button data-action="minigame-move" data-move="${move}" aria-label="Nota ${move}">${rhythmSymbol(move)}</button>
           `).join("")}</div>`}
      <button class="btn ghost" data-action="leave-minigame">${icon("back")}<span>Sair da rodada</span></button>
    </section>
  `;
}

function renderSettings(state) {
  const settings = state.settings ?? {};
  return `
    ${renderPanelHeader(state, "Configurações", "Preferências locais de interface, áudio, leitura e progresso.")}
    <div class="settings-layout">
      <section class="settings-list">
        <label class="setting-row">
          <span>${icon("star")} Tema da interface</span>
          <select data-setting="theme">
            <option value="claro" ${settings.theme !== "escuro" ? "selected" : ""}>Claro</option>
            <option value="escuro" ${settings.theme === "escuro" ? "selected" : ""}>Escuro</option>
          </select>
        </label>
        <label class="setting-row">
          <span>${icon(settings.muted ? "mute" : "volume")} Mutar tudo</span>
          <input type="checkbox" data-setting="muted" ${settings.muted ? "checked" : ""} />
        </label>
        <label class="setting-row">
          <span>${icon(settings.music ? "volume" : "mute")} Música e ambiente</span>
          <input type="checkbox" data-setting="music" ${settings.music ? "checked" : ""} />
        </label>
        <label class="setting-row">
          <span>${icon("star")} Efeitos sonoros</span>
          <input type="checkbox" data-setting="sfx" ${settings.sfx ? "checked" : ""} />
        </label>
        <label class="setting-row">
          <span>Volume da música</span>
          <input type="range" min="0" max="1" step="0.05" data-setting="musicVolume" value="${settings.musicVolume ?? 0.32}" />
        </label>
        <label class="setting-row">
          <span>Volume dos efeitos</span>
          <input type="range" min="0" max="1" step="0.05" data-setting="sfxVolume" value="${settings.sfxVolume ?? 0.45}" />
        </label>
        <label class="setting-row">
          <span>Velocidade do texto</span>
          <select data-setting="textSpeed">
            <option value="slow" ${settings.textSpeed === "slow" ? "selected" : ""}>Lenta</option>
            <option value="normal" ${settings.textSpeed !== "fast" && settings.textSpeed !== "slow" ? "selected" : ""}>Normal</option>
            <option value="fast" ${settings.textSpeed === "fast" ? "selected" : ""}>Rápida</option>
          </select>
        </label>
        <label class="setting-row">
          <span>Animação de texto</span>
          <input type="checkbox" data-setting="textAnimation" ${settings.textAnimation === false ? "" : "checked"} />
        </label>
        <label class="setting-row">
          <span>Reduzir animações</span>
          <input type="checkbox" data-setting="reducedMotion" ${settings.reducedMotion ? "checked" : ""} />
        </label>
      </section>
      <aside class="settings-actions-panel">
        <button class="btn secondary" data-action="toggle-fullscreen">${icon("maximize")}<span>Modo tela cheia</span></button>
        <button class="btn ghost" data-action="back-start">${icon("home")}<span>Voltar ao menu inicial</span></button>
        ${state.ui?.confirmReset
          ? `<div class="reset-confirm">
              <strong>Resetar progresso local?</strong>
              <p>Isso limpa todos os slots salvos neste navegador, mas mantém os arquivos do jogo.</p>
              <button class="btn primary" data-action="reset-progress">${icon("trash")}<span>Confirmar reset</span></button>
              <button class="btn ghost" data-action="cancel-reset-progress">${icon("back")}<span>Cancelar</span></button>
            </div>`
          : `<button class="btn danger" data-action="confirm-reset-progress">${icon("trash")}<span>Resetar progresso</span></button>`}
      </aside>
    </div>
  `;
}

function renderSaves(state, saves) {
  const slots = ["auto", "slot-1", "slot-2", "slot-3"];
  return `
    ${renderPanelHeader(state, "Saves", "Salve manualmente, carregue outro slot ou mantenha o autosave.")}
    <div class="save-grid">
      ${slots
        .map((slotId) => {
          const save = saves[slotId];
          const isActive = state.activeSlot === slotId;
          return `
            <article class="save-card ${isActive ? "active" : ""}">
              <header>
                <strong>${slotId === "auto" ? "Autosave" : `Slot ${slotId.split("-")[1]}`}</strong>
                <span>${fmtDate(save?.updatedAt)}</span>
              </header>
              <p>${save ? `${escapeHtml(save.summary.playerName)} - ${save.summary.ap} AP - ${save.summary.coins} moedas` : "Nenhum progresso salvo."}</p>
              <footer>
                <button class="btn primary" data-action="save-slot" data-slot-id="${slotId}">${icon("save")}<span>Salvar</span></button>
                <button class="btn secondary" data-action="load-slot" data-slot-id="${slotId}" ${save ? "" : "disabled"}>${icon("play")}<span>Carregar</span></button>
                <button class="icon-btn danger" data-action="delete-slot" data-slot-id="${slotId}" ${save && slotId !== "auto" ? "" : "disabled"} title="Excluir" aria-label="Excluir">${icon("trash")}</button>
              </footer>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderEncounters(state, data) {
  return `
    ${renderPanelHeader(state, "Encontros", "Paqueras e amizades têm eventos especiais próprios.")}
    <div class="route-grid">
      ${data.routes
        .map((route) => {
          const character = getCharacter(data, route.characterId, state);
          const affinity = state.affinity[route.characterId] ?? 0;
          const requiredAffinity = route.requirements?.affinity ?? 0;
          const hasFlags = (route.requirements?.flags ?? []).every((flag) => state.flags[flag]);
          const unlocked = affinity >= requiredAffinity && hasFlags;
          return `
            <article class="route-card ${unlocked ? "unlocked" : "locked"}">
              ${assetImg(character.sprite)}
              <div>
                <span>${escapeHtml(route.relationship === "amizade" ? "Amizade" : "Paquera")} · ${escapeHtml(character.archetype)}</span>
                <strong class="route-name">${escapeHtml(character.name)}</strong>
                <h2>${escapeHtml(adaptStoryText(route.title, state))}</h2>
                <p>${escapeHtml(adaptStoryText(route.tone, state))}</p>
                <i><b style="width:${percent(affinity, requiredAffinity || 1)}%"></b></i>
                <small>Afinidade ${affinity}/${requiredAffinity}${hasFlags ? "" : " - evento pendente"}</small>
              </div>
              <button class="btn ${unlocked ? "primary" : "ghost"}" data-action="play-encounter" data-character-id="${route.characterId}" ${unlocked ? "" : "disabled"}>
                ${icon(unlocked ? "heart" : "lock")}
                <span>${unlocked ? "Encontrar" : "Bloqueado"}</span>
              </button>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderGame(state, data) {
  const node = getCurrentNode(state, data);
  if (!node) {
    return appFrame(
      `<section class="empty-state">${actionButton("go", "Voltar ao menu", "home", "primary", 'data-view="menu"')}</section>`,
      state
    );
  }
  if (node.type === "map") return renderMapScene(state, data, node);
  if (node.type === "cg") return renderCgScene(state, data, node);
  return renderDialogueScene(state, data, node);
}

function renderStageCharacters(state, node, data) {
  return (node.characters ?? [])
    .map((entry) => {
      const character = getCharacter(data, entry.id, state);
      if (!character) return "";
      return `
        <figure class="character-sprite character-${escapeHtml(entry.id)} ${entry.position ?? "right"} ${node.speaker === entry.id ? "speaking" : ""}">
          ${assetImg(character.sprite, character.name)}
          <figcaption>${escapeHtml(character.name)}</figcaption>
        </figure>
      `;
    })
    .join("");
}

function renderDialogueScene(state, data, node) {
  const sceneId = node.background ?? state.currentBackground;
  const scene = getScene(data, sceneId);
  const speaker = node.speaker === "narrator" ? null : getCharacter(data, node.speaker, state);
  const title = node.type === "end" ? node.title ?? "Fim do episódio" : speaker?.name ?? "Narrador";
  const expression = node.expression ?? speaker?.defaultExpression ?? "";
  const hasChoices = node.type === "choice";
  const continueLabel = node.type === "end" ? "Voltar ao menu" : "Continuar";
  const tone = getNarrativeTone(node, state);
  const storyText = resolveNodeText(node, state);

  return appFrame(
    `
      <section class="game-screen tone-${tone}">
        ${sceneBackdrop(scene, node.timeOfDay)}
        ${renderHud(state, data, true)}
        <div class="scene-toolbar">
          ${iconButton("go", "Menu", "home", 'data-view="menu"')}
          ${iconButton("toggle-auto", state.ui.auto ? "Pausar auto" : "Auto", "play")}
          ${iconButton("go", "Histórico", "book", 'data-view="profile"')}
          ${iconButton("quick-save", "Save rápido", "save")}
        </div>
        <div class="scene-stage">
          ${renderStageCharacters(state, node, data)}
        </div>
        <section class="dialogue-box ${hasChoices ? "with-choices" : ""} tone-${tone}">
          ${renderToasts(state)}
          <header>
            ${renderDialoguePlayerPortrait(state, data, sceneId)}
            <strong>${escapeHtml(title)}</strong>
            ${expression ? `<span>${escapeHtml(expression.replace(/_/g, " "))}</span>` : ""}
          </header>
          <p class="dialogue-text">${renderStoryText(storyText, state, node)}</p>
          ${renderMysteryCue(node, state)}
          ${hasChoices ? `<small class="choice-hint">Algumas respostas podem aproximar ou afastar pessoas, abrir pistas ou ser lembradas depois.</small>` : ""}
          ${hasChoices
            ? `<div class="choice-list">${node.choices
                .map(
                  (choice, index) => `
                    <button class="choice-btn" data-action="choice" data-choice-index="${index}">
                      <span>${escapeHtml(adaptStoryText(choice.label, state, node))}</span>
                      ${icon("chevron")}
                    </button>
                  `
                )
                .join("")}</div>`
            : `<footer><button class="btn primary" data-action="continue-dialogue">${icon(node.type === "end" ? "home" : "chevron")}<span>${continueLabel}</span></button></footer>`}
        </section>
      </section>
    `,
    state,
    { showToasts: false }
  );
}

function renderCgScene(state, data, node) {
  const cg = getCg(data, node.cg);
  const scene = getScene(data, node.background ?? state.currentBackground);
  return appFrame(
    `
      <section class="cg-scene">
        ${sceneBackdrop(scene, node.timeOfDay)}
        ${renderHud(state, data, true)}
        <div class="cg-spotlight">
          ${assetImg(cg.image, cg.title)}
          <aside>
            <span>${escapeHtml(node.title ?? "CG desbloqueada")}</span>
            <h1>${escapeHtml(cg.title)}</h1>
            <p>${renderStoryText(resolveNodeText(node, state), state, node)}</p>
            <button class="btn primary" data-action="continue-dialogue">${icon("image")}<span>Registrar memória</span></button>
          </aside>
        </div>
      </section>
    `,
    state
  );
}

function renderMapScene(state, data, node) {
  const eventsByLocation = Object.fromEntries((node.events ?? []).map((event, index) => [event.location, { ...event, index }]));
  const finishReady = canFinishMap(state, node);
  const scene = getScene(data, node.background ?? state.currentBackground);
  const mapScenes = data.scenes.filter((scene) => scene.mapPosition);
  return appFrame(
    `
      <section class="map-screen">
        ${sceneBackdrop(scene, node.timeOfDay)}
        ${renderHud(state, data, true)}
        <div class="map-layout">
          <aside class="map-panel">
            <span class="eyebrow">Destinos do capítulo</span>
            <h1>${escapeHtml(node.title)}</h1>
            <p>${renderStoryText(resolveNodeText(node, state), state, node)}</p>
            <div class="ap-brief">
              ${icon("bolt")}
              <span>AP é a energia usada para investigar. Cada local consome AP; minigames e a loja ajudam quando ele acaba.</span>
            </div>
            ${state.flags.replaying_episode_01
              ? `<p class="replay-hint">Replay ativo: revisite a biblioteca e o terraço para desbloquear as memórias ocultas.</p>`
              : ""}
            <button class="btn ${finishReady ? "primary" : "ghost"}" data-action="finish-map" ${finishReady ? "" : "disabled"}>
              ${icon(finishReady ? "check" : "lock")}
              <span>${finishReady ? "Continuar história" : "Pistas pendentes"}</span>
            </button>
          </aside>
          <section class="campus-map" aria-label="Mapa navegável da Aurora High">
            ${assetImg("./assets/maps/campus-navigation.png", "", "campus-map-art")}
            <div class="campus-map-overlay" aria-hidden="true"></div>
            <strong class="campus-map-title">Destinos disponíveis</strong>
            ${mapScenes
              .map((scene) => {
                const event = eventsByLocation[scene.id];
                const visited = event?.onceFlag && state.flags[event.onceFlag];
                const noAp = event && state.stats.ap < event.apCost;
                return `
                  <button class="map-pin ${event ? "available" : "locked"} ${visited ? "visited" : ""} ${noAp ? "no-ap" : ""}" style="--x:${scene.mapPosition.x}%;--y:${scene.mapPosition.y}%"
                    data-action="${event ? "map-event" : "noop"}" data-event-index="${event?.index ?? ""}" ${event ? "" : "disabled"}>
                    ${icon(visited ? "check" : event ? noAp ? "bolt" : "star" : "lock")}
                    <span>${escapeHtml(scene.name)}</span>
                    ${event ? `<small>${event.apCost} AP</small>` : `<small>Bloqueado</small>`}
                  </button>
                `;
              })
              .join("")}
          </section>
          <section class="map-event-list">
            ${(node.events ?? [])
              .map((event, index) => {
                const scene = data.indexes.scenes[event.location];
                const visited = event.onceFlag && state.flags[event.onceFlag];
                return `
                  <article class="map-event ${visited ? "done" : ""}">
                    <strong>${escapeHtml(event.label)}</strong>
                    <span>${escapeHtml(scene?.name ?? event.location)} - ${event.apCost} AP${state.stats.ap < event.apCost ? " - AP insuficiente" : ""}</span>
                    <button class="btn ${visited ? "secondary" : state.stats.ap < event.apCost ? "ghost" : "primary"}" data-action="map-event" data-event-index="${index}">
                      ${icon(visited ? "check" : state.stats.ap < event.apCost ? "bolt" : "map")}
                      <span>${visited ? "Visitar novamente" : state.stats.ap < event.apCost ? "Sem AP" : "Ir"}</span>
                    </button>
                  </article>
                `;
              })
              .join("")}
          </section>
        </div>
      </section>
    `,
    state
  );
}
