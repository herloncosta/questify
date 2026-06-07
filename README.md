# Questify

> Transforma o trabalho em uma jornada. Missões, progresso e conquistas — produtividade com gamificação.

Questify é um SPA de produtividade all-in-one que transforma suas tarefas diárias em uma jornada gamificada. Gerencie tarefas, foque com Pomodoro, organize com Kanban e registre notas — tudo com XP, níveis, streaks e achievements.

## Funcionalidades

- **Tarefas** — CRUD com prioridades (alta/média/baixa), filtros, paginação e popup de edição
- **Pomodoro** — Timer foco/pausa com configuração de duração, círculo SVG e notificações
- **Kanban** — Quadro drag & drop (todo/doing/done) com paginação por coluna
- **Notas** — Grid responsivo, CRUD via popup e paginação
- **Dashboard** — Visão geral com estatísticas, XP, tasks recentes e progresso do Pomodoro
- **Gamificação** — XP por tarefa concluída e sessão Pomodoro, streak diário, achievements e níveis
- **Diagramas** — Editor de diagramas (Excalidraw) com persistência em IndexedDB
- **Tema** — Alternância light/dark com persistência em localStorage

## Stack

- **SvelteKit 5** com runes mode (`$state`, `$derived`, `$effect`)
- **TypeScript**
- **Tailwind CSS v4** (sem `tailwind.config.js` — temas via `@theme` no CSS)
- **@lucide/svelte** para ícones
- **localStorage** para persistência de dados de usuário (gamificação, tarefas, notas, tema)
- **IndexedDB** (via `idb-keyval`) para persistência de diagramas (Excalidraw)
- **ESLint** flat config + Prettier

## Estrutura

```
src/
├── lib/
│   ├── types.ts
│   ├── stores/
│   │   ├── todo.svelte.ts
│   │   ├── pomodoro.svelte.ts
│   │   ├── gamification.svelte.ts
│   │   ├── notes.svelte.ts
│   │   └── theme.svelte.ts
│   └── components/
│       ├── Dashboard.svelte
│       ├── Sidebar.svelte
│       ├── Gamification.svelte
│       ├── TodoList.svelte
│       ├── Pomodoro.svelte
│       ├── Kanban.svelte
│       ├── Diagrams.svelte
│       ├── ExcalidrawCanvas.svelte
│       └── Notes.svelte
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── layout.css
└── app.html
```

## Gamificação

| Ação                    | XP                                                        |
| ----------------------- | --------------------------------------------------------- |
| Concluir tarefa         | 25 + bônus de prioridade (alta: +10, média: +5, baixa: 0) |
| Sessão Pomodoro         | 15                                                        |
| Streak diário (≥3 dias) | 10 × streak (máx 100)                                     |
| Achievement             | 50–1000                                                   |

**Fórmula de nível:** `max(1, floor(sqrt(xp / 100)) + 1)` — nível 2 aos 100 XP, nível 3 aos 400 XP.

## Comandos

```sh
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run preview   # preview do build
npm run check     # typecheck (svelte-check)
npm run format    # prettier --write .
npm run lint      # prettier --check . && eslint .
```

## License

MIT
