# Aurora High: Ecos no Jardim

Visual novel web estática, modular e pronta para GitHub Pages. O projeto é inspirado em convenções de dating sims escolares: episódios, afinidade, AP, mapa, inventário, roupas, loja de AP, conquistas, encontros, saves locais e CGs desbloqueáveis.

Este projeto não usa assets, diálogos, personagens, textos ou interface proprietária de jogos existentes. A estrutura de gameplay é familiar ao gênero, mas a identidade visual, narrativa e dados são originais.

## Rodar localmente

Sem dependências obrigatórias:

```bash
node scripts/serve.mjs
```

Depois abra `http://localhost:4173`.

## Build estático

```bash
node scripts/build.mjs
```

O build final fica em `dist/` e pode ser hospedado no GitHub Pages.

## Publicar no GitHub Pages

O projeto inclui o workflow `.github/workflows/pages.yml`. A cada envio para
a branch `main`, o GitHub valida o conteúdo, gera `dist/` e publica o jogo.

1. Crie um repositório público no GitHub, por exemplo `aurora-high-ecos-no-jardim`.
2. Envie esta pasta para a branch `main`.
3. Em `Settings > Pages`, selecione `GitHub Actions` como origem da publicação.
4. Após a execução da action, compartilhe o link:

```text
https://SEU-USUARIO.github.io/aurora-high-ecos-no-jardim/
```

## Editar conteúdo

- `characters/characters.json`: personagens, arquétipos, perfis e sprites.
- `episodes/episodes.json`: lista, bloqueios e progresso de episódios.
- `dialogues/episode-XX.json`: roteiros, escolhas, afinidade, flags, AP, conquistas e CGs.
- `scenes/scenes.json`: cenários, mapa e músicas.
- `routes/routes.json`: encontros românticos e requisitos.
- `ui/catalog.json`: inventário, roupas, pacotes de AP, conquistas e galeria.
- `music/manifest.json`: perfis da trilha sintética e suporte futuro a arquivos.

## Arquitetura

- `src/systems`: save, engine, preload, áudio, feedback de escolhas e carregamento.
- `src/ui`: renderização componentizada.
- `assets`: imagens finais do jogo, incluindo cenários, roupas, CGs e UI.
- `save`: documentação do formato local.
- `systems/ASSET_GENERATION_RULES.md`: regra fixa para gerar cenários, roupas, personagens e CGs com base nos presaves.

Os diálogos são editáveis em JSON e aceitam personagem, expressão, fundo, música, escolhas, efeitos, flags, variações condicionais, troca de roupa e desbloqueio de CG.

## Nome oficial

Use sempre **Aurora High: Ecos no Jardim** em telas, documentação e materiais de publicação.
