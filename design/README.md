# Pacote de handoff — Ficha de Treino

```
design/
├── README.md          este arquivo
├── CLAUDE.md          instruções para o Claude Code (copiar para a raiz do repo)
├── DESIGN.md          conceito, cores, tipografia, elevação, layout, movimento, regras
├── COMPONENTS.md      anatomia e estados de cada componente
├── tokens.json        valores exatos para código
├── screens/           PNGs 2x de cada estado + pranchas de fundamentos/componentes/animações
└── reference/         HTML executável (abrir “Ficha de Treino - Referência.dc.html” no navegador)
```

## Como usar no repositório
1. Descompacte em `design/` na raiz do projeto.
2. Mova `design/CLAUDE.md` para a raiz (ou cole o conteúdo no CLAUDE.md existente).
3. No Claude Code, comece com:

> Leia `CLAUDE.md`, `design/DESIGN.md`, `design/COMPONENTS.md` e `design/tokens.json`. Gere o tema a partir dos tokens e implemente os componentes listados, validando contra `design/screens/08-componentes.png`. Depois monte a tela principal e compare cada estado com `design/screens/01` a `06`. Para animações, siga `DESIGN.md §7` e veja `design/reference/` no navegador.

4. Trabalhe por partes (tema → componentes → tela → estados → animações) e peça uma comparação com o PNG correspondente ao final de cada etapa.
