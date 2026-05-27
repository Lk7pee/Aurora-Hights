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
- `outfit`
- `completeEpisode`

Nodes aceitos:

- `dialogue`
- `choice`
- `map`
- `cg`
- `end`
