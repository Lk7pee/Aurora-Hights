# Regras de geração de assets

Todo asset visual novo deve ser gerado com base nos presaves do projeto. Não usar SVGs simples ou placeholders quando o asset aparecer como cenário, roupa, personagem ou CG no jogo.

## Cenários

- Use como referência principal os arquivos em `presaves/sceness/`.
- O resultado final deve ser imagem raster (`.png`, `.jpg` ou `.jpeg`) com pintura detalhada, iluminação e composição compatíveis com os presaves.
- Novas partes do mapa devem preservar a identidade da Aurora High: arquitetura elegante, brasões, paleta azul/roxo/rosa, luz quente e profundidade para receber sprites.
- Caminho recomendado: `assets/scenes/<local>.png`.

## Roupas dos jogáveis

- Toda roupa jogável precisa ter versão feminina e masculina.
- Use `presaves/Brendap.png` como base da personagem feminina e `presaves/Lipep.png` como base do personagem masculino.
- Preserve rosto, cabelo, proporções e estilo de sprite do presave. Mude apenas roupa, acessórios e detalhes necessários.
- Caminho recomendado: `assets/outfits/brenda-<roupa>.png` e `assets/outfits/filipe-<roupa>.png`.

## Personagens e NPCs

- Novos personagens devem seguir o estilo de `presaves/npcs/` e, quando tiverem variante de gênero, seguir também `presaves/npcs/femininas/`.
- Não misturar estilo vetorial plano com sprites raster dos presaves.

## CGs e capas

- Cada episódio jogável deve ter no mínimo 3 CGs cadastradas em `ui/catalog.json`.
- CGs devem ser geradas a partir dos presaves de cenário e, quando houver personagem em cena, a partir dos presaves dos personagens envolvidos.
- Caminho recomendado: `assets/cgs/<episodio>-<momento>.png`.

## Checklist antes de entregar

- `ui/catalog.json` aponta para os PNGs finais.
- `scenes/scenes.json` aponta para cenários raster finais.
- `npm run smoke` passa.
- `npm run build` passa.
