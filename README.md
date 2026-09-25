# viniciusmarques.dev

Site pessoal de Vinícius Marques: **construção de sistemas com IA no centro do processo**, feito para vender consultoria em IA a donos e gestores de empresas brasileiras.

```bash
npm install
npm run dev       # http://127.0.0.1:5190
npm run build     # gera dist/ (o que vai para o ar)
npm run preview   # serve dist/ em http://127.0.0.1:5191
node scripts/capturas.mjs 1440 900 pc          # fotografa cada estação da matéria
node scripts/capturas.mjs 390 844 cel           # no celular
QUALIDADE=leve node scripts/capturas.mjs …      # também: parado; TEMA=claro|escuro
```

A copy, as fontes e o raciocínio estão em [`docs/copy.md`](docs/copy.md); a pesquisa completa em [`docs/pesquisa-copy.md`](docs/pesquisa-copy.md).

## A identidade: "Visto"

O motivo central é **o visto** — o V de Vinícius desenhado como a marca de quem revisa e aprova. É a tese do trabalho em um sinal: a IA faz rápido; uma pessoa confere, aprova e responde pelo que vai para produção.

| Decisão | O quê | Por quê |
|---|---|---|
| Cor | carvão `#100f0d`, papel `#eee8de` e **um** acento, o vermelhão `#ff5533` (no papel, `#b8331a` para texto) | a mesa de trabalho (papel e grafite) e o lápis vermelho de revisão. Foge do azul-e-ciano de "site de tecnologia" e do turquesa da Gênesis. O vermelhão só aparece onde algo foi "aprovado": o visto, o botão principal, o grifo, a parte acesa de cada desenho |
| Tipografia | Bricolage Grotesque (variável: peso, largura, tamanho ótico) — estreita e pesada nos títulos, larga e calma no texto; JetBrains Mono só para dado medido | uma grotesca com traço de gente (terminais irregulares), que lê como letreiro de obra nos títulos. O mono não é fantasia de "técnico": só aparece em números das fichas e no contador |
| Motivo | o visto; a frase quebrada com ↪ (a segunda linha é a virada); o grifo à mão sob a palavra-chave; a troca de seção com a borda em V | tudo sai do mesmo gesto do lápis |
| Som | um risco de grafite e o "visto": duas notas subindo uma quinta (mi → si) | a assinatura sonora; nada de som contínuo por padrão |

## A matéria

Uma massa de 9 a 22 mil partículas (na GPU) acompanha a página inteira e muda de forma a cada capítulo, junto com o texto: **visto → pilotos → a conta → pedido → aro → o sistema que a pessoa monta → mapa → camadas → semanas → agentes → rotas → casco → pagamento → voz → página → retrato → horizonte → visto**. O fim fecha o começo.

- Cada forma é **desenhada** num canvas escondido e **amostrada** (`src/materia/formas.js`): texto, traço ou foto viram forma, e ela tem acabamento de desenho, não de nuvem sorteada.
- A rolagem diz entre quais duas formas estamos; a GPU faz a mistura, o voo, o respiro, o cursor e o estiramento da rolagem (`src/materia/motor.js`). O processador só troca os buffers quando o par de formas muda.
- Subir desfaz exatamente o que descer fez. O cursor abre caminho e acende; segurar o clique abre um raio maior; rolar rápido estica a massa.
- Três qualidades no painel: **Completa** (WebGL), **Leve** (canvas 2D, ~2 mil partículas), **Parado** (sem voo; a forma seguinte aparece num esmaecer). Na primeira visita a qualidade é escolhida pelo aparelho; movimento reduzido cai em Parado; o three.js só é baixado para a Completa, e a Leve desenha enquanto ele chega.

## O que a pessoa pode fazer (não só assistir)

- **A conta** (`src/site/conta.js`): pessoas × horas por semana × 48 semanas × custo da hora. A matéria escreve o custo anual e acende a fração que a IA pode assumir — o gráfico é o próprio número. "Levar essa conta para a conversa" abre um e-mail já com os números.
- **Monte o seu sistema** (`src/site/monte.js`): a pessoa escolhe a área (financeiro, operação, comercial, atendimento) e marca, em frases do dia a dia, o que acontece ali hoje. Cada dor vira um módulo que a matéria encaixa na planta (os lugares vazios ficam tracejados). O vermelhão tem um sentido só: o visto marca o módulo em que **uma pessoa aprova**. "Ver funcionando" põe pedidos para correr pela planta, parando no visto até a aprovação. A ficha técnica (módulos, o que a IA faz, onde a pessoa aprova) vai por e-mail. Tudo por clique e por teclado; no computador a planta fica presa ao lado das escolhas.
- **Casos na horizontal** (`src/site/casos.js`): no computador a seção fica presa e as fichas passam de lado, parando em cada uma enquanto a matéria desenha o sistema dela. No celular, empilham.
- **A foto por baixo** (`src/site/retrato.js`): o retrato em partículas é o rascunho; com o mouse, uma lanterna mostra a foto real onde a pessoa olha. No toque (ou pelo botão "Ver a foto"), a foto aparece inteira.

O motor aceita formas **vivas** (`dinamicas` em `formas.js`): quando uma delas muda, `materia.morfar(caixa, formaAntiga)` anima da antiga para a nova no lugar.

## Estrutura

| Arquivo | O que faz |
|---|---|
| `index.html` | todo o texto do site (HTML de verdade: leitor de tela, busca e sem JS leem tudo) |
| `src/estilo.css` | identidade, os dois temas, a versão de celular (≤760 px) e o movimento reduzido |
| `src/main.js` | a ordem de partida |
| `src/materia/formas.js` · `motor.js` | a matéria (ver acima) |
| `src/site/carregador.js` | o contador 000 → 100 (espera fontes e retrato; nunca mente, nunca prende mais de 4 s) |
| `src/site/trocas.js` | a troca de tema entre seções, com a borda em V |
| `src/site/topo.js` | o topo: tema da seção por baixo, some ao descer, menu de celular |
| `src/site/roda.js` | a lista de "O que eu construo" com o item do meio aceso |
| `src/site/trilho.js` | as etapas presas de "Como começa" |
| `src/site/metodo.js` | a régua do Método: cada etapa ganha o visto quando a leitura passa |
| `src/site/revisar.js` | o título do início assentando como tinta; o grifo à mão nos títulos |
| `src/site/cursor.js` | o cursor-anel e os botões magnéticos (só com mouse) |
| `src/site/ajustes.js` · `src/som.js` · `src/ambiente.js` | painel de som, tema e qualidade; som sintetizado |
| `src/site/segredo.js` | o detalhe escondido: digite **jarvis** em qualquer lugar da página |
| `scripts/capturas.mjs` | capturas de conferência com o Playwright |

**Som:** o navegador só toca depois de um gesto; no celular esse gesto é o `click`, e no iPhone o site declara `navigator.audioSession.type = 'playback'`. O padrão é **Só efeitos**; o ambiente (notas soltas, com silêncio entre elas) só toca para quem escolher.

## Preservado sem mudança

`CNAME`, `negotiation-helper.html` (com `css/` e `js/`), `bio.md`, `apresentacao-*.md`, `vocabulario.md`. O build copia `CNAME`, a página de negociação, `css/`, `js/` e `img/` para `dist/` tal e qual (`vite.config.js`), e cria `.nojekyll`.

## Publicar (quando aprovar)

Hoje o GitHub Pages serve a **branch main crua**. O site novo precisa de build, então a publicação passa a ser pelo GitHub Actions (`.github/workflows/pages.yml`). **A ordem importa:**

1. No GitHub: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**. O site atual continua no ar (a última publicação vale até a próxima). Confira que o domínio `viniciusmarques.dev` segue em "Custom domain".
2. Empurre a branch e abra o PR: `git push -u origin redesign-ia` → PR para a `main`.
3. Ao juntar na `main`, o workflow builda e publica. Acompanhe em **Actions → Publicar no GitHub Pages**. Leva uns 2 minutos.
4. Para voltar atrás: reverta o merge na `main` (o workflow publica de novo) — ou rode o workflow manualmente num commit anterior.

Se juntar na `main` **sem** o passo 1, o Pages vai servir o `index.html` de desenvolvimento e o site quebra até o passo 1 ser feito.

Com a fonte em "GitHub Actions", os `.md` da raiz deixam de virar páginas (antes o Jekyll os publicava como `bio.html` etc.). Se algum link externo aponta para eles, avise antes de publicar.

## Qualidade conferida (25/09/2026)

- Detector do Impeccable: **0** achados no computador (1440×900) e no celular (390×844 e 360×800), nas duas paletas.
- Sem erro de console no computador, no celular, nas qualidades Leve e Parado e no tema só claro.
- Teclado: "Pular para o conteúdo", menu, painel de ajustes (abre, foca a opção marcada, fecha com Esc), perguntas abrindo com Enter.
