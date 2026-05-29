# Guia rápido para novos episódios

Crie um arquivo em `dialogues/episode-XX.json` com:

```json
{
  "id": "episode-XX",
  "startNode": "epXX_intro_01",
  "nodes": {
    "epXX_intro_01": {
      "type": "dialogue",
      "speaker": "narrator",
      "background": "atrium",
      "music": "morning",
      "text": "Texto da cena.",
      "next": "epXX_choice_01"
    },
    "epXX_choice_01": {
      "type": "choice",
      "speaker": "theo",
      "text": "Escolha uma resposta.",
      "choices": [
        {
          "label": "Responder com honestidade.",
          "next": "epXX_after_choice",
          "effects": {
            "ap": -2,
            "affinity": { "theo": 3 },
            "flags": { "honest_with_theo": true }
          }
        }
      ]
    }
  }
}
```

Efeitos aceitos:

- `ap`, `coins`, `gems`
- `affinity`
- `flags`
- `inventoryAdd`
- `wardrobeAdd`
- `galleryAdd`
- `achievementAdd`
- `outfit`
- `completeEpisode`

Para fazer escolhas antigas influenciarem falas futuras, use `variants` no node:

```json
"variants": [
  {
    "when": { "flags": ["trusted_davi"] },
    "text": "Davi percebe que você confiou nele antes e baixa a voz antes de contar a pista."
  }
]
```

Cada episódio jogável deve ter pelo menos 3 CGs desbloqueáveis em `ui/catalog.json` e no roteiro.

Nodes aceitos:

- `dialogue`
- `choice`
- `map`
- `cg`
- `end`
