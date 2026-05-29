# Formato de save local

O jogo salva automaticamente em `localStorage` usando as chaves:

- `aurora-high.active-slot`
- `aurora-high.saves`

Cada slot contém:

- `profile`: nome, avatar, episódio atual e outfit.
- `stats`: AP, moedas e gemas.
- `affinity`: pontuação por personagem.
- `flags`: decisões e eventos desbloqueados.
- `inventory`: itens obtidos.
- `wardrobe`: roupas obtidas.
- `gallery`: CGs desbloqueadas.
- `dialogueHistory`: histórico recente.

O formato foi mantido serializável para facilitar migração futura para banco de dados.
