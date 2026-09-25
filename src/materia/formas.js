// As formas que a matéria assume ao longo da página.
//
// Toda forma é DESENHADA num canvas escondido, do tamanho da caixa que ela
// ocupa na tela, e depois AMOSTRADA: cada partícula cai num pixel pintado.
// Desenhar em vez de calcular coordenadas à mão tem duas vantagens: qualquer
// coisa que o canvas desenha vira forma (texto, traço, foto) e a forma tem a
// espessura e o acabamento de um desenho, não de uma nuvem "gerada".
//
// Convenção de cor no canvas escondido:
//   branco  → partícula comum (a matéria)
//   vermelho puro → partícula acesa (o vermelhão do visto)
//   o canal azul, quando existe, vira o TAMANHO da partícula (retrato)
//
// Cada forma devolve, para N partículas:
//   pos  Float32Array(N*2)  — posição relativa ao canto da caixa, em px
//   luz  Float32Array(N)    — 0 comum, 1 acesa
//   tam  Float32Array(N)    — multiplicador do tamanho
//   osc  Float32Array(N*3)  — oscilação própria (ax, ay, fase): a forma "vive"
//                              (a onda da voz, o pulso do radar)
// E as partículas vêm ORDENADAS numa varredura diagonal, para que a
// partícula i de uma forma case com a partícula i da seguinte: a troca vira
// um fluxo da esquerda para a direita, como uma leitura, e não uma explosão.

const cache = new Map();
export function esquecerFormas() {
  cache.clear();
}

// um gerador pseudoaleatório com semente: a mesma forma sai sempre igual
// (sem isso, cada nova medida da página faria a forma "tremer")
function sorteador(semente = 1) {
  let s = semente >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const telaOculta = typeof document !== 'undefined' ? document.createElement('canvas') : null;

// desenha e amostra. `desenhar(ctx, w, h)` pinta na escala da caixa.
export function amostrar(chave, w, h, n, desenhar, { resolucao = 360, semente = 7, oscilar = null, pesoPorTom = false } = {}) {
  const k = `${chave}|${Math.round(w)}|${Math.round(h)}|${n}`;
  if (cache.has(k)) return cache.get(k);
  // a forma é desenhada numa resolução fixa (rápido) e escalada de volta
  const esc = Math.min(1, resolucao / Math.max(w, h));
  const cw = Math.max(8, Math.round(w * esc));
  const ch = Math.max(8, Math.round(h * esc));
  telaOculta.width = cw;
  telaOculta.height = ch;
  const ctx = telaOculta.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, cw, ch);
  ctx.save();
  ctx.scale(esc, esc);
  desenhar(ctx, w, h);
  ctx.restore();
  const dados = ctx.getImageData(0, 0, cw, ch).data;

  // candidatos: cada pixel pintado, com o peso de ser escolhido
  const cand = [];
  const pesos = [];
  let soma = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4;
      const a = dados[i + 3];
      if (a < 90) continue;
      const r = dados[i];
      const g = dados[i + 1];
      const b = dados[i + 2];
      const peso = pesoPorTom ? a / 255 : 1;
      cand.push(x, y, r > 180 && g < 90 ? 1 : 0, b / 255);
      soma += peso;
      pesos.push(soma);
    }
  }
  const total = pesos.length;
  const pos = new Float32Array(n * 2);
  const luz = new Float32Array(n);
  const tam = new Float32Array(n);
  const osc = new Float32Array(n * 3);
  const rnd = sorteador(semente);
  const pts = [];
  for (let j = 0; j < n; j++) {
    let c = 0;
    if (!total) {
      pts.push({ x: w / 2, y: h / 2, l: 0, t: 0 });
      continue;
    }
    if (pesoPorTom) {
      // busca binária na soma acumulada: mais tom, mais chance
      const alvo = rnd() * soma;
      let a = 0;
      let b = total - 1;
      while (a < b) {
        const m = (a + b) >> 1;
        if (pesos[m] < alvo) a = m + 1;
        else b = m;
      }
      c = a;
    } else c = Math.floor(rnd() * total);
    const x = (cand[c * 4] + rnd()) / esc;
    const y = (cand[c * 4 + 1] + rnd()) / esc;
    pts.push({ x, y, l: cand[c * 4 + 2], t: pesoPorTom ? cand[c * 4 + 3] : 1 });
  }
  // a varredura diagonal (ver o topo do arquivo)
  pts.sort((p, q) => p.x + p.y * 0.35 - (q.x + q.y * 0.35));
  for (let j = 0; j < n; j++) {
    const p = pts[j];
    pos[j * 2] = p.x;
    pos[j * 2 + 1] = p.y;
    luz[j] = p.l;
    tam[j] = pesoPorTom ? 0.35 + p.t * 1.25 : 1;
    if (oscilar) {
      const [ax, ay, fase] = oscilar(p.x, p.y, w, h, rnd);
      osc[j * 3] = ax;
      osc[j * 3 + 1] = ay;
      osc[j * 3 + 2] = fase;
    }
  }
  const forma = { pos, luz, tam, osc, w, h };
  cache.set(k, forma);
  if (cache.size > 60) cache.delete(cache.keys().next().value);
  return forma;
}

export const BRANCO = '#fff';
export const ACESO = '#f00';

// ---------------------------------------------------------------------------
// O VISTO: o V de Vinícius desenhado como o visto de quem revisa — braço
// curto à esquerda, braço longo à direita. É o motivo do site inteiro.
// Proporção fixa: a caixa só dá a escala.
export function caminhoVisto(w, h) {
  const lado = Math.min(w, h * 1.18);
  const ox = (w - lado) / 2;
  const oy = (h - lado / 1.18) / 2;
  const P = (x, y) => [ox + x * lado, oy + y * lado];
  return { a: P(0.08, 0.48), b: P(0.36, 0.76), c: P(0.94, 0.08), traco: lado * 0.13 };
}

export function formaVisto(w, h, n, { aceso = 'tudo' } = {}) {
  return amostrar(`visto-${aceso}`, w, h, n, (ctx) => {
    const { a, b, c, traco } = caminhoVisto(w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = traco;
    ctx.strokeStyle = aceso === 'tudo' ? ACESO : BRANCO;
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.stroke();
    if (aceso === 'ponta') {
      // só o fim do braço longo aceso: o visto "sendo dado"
      ctx.strokeStyle = ACESO;
      ctx.beginPath();
      ctx.moveTo(b[0] + (c[0] - b[0]) * 0.72, b[1] + (c[1] - b[1]) * 0.72);
      ctx.lineTo(...c);
      ctx.stroke();
    }
  }, { semente: 11 });
}

// ---------------------------------------------------------------------------
// A POEIRA: matéria solta, sem forma — o "antes" de qualquer projeto.
// Não é ruído uniforme: são correntes, como fumaça parada no ar.
export function formaPoeira(w, h, n) {
  return amostrar('poeira', w, h, n, (ctx) => {
    const rnd = sorteador(3);
    ctx.fillStyle = BRANCO;
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = 20 + rnd() * Math.min(w, h) * 0.22;
      ctx.globalAlpha = 0.5 + rnd() * 0.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r * (1.4 + rnd()), r * 0.5, rnd() * 0.6 - 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = ACESO;
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.42, Math.min(w, h) * 0.018, 0, Math.PI * 2);
    ctx.fill();
  }, { oscilar: (x, y, w, h, r) => [4 + r() * 10, 3 + r() * 8, r() * 6.28], resolucao: 240 });
}

// ---------------------------------------------------------------------------
// OS PILOTOS: vinte provas de conceito lado a lado. Dezenove se desfazem
// (partículas espalhadas, apagadas); uma fica inteira e acesa — a que chegou
// à operação. É a leitura do dado que o texto cita ao lado.
export function formaPilotos(w, h, n) {
  return amostrar('pilotos', w, h, n, (ctx) => {
    const col = w > h * 1.1 ? 5 : 4;
    const lin = Math.ceil(20 / col);
    const gap = Math.min(w / col, h / lin) * 0.2;
    const lado = Math.min((w - gap * (col - 1)) / col, (h - gap * (lin - 1)) / lin);
    const ox = (w - (lado * col + gap * (col - 1))) / 2;
    const oy = (h - (lado * lin + gap * (lin - 1))) / 2;
    const rnd = sorteador(5);
    const vivo = col === 5 ? 13 : 13;
    for (let i = 0; i < 20; i++) {
      const x = ox + (i % col) * (lado + gap);
      const y = oy + Math.floor(i / col) * (lado + gap);
      if (i === vivo) {
        ctx.fillStyle = ACESO;
        ctx.fillRect(x, y, lado, lado);
        continue;
      }
      // o piloto que morreu: só o contorno, com falhas, e alguns grãos caindo
      ctx.strokeStyle = BRANCO;
      ctx.lineWidth = Math.max(2, lado * 0.06);
      ctx.setLineDash([lado * (0.15 + rnd() * 0.2), lado * (0.08 + rnd() * 0.25)]);
      ctx.lineDashOffset = rnd() * lado;
      ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, lado - ctx.lineWidth, lado - ctx.lineWidth);
      ctx.setLineDash([]);
      ctx.fillStyle = BRANCO;
      for (let g = 0; g < 5; g++) {
        const gx = x + rnd() * lado;
        const gy = y + lado + rnd() * gap * 0.9;
        ctx.fillRect(gx, gy, 2.5, 2.5);
      }
    }
  }, { semente: 17 });
}

// ---------------------------------------------------------------------------
// DO PEDIDO AO SISTEMA: uma linha de texto (o pedido, em traços de palavra)
// que à direita já é uma tela com menu, cabeçalho e módulos. Desenho de
// processo, não uma interface inventada.
export function formaPedido(w, h, n) {
  return amostrar('pedido', w, h, n, (ctx) => {
    ctx.fillStyle = BRANCO;
    const rnd = sorteador(9);
    // à esquerda: três linhas de "palavras"
    const x0 = w * 0.02;
    const lw = w * 0.34;
    for (let l = 0; l < 3; l++) {
      let x = x0;
      const y = h * (0.36 + l * 0.12);
      const fim = x0 + lw * (l === 2 ? 0.6 : 1);
      while (x < fim) {
        const pw = Math.min(fim - x, 18 + rnd() * 50);
        ctx.fillRect(x, y, pw, h * 0.045);
        x += pw + 10;
      }
    }
    // a seta de passagem
    ctx.fillStyle = ACESO;
    const ay = h * 0.48;
    ctx.fillRect(w * 0.41, ay - 2, w * 0.1, 4);
    ctx.beginPath();
    ctx.moveTo(w * 0.53, ay);
    ctx.lineTo(w * 0.505, ay - 12);
    ctx.lineTo(w * 0.505, ay + 12);
    ctx.fill();
    // à direita: a tela do sistema
    const sx = w * 0.58;
    const sw = w * 0.4;
    const sy = h * 0.14;
    const sh = h * 0.72;
    ctx.fillStyle = BRANCO;
    ctx.lineWidth = 5;
    ctx.strokeStyle = BRANCO;
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillRect(sx, sy, sw * 0.2, sh);
    ctx.fillRect(sx + sw * 0.26, sy + sh * 0.08, sw * 0.68, sh * 0.08);
    for (let i = 0; i < 4; i++) {
      const bx = sx + sw * (0.26 + (i % 2) * 0.36);
      const by = sy + sh * (0.24 + Math.floor(i / 2) * 0.36);
      ctx.strokeRect(bx, by, sw * 0.32, sh * 0.3);
    }
  }, { semente: 19 });
}

// ---------------------------------------------------------------------------
// OFERTA — três desenhos, um por etapa
// Diagnóstico: o mapa da operação — anéis concêntricos com os processos como
// pontos; um deles aceso (onde a IA paga a conta primeiro).
export function formaMapa(w, h, n) {
  return amostrar('mapa', w, h, n, (ctx) => {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.46;
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = 3;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    const rnd = sorteador(21);
    ctx.fillStyle = BRANCO;
    for (let i = 0; i < 14; i++) {
      const ang = rnd() * Math.PI * 2;
      const r = R * (0.2 + rnd() * 0.78);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ACESO;
    ctx.beginPath();
    ctx.arc(cx + R * 0.42, cy - R * 0.3, 16, 0, Math.PI * 2);
    ctx.fill();
  }, { semente: 23, oscilar: (x, y, w, h) => {
    // o anel pulsa para fora, devagar
    const dx = x - w / 2;
    const dy = y - h / 2;
    const d = Math.hypot(dx, dy) || 1;
    return [(dx / d) * 3, (dy / d) * 3, d * 0.02];
  } });
}

// Prova de conceito: um módulo só, inteiro, com o visto dentro.
export function formaModulo(w, h, n) {
  return amostrar('modulo', w, h, n, (ctx) => {
    const lado = Math.min(w, h) * 0.78;
    const x = (w - lado) / 2;
    const y = (h - lado) / 2;
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = lado * 0.05;
    ctx.strokeRect(x, y, lado, lado);
    // o visto, pequeno, no centro
    const v = caminhoVisto(lado * 0.56, lado * 0.56);
    ctx.save();
    ctx.translate(x + lado * 0.22, y + lado * 0.22);
    ctx.strokeStyle = ACESO;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = v.traco;
    ctx.beginPath();
    ctx.moveTo(...v.a);
    ctx.lineTo(...v.b);
    ctx.lineTo(...v.c);
    ctx.stroke();
    ctx.restore();
  }, { semente: 29 });
}

// Implantação: camadas empilhadas (dados, regras, telas, pessoas) — o módulo
// virou sistema em uso. A camada de cima acesa.
export function formaCamadas(w, h, n) {
  return amostrar('camadas', w, h, n, (ctx) => {
    const cw = Math.min(w * 0.9, h * 1.25);
    const alt = Math.min(h * 0.14, cw * 0.16);
    const gap = alt * 0.55;
    const total = alt * 4 + gap * 3;
    const x = (w - cw) / 2;
    let y = (h - total) / 2;
    for (let i = 0; i < 4; i++) {
      const recuo = (3 - i) * cw * 0.05;
      ctx.fillStyle = i === 0 ? ACESO : BRANCO;
      // cada camada em perspectiva: um losango achatado
      const xa = x + recuo;
      const xb = x + cw - recuo;
      ctx.beginPath();
      ctx.moveTo(xa + alt * 0.9, y);
      ctx.lineTo(xb, y);
      ctx.lineTo(xb - alt * 0.9, y + alt);
      ctx.lineTo(xa, y + alt);
      ctx.closePath();
      if (i === 0) ctx.fill();
      else {
        ctx.lineWidth = 4;
        ctx.strokeStyle = BRANCO;
        ctx.stroke();
      }
      y += alt + gap;
    }
  }, { semente: 31 });
}

// Acompanhamento: o sistema em uso ao longo das semanas — uma sequência de
// colunas que sobe em degraus irregulares (medido, não uma curva bonita).
export function formaSemanas(w, h, n) {
  return amostrar('semanas', w, h, n, (ctx) => {
    const cols = 12;
    const gw = w * 0.9;
    const bw = (gw / cols) * 0.62;
    const x0 = (w - gw) / 2;
    const base = h * 0.84;
    const alturas = [0.18, 0.22, 0.21, 0.3, 0.34, 0.33, 0.42, 0.47, 0.46, 0.55, 0.61, 0.68];
    alturas.forEach((a, i) => {
      ctx.fillStyle = i === cols - 1 ? ACESO : BRANCO;
      const x = x0 + (gw / cols) * i;
      const hh = a * h * 0.95;
      ctx.fillRect(x, base - hh, bw, hh);
    });
    ctx.fillStyle = BRANCO;
    ctx.fillRect(x0, base + 8, gw, 3);
  }, { semente: 37 });
}

// ---------------------------------------------------------------------------
// MÉTODO: agentes em paralelo — faixas que correm lado a lado e convergem
// num tronco só (a integração). O tronco termina aceso.
export function formaFaixas(w, h, n) {
  return amostrar('faixas', w, h, n, (ctx) => {
    const faixas = 5;
    const junta = w * 0.66;
    const cy = h / 2;
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = Math.max(4, h * 0.028);
    ctx.lineCap = 'round';
    for (let i = 0; i < faixas; i++) {
      const y = h * (0.12 + (i * 0.76) / (faixas - 1));
      ctx.beginPath();
      ctx.moveTo(w * 0.03, y);
      ctx.lineTo(w * 0.38, y);
      ctx.bezierCurveTo(w * 0.52, y, w * 0.54, cy, junta, cy);
      ctx.stroke();
      // cada agente: um nó no começo da faixa
      ctx.fillStyle = BRANCO;
      ctx.beginPath();
      ctx.arc(w * 0.03 + 6, y, h * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = ACESO;
    ctx.lineWidth = Math.max(6, h * 0.05);
    ctx.beginPath();
    ctx.moveTo(junta, cy);
    ctx.lineTo(w * 0.96, cy);
    ctx.stroke();
  }, { semente: 41, oscilar: (x, y, w) => [2.5, 0, x * 0.03] });
}

// ---------------------------------------------------------------------------
// FICHAS — um desenho por trabalho
// A voz: a onda do som de uma frase dita (o orquestrador que obedece à voz).
export function formaOnda(w, h, n) {
  return amostrar('onda', w, h, n, (ctx) => {
    const barras = 46;
    const bw = (w / barras) * 0.5;
    const rnd = sorteador(43);
    for (let i = 0; i < barras; i++) {
      const t = i / (barras - 1);
      // envelope de uma fala: sobe, tem sílabas, cai
      const env = Math.sin(Math.PI * t) ** 0.7 * (0.35 + 0.65 * Math.abs(Math.sin(t * 17 + 1)) ) * (0.6 + rnd() * 0.4);
      const bh = Math.max(h * 0.04, env * h * 0.86);
      ctx.fillStyle = i > barras * 0.42 && i < barras * 0.58 ? ACESO : BRANCO;
      ctx.fillRect((w / barras) * i, (h - bh) / 2, bw, bh);
    }
  }, { semente: 47, oscilar: (x, y, w, h) => [0, (y - h / 2) * 0.18, x * 0.045] });
}

// O estaleiro: um casco em construção sobre a grade do dique — o sistema
// que nasce já apoiado numa estrutura conhecida.
export function formaCasco(w, h, n) {
  return amostrar('casco', w, h, n, (ctx) => {
    // o casco de perfil, com a proa à direita, apoiado nos picadeiros do
    // dique; as cavernas (costelas) são os módulos base, e a acesa é a que
    // está sendo construída agora
    const L = Math.min(w * 0.94, h * 2.1);
    const x0 = (w - L) / 2;
    const conves = h * 0.26;
    const quilha = h * 0.62;
    const X = (f) => x0 + f * L;
    const fundo = (f) => {
      // o fundo: reto no meio, subindo na popa (curto) e na proa (longo)
      if (f < 0.1) return conves + (quilha - conves) * Math.sin((f / 0.1) * Math.PI / 2);
      if (f > 0.7) return quilha - (quilha - conves) * ((f - 0.7) / 0.3) ** 1.6;
      return quilha;
    };
    ctx.strokeStyle = BRANCO;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(5, h * 0.022);
    ctx.beginPath();
    ctx.moveTo(X(0), conves);
    for (let f = 0; f <= 1.0001; f += 0.01) ctx.lineTo(X(f), fundo(f));
    ctx.lineTo(X(0), conves);
    ctx.stroke();
    ctx.lineWidth = Math.max(3, h * 0.014);
    for (let i = 1; i < 11; i++) {
      const f = i / 11.5;
      ctx.strokeStyle = i === 7 ? ACESO : BRANCO;
      ctx.lineWidth = i === 7 ? Math.max(7, h * 0.04) : Math.max(3, h * 0.014);
      ctx.beginPath();
      ctx.moveTo(X(f), conves);
      ctx.lineTo(X(f), fundo(f) - 2);
      ctx.stroke();
    }
    // os picadeiros e a soleira do dique
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = Math.max(3, h * 0.014);
    for (let i = 0; i < 6; i++) {
      const f = 0.16 + i * 0.1;
      ctx.strokeRect(X(f) - L * 0.022, quilha + h * 0.03, L * 0.044, h * 0.1);
    }
    ctx.beginPath();
    ctx.moveTo(X(0), quilha + h * 0.15);
    ctx.lineTo(X(1), quilha + h * 0.15);
    ctx.stroke();
  }, { semente: 53 });
}

// A operação logística: uma malha de rotas entre pontos, com uma rota acesa.
export function formaRede(w, h, n) {
  return amostrar('rede', w, h, n, (ctx) => {
    // um mapa de linhas em traçado de metrô: só horizontais, verticais e
    // diagonais de 45°, com os pontos de parada nas curvas — desenho de
    // quem planeja rota, não um grafo sorteado
    const u = Math.min(w / 12, h / 8);
    const ox = (w - u * 12) / 2;
    const oy = (h - u * 8) / 2;
    const P = (x, y) => [ox + x * u, oy + y * u];
    const linhas = [
      [[0.5, 6.5], [3, 6.5], [5, 4.5], [8.5, 4.5], [11.5, 1.5]],
      [[1, 1.5], [4, 1.5], [7, 4.5], [7, 7.5]],
      [[2, 4], [5, 4], [5, 1], [9.5, 1]],
      [[9, 7.5], [9, 5.5], [11.5, 5.5]],
    ];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = Math.max(4, u * 0.13);
    for (const l of linhas) {
      ctx.beginPath();
      ctx.moveTo(...P(...l[0]));
      l.slice(1).forEach((q) => ctx.lineTo(...P(...q)));
      ctx.stroke();
    }
    ctx.fillStyle = BRANCO;
    const paradas = [[0.5, 6.5], [3, 6.5], [1, 1.5], [4, 1.5], [7, 7.5], [2, 4], [9.5, 1], [9, 7.5], [11.5, 5.5], [5, 1], [7, 4.5]];
    for (const q of paradas) {
      const [x, y] = P(...q);
      ctx.beginPath();
      ctx.arc(x, y, u * 0.26, 0, Math.PI * 2);
      ctx.fill();
    }
    // a rota do dia, acesa, da primeira parada à última
    const rota = linhas[0];
    ctx.strokeStyle = ACESO;
    ctx.lineWidth = Math.max(7, u * 0.24);
    ctx.beginPath();
    ctx.moveTo(...P(...rota[0]));
    rota.slice(1).forEach((q) => ctx.lineTo(...P(...q)));
    ctx.stroke();
    ctx.fillStyle = ACESO;
    for (const q of [rota[0], rota[rota.length - 1]]) {
      const [x, y] = P(...q);
      ctx.beginPath();
      ctx.arc(x, y, u * 0.36, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { semente: 61 });
}

// Os pagamentos: um cartão e o caminho da transação até o "pago".
export function formaPagamento(w, h, n) {
  return amostrar('pagamento', w, h, n, (ctx) => {
    const cw = Math.min(w * 0.42, h * 0.9 * 1.58);
    const chh = cw / 1.58;
    const x = w * 0.04;
    const y = (h - chh) / 2;
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(x, y, cw, chh, cw * 0.06);
    ctx.stroke();
    ctx.fillStyle = BRANCO;
    ctx.fillRect(x, y + chh * 0.2, cw, chh * 0.14);
    ctx.fillRect(x + cw * 0.08, y + chh * 0.62, cw * 0.4, chh * 0.07);
    // o caminho: três etapas
    const cy = h / 2;
    for (let i = 0; i < 3; i++) {
      const px = x + cw + (w - x - cw) * (0.2 + i * 0.28);
      ctx.fillStyle = i === 2 ? ACESO : BRANCO;
      ctx.beginPath();
      ctx.arc(px, cy, h * (i === 2 ? 0.1 : 0.05), 0, Math.PI * 2);
      ctx.fill();
      if (i < 2) {
        ctx.fillStyle = BRANCO;
        ctx.fillRect(px + h * 0.07, cy - 2, (w - x - cw) * 0.28 - h * 0.14, 4);
      }
    }
  }, { semente: 67 });
}

// A vitrine: uma página com a primeira dobra, a grade e o rodapé — um site.
export function formaPagina(w, h, n) {
  return amostrar('pagina', w, h, n, (ctx) => {
    const pw = Math.min(w * 0.8, h * 0.9 * 1.3);
    const ph = pw / 1.3;
    const x = (w - pw) / 2;
    const y = (h - ph) / 2;
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, pw, ph);
    ctx.fillStyle = BRANCO;
    ctx.fillRect(x, y, pw, ph * 0.06);
    ctx.fillStyle = ACESO;
    ctx.fillRect(x + pw * 0.08, y + ph * 0.18, pw * 0.5, ph * 0.1);
    ctx.fillStyle = BRANCO;
    ctx.fillRect(x + pw * 0.08, y + ph * 0.33, pw * 0.34, ph * 0.035);
    for (let i = 0; i < 3; i++) ctx.strokeRect(x + pw * (0.08 + i * 0.29), y + ph * 0.5, pw * 0.26, ph * 0.36);
  }, { semente: 71 });
}

// ---------------------------------------------------------------------------
// O RETRATO: a foto vira meio-tom. No papel, o escuro da foto é o que ganha
// partícula (e partícula maior); no escuro, o contrário. A foto só é lida
// quando já carregou (ver carregarRetrato).
let retrato = null;
export function carregarRetrato(src) {
  return new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      retrato = img;
      esquecerFormas();
      ok(img);
    };
    img.onerror = () => ok(null);
    img.src = src;
  });
}

export function formaRetrato(w, h, n, { claro = true } = {}) {
  return amostrar(`retrato-${claro}`, w, h, n, (ctx) => {
    if (!retrato) {
      ctx.fillStyle = BRANCO;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const lado = Math.min(w, h);
    const x = (w - lado) / 2;
    const y = (h - lado) / 2;
    // lê a foto num canvas próprio. O meio-tom puro deixa o rosto vazio (a
    // pele é clara) e joga tudo no cabelo e na camisa; por isso a "tinta" de
    // cada pixel soma o tom (com teto, para a camisa não engolir tudo) e o
    // contorno (Sobel), que é o que faz olhos, nariz e boca aparecerem
    const t = document.createElement('canvas');
    const R = 220;
    t.width = t.height = R;
    const c2 = t.getContext('2d', { willReadFrequently: true });
    c2.drawImage(retrato, 0, 0, R, R);
    const d = c2.getImageData(0, 0, R, R);
    const px = d.data;
    const lum = new Float32Array(R * R);
    const alfa = new Uint8Array(R * R);
    for (let i = 0; i < R * R; i++) {
      lum[i] = (px[i * 4] * 0.3 + px[i * 4 + 1] * 0.55 + px[i * 4 + 2] * 0.15) / 255;
      alfa[i] = px[i * 4 + 3];
    }
    for (let y = 0; y < R; y++) {
      for (let x = 0; x < R; x++) {
        const i = y * R + x;
        let tinta = 0;
        if (alfa[i] > 200 && x > 0 && y > 0 && x < R - 1 && y < R - 1) {
          const L = (dx, dy) => lum[(y + dy) * R + x + dx];
          const gx = L(1, -1) + 2 * L(1, 0) + L(1, 1) - L(-1, -1) - 2 * L(-1, 0) - L(-1, 1);
          const gy = L(-1, 1) + 2 * L(0, 1) + L(1, 1) - L(-1, -1) - 2 * L(0, -1) - L(1, -1);
          const borda = Math.min(1, Math.hypot(gx, gy) * 1.6);
          const tom = claro ? 1 - lum[i] : lum[i];
          tinta = Math.min(1, Math.min(0.62, Math.pow(tom, 1.1)) + borda * 0.9);
        }
        const a = Math.round(tinta * 255);
        px[i * 4] = 255;
        px[i * 4 + 1] = 255;
        px[i * 4 + 2] = a;
        px[i * 4 + 3] = a;
      }
    }
    c2.putImageData(d, 0, 0);
    ctx.drawImage(t, x, y, lado, lado);
  }, { semente: 73, pesoPorTom: true, resolucao: 260 });
}

// ---------------------------------------------------------------------------
// A LINHA: o fio calmo das Perguntas — a matéria em repouso, uma linha de
// horizonte fina, que respira.
export function formaLinha(w, h, n) {
  return amostrar('linha', w, h, n, (ctx) => {
    ctx.fillStyle = BRANCO;
    ctx.fillRect(0, h / 2 - 1.5, w, 3);
    ctx.fillStyle = ACESO;
    ctx.fillRect(w * 0.985, h / 2 - 1.5, w * 0.015, 3);
  }, { semente: 79, oscilar: (x, y, w) => [0, 3, x * 0.012] });
}

// ---------------------------------------------------------------------------
// O ARO: a borda de uma roda, ao lado da lista que gira. O trecho aceso fica
// à esquerda, no meio — apontando para o item aceso da lista.
export function formaAro(w, h, n) {
  return amostrar('aro', w, h, n, (ctx) => {
    const R = Math.min(w, h) * 0.44;
    const cx = w / 2;
    const cy = h / 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = BRANCO;
    ctx.lineWidth = Math.max(5, R * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    // os dentes de uma catraca, por dentro
    ctx.lineWidth = 3;
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R * 0.84, cy + Math.sin(a) * R * 0.84);
      ctx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92);
      ctx.stroke();
    }
    // o trecho aceso fica à esquerda, no meio: aponta para o item aceso
    ctx.strokeStyle = ACESO;
    ctx.lineWidth = Math.max(9, R * 0.09);
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 0.92, Math.PI * 1.08);
    ctx.stroke();
  }, { semente: 83 });
}

// formas que vêm de fora e mudam enquanto a página está aberta: as escolhas de
// quem lê (monte o seu sistema) e o número da conta. Cada módulo registra aqui a sua
// função; a versão entra na chave do cache, então uma mudança gera um objeto
// novo e o motor recarrega sozinho.
export const dinamicas = {};
const vazia = (w, h, n) => amostrar('vazia', w, h, n, (ctx) => {
  ctx.fillStyle = BRANCO;
  ctx.fillRect(w / 2 - 2, h / 2 - 2, 4, 4);
});

export const FORMAS = {
  visto: (w, h, n) => formaVisto(w, h, n),
  'visto-ponta': (w, h, n) => formaVisto(w, h, n, { aceso: 'ponta' }),
  poeira: formaPoeira,
  pilotos: formaPilotos,
  pedido: formaPedido,
  mapa: formaMapa,
  modulo: formaModulo,
  camadas: formaCamadas,
  semanas: formaSemanas,
  faixas: formaFaixas,
  onda: formaOnda,
  casco: formaCasco,
  rede: formaRede,
  pagamento: formaPagamento,
  pagina: formaPagina,
  retrato: (w, h, n, esquema) => formaRetrato(w, h, n, { claro: esquema === 'claro' }),
  linha: formaLinha,
  aro: formaAro,
  monte: (w, h, n, esq) => (dinamicas.monte || vazia)(w, h, n, esq),
  sistema: (w, h, n, esq) => (dinamicas.sistema || vazia)(w, h, n, esq),
  conta: (w, h, n, esq) => (dinamicas.conta || vazia)(w, h, n, esq),
};
