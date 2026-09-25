// O ESBOÇO: quem lê rabisca o sistema que falta na empresa dele — uma caixa
// para cada parte do trabalho, uma seta para o caminho que o trabalho faz — e
// a matéria ocupa o rabisco, traço a traço. Em "Passar a limpo" o rascunho
// vira diagrama: as caixas se alinham, as setas ficam retas e ligam as
// caixas certas, e cada módulo ganha um nome. O resultado vai por e-mail
// (ou baixa como imagem) e vira o começo da conversa.
//
// É a tese do site em forma de ferramenta: a IA passa a limpo; a pessoa
// decide o que é o quê.
//
// O desenho é guardado em coordenadas de 0 a 1 do quadro, para sobreviver a
// qualquer mudança de tamanho da tela.
import { amostrar, dinamicas, BRANCO, ACESO } from '../materia/formas.js';

const EXEMPLO = {
  nomes: ['Pedido', 'Aprovação', 'Pagamento', 'Financeiro'],
  // caixas e setas "à mão", em 0..1 (x, y, largura, altura)
  caixas: [
    [0.06, 0.16, 0.2, 0.26],
    [0.4, 0.14, 0.2, 0.28],
    [0.74, 0.17, 0.2, 0.25],
    [0.74, 0.62, 0.2, 0.25],
  ],
  setas: [
    [[0.27, 0.29], [0.39, 0.28]],
    [[0.61, 0.28], [0.73, 0.3]],
    [[0.84, 0.43], [0.84, 0.61]],
  ],
};
// o mesmo exemplo num quadro em pé (celular): dois por linha, fazendo a volta
const EXEMPLO_EM_PE = {
  // os nomes seguem a ordem de leitura: em cima, esquerda → direita; embaixo idem
  nomes: ['Pedido', 'Aprovação', 'Financeiro', 'Pagamento'],
  caixas: [
    [0.07, 0.1, 0.38, 0.24],
    [0.55, 0.1, 0.38, 0.24],
    [0.55, 0.6, 0.38, 0.24],
    [0.07, 0.6, 0.38, 0.24],
  ],
  setas: [
    [[0.46, 0.22], [0.54, 0.22]],
    [[0.74, 0.35], [0.74, 0.59]],
    [[0.54, 0.72], [0.46, 0.72]],
  ],
};

// um traço à mão: o caminho com tremor e as pontas que não fecham perfeito
function aMao(pontos, tremor, rnd) {
  const saida = [];
  for (let i = 0; i < pontos.length - 1; i++) {
    const [x0, y0] = pontos[i];
    const [x1, y1] = pontos[i + 1];
    const passos = 14;
    for (let k = 0; k < passos; k++) {
      const t = k / passos;
      saida.push([x0 + (x1 - x0) * t + (rnd() - 0.5) * tremor, y0 + (y1 - y0) * t + (rnd() - 0.5) * tremor]);
    }
  }
  saida.push(pontos[pontos.length - 1]);
  return saida;
}

function sorteio(semente) {
  let s = semente;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

export function iniciarEsboco({ materia, som }) {
  const raiz = document.getElementById('esboco');
  if (!raiz) return;
  const quadro = raiz.querySelector('.esboco-quadro');
  const lapis = raiz.querySelector('.esboco-lapis');
  const rotulos = raiz.querySelector('.esboco-rotulos');
  const dica = raiz.querySelector('.esboco-dica');
  const resumo = raiz.querySelector('.esboco-resumo');
  const envio = raiz.querySelector('.esboco-envio');
  const enviar = raiz.querySelector('[data-acao="enviar"]');
  const ctx = lapis.getContext('2d');
  const toque = window.matchMedia('(pointer: coarse)').matches;

  // o estado
  let tracos = []; // [{ pts: [[x,y]...] }] em 0..1
  let modo = 'rascunho'; // ou 'limpo'
  let modulos = []; // [{ x, y, w, h, nome }] em px do quadro, no modo limpo
  let fluxos = []; // [{ de, para }]
  let nomesExemplo = null;
  let versao = 0;
  let atual = null; // o traço sendo desenhado
  let W = 1;
  let H = 1;

  const medir = () => {
    const r = quadro.getBoundingClientRect();
    W = r.width;
    H = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    lapis.width = Math.round(W * dpr);
    lapis.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pintarLapis();
    posicionarRotulos();
  };

  // ---- a forma que a matéria assume ----
  dinamicas.esboco = (w, h, n) =>
    amostrar(`esboco-${versao}`, w, h, n, (c) => {
      c.lineCap = 'round';
      c.lineJoin = 'round';
      if (modo === 'limpo' && modulos.length) {
        const kx = w / W;
        const ky = h / H;
        c.strokeStyle = BRANCO;
        c.lineWidth = 6;
        for (const m of modulos) {
          c.beginPath();
          c.roundRect(m.x * kx, m.y * ky, m.w * kx, m.h * ky, 10);
          c.stroke();
          // a faixa de cima de cada módulo: é uma tela, não uma caixa qualquer
          c.fillStyle = BRANCO;
          c.fillRect(m.x * kx + 3, m.y * ky + 3, m.w * kx - 6, Math.min(16, m.h * ky * 0.18));
        }
        c.strokeStyle = ACESO;
        c.fillStyle = ACESO;
        c.lineWidth = 7;
        for (const f of fluxos) {
          const [a, b] = ligacao(modulos[f.de], modulos[f.para]);
          seta(c, a[0] * kx, a[1] * ky, b[0] * kx, b[1] * ky);
        }
        return;
      }
      if (!tracos.length) {
        // o quadro vazio: papel quadriculado, em pontos
        c.fillStyle = BRANCO;
        const passo = Math.max(22, w / 40);
        for (let x = passo / 2; x < w; x += passo) for (let y = passo / 2; y < h; y += passo) c.fillRect(x - 1.5, y - 1.5, 3, 3);
        return;
      }
      c.strokeStyle = BRANCO;
      c.lineWidth = 8;
      tracos.forEach((t, i) => {
        // o último traço acende: é o que acabou de chegar
        c.strokeStyle = i === tracos.length - 1 ? ACESO : BRANCO;
        c.beginPath();
        t.pts.forEach(([x, y], k) => (k ? c.lineTo(x * w, y * h) : c.moveTo(x * w, y * h)));
        c.stroke();
      });
    }, { semente: 91, resolucao: 420 });

  function seta(c, x0, y0, x1, y1) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
    const ang = Math.atan2(y1 - y0, x1 - x0);
    const t = 16;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 - Math.cos(ang - 0.45) * t, y1 - Math.sin(ang - 0.45) * t);
    c.lineTo(x1 - Math.cos(ang + 0.45) * t, y1 - Math.sin(ang + 0.45) * t);
    c.closePath();
    c.fill();
  }

  // a ligação entre dois módulos: do centro de um ao do outro, cortada nas
  // bordas (com folga), para a seta começar e terminar fora das caixas
  function ligacao(A, B) {
    const ca = [A.x + A.w / 2, A.y + A.h / 2];
    const cb = [B.x + B.w / 2, B.y + B.h / 2];
    const borda = (m, c, d) => {
      const tx = d[0] ? (m.w / 2 + 10) / Math.abs(d[0]) : Infinity;
      const ty = d[1] ? (m.h / 2 + 10) / Math.abs(d[1]) : Infinity;
      const t = Math.min(tx, ty);
      return [c[0] + d[0] * t, c[1] + d[1] * t];
    };
    const d = [cb[0] - ca[0], cb[1] - ca[1]];
    const n = Math.hypot(...d) || 1;
    const u = [d[0] / n, d[1] / n];
    return [borda(A, ca, u), borda(B, cb, [-u[0], -u[1]])];
  }

  // ---- o lápis: o traço vivo, fino, enquanto a mão desenha ----
  function pintarLapis() {
    ctx.clearRect(0, 0, W, H);
    if (modo === 'limpo') return;
    const cor = getComputedStyle(quadro).getPropertyValue('--texto').trim() || '#fff';
    ctx.strokeStyle = cor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const desenhar = (t, alfa, largura) => {
      ctx.globalAlpha = alfa;
      ctx.lineWidth = largura;
      ctx.beginPath();
      t.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
      ctx.stroke();
    };
    // os traços já feitos ficam como guia bem leve; a matéria é que os ocupa
    tracos.forEach((t) => desenhar(t, 0.22, 1.5));
    if (atual) desenhar(atual, 0.9, 2.2);
    ctx.globalAlpha = 1;
  }

  // ---- mudar o estado com a matéria acompanhando ----
  function mudar(fn, dur = 1000) {
    const de = materia.formaAtual(quadro);
    fn();
    versao++;
    materia.morfar(quadro, de, dur);
    pintarLapis();
    posicionarRotulos();
    atualizarTexto();
  }

  // ---- desenhar ----
  const ponto = (e) => {
    const r = quadro.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  quadro.addEventListener('pointerdown', (e) => {
    if (e.target.closest('input, button')) return;
    if (toque && !raiz.classList.contains('desenhando')) return;
    if (modo === 'limpo') mudar(() => (modo = 'rascunho'), 700);
    atual = { pts: [ponto(e)] };
    quadro.setPointerCapture(e.pointerId);
    dica.hidden = true;
    e.preventDefault();
  });
  quadro.addEventListener('pointermove', (e) => {
    if (!atual) return;
    const p = ponto(e);
    const u = atual.pts[atual.pts.length - 1];
    if (Math.hypot((p[0] - u[0]) * W, (p[1] - u[1]) * H) < 3) return;
    atual.pts.push(p);
    pintarLapis();
  });
  const soltar = () => {
    if (!atual) return;
    const t = atual;
    atual = null;
    const comprimento = t.pts.reduce((s, p, i) => (i ? s + Math.hypot((p[0] - t.pts[i - 1][0]) * W, (p[1] - t.pts[i - 1][1]) * H) : 0), 0);
    if (comprimento < 14) return pintarLapis();
    nomesExemplo = null;
    mudar(() => tracos.push(t), 900);
    som?.graos();
  };
  quadro.addEventListener('pointerup', soltar);
  quadro.addEventListener('pointercancel', soltar);

  // ---- passar a limpo: reconhecer caixas e setas ----
  function reconhecer() {
    const caixas = [];
    const linhas = [];
    for (const t of tracos) {
      const px = t.pts.map(([x, y]) => [x * W, y * H]);
      const xs = px.map((p) => p[0]);
      const ys = px.map((p) => p[1]);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const y0 = Math.min(...ys);
      const y1 = Math.max(...ys);
      const bw = x1 - x0;
      const bh = y1 - y0;
      const [a, b] = [px[0], px[px.length - 1]];
      const fecha = Math.hypot(a[0] - b[0], a[1] - b[1]) < Math.max(28, 0.32 * Math.max(bw, bh));
      if (fecha && bw > 34 && bh > 26) caixas.push({ x: x0, y: y0, w: bw, h: bh });
      else if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 24) linhas.push([a, b]);
    }
    // o grid: tudo em múltiplos de 8, e caixas da mesma linha com o mesmo
    // centro e a mesma altura (e da mesma coluna com o mesmo centro)
    const g = (v) => Math.round(v / 8) * 8;
    caixas.sort((p, q) => p.y + p.h / 2 - (q.y + q.h / 2));
    const agrupar = (eixo, tam) => {
      const grupos = [];
      for (const c of caixas) {
        const centro = c[eixo] + c[tam] / 2;
        const gr = grupos.find((x) => Math.abs(x.centro - centro) < Math.min(x.tam, c[tam]) * 0.5);
        if (gr) gr.itens.push(c);
        else grupos.push({ centro, tam: c[tam], itens: [c] });
      }
      for (const gr of grupos) {
        const centro = gr.itens.reduce((s, c) => s + c[eixo] + c[tam] / 2, 0) / gr.itens.length;
        const medida = eixo === 'y' ? gr.itens.reduce((s, c) => s + c[tam], 0) / gr.itens.length : null;
        for (const c of gr.itens) {
          if (medida) c[tam] = medida;
          c[eixo] = centro - c[tam] / 2;
        }
      }
    };
    agrupar('y', 'h');
    agrupar('x', 'w');
    for (const c of caixas) {
      c.w = Math.max(96, g(c.w));
      c.h = Math.max(64, g(c.h));
      c.x = Math.min(W - c.w - 8, Math.max(8, g(c.x)));
      c.y = Math.min(H - c.h - 8, Math.max(8, g(c.y)));
    }
    // cada linha liga a caixa mais perto do começo à mais perto do fim
    const perto = (p) => {
      let melhor = -1;
      let dist = 90;
      caixas.forEach((c, i) => {
        const dx = Math.max(c.x - p[0], 0, p[0] - (c.x + c.w));
        const dy = Math.max(c.y - p[1], 0, p[1] - (c.y + c.h));
        const d = Math.hypot(dx, dy);
        if (d < dist) {
          dist = d;
          melhor = i;
        }
      });
      return melhor;
    };
    const novos = [];
    for (const [a, b] of linhas) {
      const de = perto(a);
      const para = perto(b);
      if (de < 0 || para < 0 || de === para) continue;
      if (!novos.some((f) => f.de === de && f.para === para)) novos.push({ de, para });
    }
    // a ordem de leitura: de cima para baixo, da esquerda para a direita
    const ordem = caixas.map((c, i) => i).sort((i, j) => (Math.abs(caixas[i].y - caixas[j].y) < 40 ? caixas[i].x - caixas[j].x : caixas[i].y - caixas[j].y));
    const novoIndice = new Map(ordem.map((antigo, novo) => [antigo, novo]));
    const nomes = nomesExemplo && nomesExemplo.length === caixas.length ? nomesExemplo : null;
    return {
      modulos: ordem.map((i, k) => ({ ...caixas[i], nome: nomes ? nomes[k] : modulos[k]?.nome || `Módulo ${k + 1}` })),
      fluxos: novos.map((f) => ({ de: novoIndice.get(f.de), para: novoIndice.get(f.para) })),
    };
  }

  function passarALimpo() {
    if (!tracos.length) {
      resumo.textContent = 'O quadro está vazio. Desenhe uma caixa para cada parte do trabalho, ou veja o exemplo.';
      return;
    }
    const r = reconhecer();
    if (!r.modulos.length) {
      resumo.textContent = 'Não achei nenhuma caixa. Desenhe retângulos fechados para os módulos e setas entre eles.';
      return;
    }
    mudar(() => {
      modo = 'limpo';
      modulos = r.modulos;
      fluxos = r.fluxos;
    }, 1600);
    som?.visto();
    raiz.classList.remove('desenhando');
    rotulos.querySelector('input')?.focus({ preventScroll: true });
  }

  // ---- os nomes dos módulos: campos de texto sobre as caixas ----
  function posicionarRotulos() {
    rotulos.replaceChildren();
    if (modo !== 'limpo') return;
    modulos.forEach((m, i) => {
      const campo = document.createElement('input');
      campo.type = 'text';
      campo.value = m.nome;
      campo.maxLength = 28;
      campo.setAttribute('aria-label', `Nome do módulo ${i + 1}`);
      campo.style.left = `${m.x + m.w / 2}px`;
      campo.style.top = `${m.y + m.h / 2 + 6}px`;
      campo.style.width = `${Math.max(72, m.w - 16)}px`;
      campo.addEventListener('input', () => {
        m.nome = campo.value.trim() || `Módulo ${i + 1}`;
        atualizarTexto();
      });
      campo.addEventListener('focus', () => campo.select());
      rotulos.append(campo);
    });
  }

  // ---- o resumo e o envio ----
  function descricao() {
    const cadeias = fluxos.map((f) => `${modulos[f.de].nome} → ${modulos[f.para].nome}`);
    const m = modulos.length;
    const n = fluxos.length;
    return {
      curta: `${m} ${m === 1 ? 'módulo' : 'módulos'} e ${n} ${n === 1 ? 'fluxo' : 'fluxos'}${cadeias.length ? `: ${cadeias.join('; ')}.` : '.'}`,
      cadeias,
    };
  }
  function atualizarTexto() {
    const limpo = modo === 'limpo' && modulos.length;
    // a dica só aparece com o quadro realmente vazio
    dica.hidden = !!(tracos.length || limpo);
    envio.hidden = !limpo;
    raiz.classList.toggle('limpo', !!limpo);
    if (!limpo) {
      resumo.textContent = tracos.length ? `${tracos.length} ${tracos.length === 1 ? 'traço' : 'traços'} no quadro. Quando terminar, passe a limpo.` : '';
      return;
    }
    const d = descricao();
    resumo.textContent = `Passado a limpo: ${d.curta} Clique nos nomes para trocar.`;
    const corpo = [
      'Olá, Vinícius.',
      '',
      'Rabisquei no seu site o sistema que falta aqui na empresa:',
      '',
      'Módulos:',
      ...modulos.map((x) => `- ${x.nome}`),
      '',
      'Caminho do trabalho:',
      ...(d.cadeias.length ? d.cadeias.map((c) => `- ${c}`) : ['- (ainda sem setas)']),
      '',
      'Empresa e tamanho:',
      'Quem decide e para quando:',
    ].join('\n');
    enviar.href = `mailto:viniciusmbpro@gmail.com?subject=${encodeURIComponent('Esboço de sistema')}&body=${encodeURIComponent(corpo)}`;
  }

  // ---- baixar a imagem do diagrama limpo ----
  function baixar() {
    const esc = 2;
    const c = document.createElement('canvas');
    c.width = W * esc;
    c.height = H * esc;
    const g = c.getContext('2d');
    g.scale(esc, esc);
    const estilo = getComputedStyle(quadro);
    const fundo = estilo.getPropertyValue('--fundo').trim();
    const texto = estilo.getPropertyValue('--texto').trim();
    const acento = estilo.getPropertyValue('--acento').trim();
    g.fillStyle = fundo;
    g.fillRect(0, 0, W, H);
    g.strokeStyle = texto;
    g.lineWidth = 2;
    g.font = `600 15px ${estilo.fontFamily}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const m of modulos) {
      g.beginPath();
      g.roundRect(m.x, m.y, m.w, m.h, 10);
      g.stroke();
      g.fillStyle = texto;
      g.fillRect(m.x + 1, m.y + 1, m.w - 2, 10);
      g.fillText(m.nome, m.x + m.w / 2, m.y + m.h / 2 + 6);
    }
    g.strokeStyle = acento;
    g.fillStyle = acento;
    g.lineWidth = 2.5;
    for (const f of fluxos) {
      const [a, b] = ligacao(modulos[f.de], modulos[f.para]);
      seta(g, a[0], a[1], b[0], b[1]);
    }
    g.fillStyle = texto;
    g.globalAlpha = 0.6;
    g.textAlign = 'right';
    g.font = `400 12px ${estilo.fontFamily}`;
    g.fillText('esboço feito em viniciusmarques.dev', W - 14, H - 14);
    const a = document.createElement('a');
    a.download = 'esboco-do-sistema.png';
    a.href = c.toDataURL('image/png');
    a.click();
  }

  // ---- os botões ----
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const acao = b.dataset.acao;
    if (acao === 'limpo') passarALimpo();
    else if (acao === 'desfazer') {
      if (modo === 'limpo') mudar(() => (modo = 'rascunho'), 800);
      else if (tracos.length) mudar(() => tracos.pop(), 700);
    } else if (acao === 'apagar') {
      mudar(() => {
        tracos = [];
        modulos = [];
        fluxos = [];
        modo = 'rascunho';
        nomesExemplo = null;
      }, 1100);
      dica.hidden = false;
    } else if (acao === 'exemplo') {
      const rnd = sorteio(17);
      const ex = W / H < 1.3 ? EXEMPLO_EM_PE : EXEMPLO;
      mudar(() => {
        modo = 'rascunho';
        nomesExemplo = ex.nomes;
        tracos = [
          ...ex.caixas.map(([x, y, w, h]) => ({ pts: aMao([[x, y], [x + w, y + 0.01], [x + w - 0.005, y + h], [x + 0.004, y + h - 0.01], [x + 0.006, y + 0.012]], 0.006, rnd) })),
          ...ex.setas.map((s) => ({ pts: aMao(s, 0.006, rnd) })),
        ];
      }, 1300);
      dica.hidden = true;
      som?.graos();
    } else if (acao === 'modulo') {
      // o caminho do teclado: acrescenta um módulo já limpo, ligado ao anterior
      if (modo !== 'limpo' && tracos.length) passarALimpo();
      mudar(() => {
        modo = 'limpo';
        const k = modulos.length;
        const col = W < 600 ? 2 : 3;
        const w = Math.min(200, W / col - 40);
        const h = 96;
        const gx = (W - col * w) / (col + 1);
        modulos.push({ x: gx + (k % col) * (w + gx), y: 40 + Math.floor(k / col) * (h + 64), w, h, nome: `Módulo ${k + 1}` });
        if (k) fluxos.push({ de: k - 1, para: k });
      }, 900);
      const campos = rotulos.querySelectorAll('input');
      campos[campos.length - 1]?.focus();
    } else if (acao === 'baixar') baixar();
    else if (acao === 'desenhar') {
      raiz.classList.add('desenhando');
      dica.hidden = true;
    }
  });

  new ResizeObserver(() => {
    // o rascunho escala sozinho (está em 0..1); o limpo escala na proporção
    const [wa, ha] = [W, H];
    medir();
    if (modo === 'limpo' && (Math.abs(wa - W) > 2 || Math.abs(ha - H) > 2)) {
      for (const m of modulos) {
        m.x *= W / wa;
        m.w *= W / wa;
        m.y *= H / ha;
        m.h *= H / ha;
      }
      versao++;
      posicionarRotulos();
    }
  }).observe(quadro);
  medir();
  atualizarTexto();
}
