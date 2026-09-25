// A MATÉRIA: uma massa de partículas que acompanha a página inteira e muda de
// forma a cada capítulo, junto com o texto. Ela é o "material" com que eu
// trabalho: começa solta (poeira), vira pedido, vira mapa, vira módulo, vira
// sistema, vira o meu rosto e termina no visto — o V de Vinícius.
//
// Como funciona, em uma frase: cada forma é um conjunto de N posições
// (formas.js); a rolagem diz entre quais duas formas estamos e quanto
// andamos de uma para a outra; a GPU faz o resto. O CPU só troca os dois
// buffers quando o PAR de formas muda — nunca a cada quadro. Por isso cabe
// dezenas de milhares de partículas num notebook comum.
//
// Tudo é função da rolagem: subir desfaz exatamente o que descer fez.
// E ela reage a quem lê: o cursor abre caminho e acende; rolar rápido
// estica a massa no sentido do movimento; parada, ela respira.
//
// Três qualidades:
//   alta   — WebGL (three.js), 9 a 22 mil partículas, voo com profundidade;
//   leve   — canvas 2D, ~2 mil partículas, o mesmo desenho sem profundidade;
//   parado — sem voo: a forma seguinte aparece num esmaecer.
// o three.js (a maior peça do site) só é baixado para a qualidade Completa,
// e em paralelo: enquanto ele chega, a versão leve já desenha
let THREE = null;
let buscandoThree = null;
function buscarThree() {
  buscandoThree ||= import('./gpu.js').then((m) => (THREE = m));
  return buscandoThree;
}
import { FORMAS, esquecerFormas } from './formas.js';

// a paleta clássica (as cores do site antigo): no escuro a matéria é
// turquesa e acende em verde; no claro é azul-marinho e acende em verde
// fechado
const CLASSICA = {
  escuro: { base: [0.39, 0.83, 0.75], luz: [0.45, 0.85, 0.05] },
  claro: { base: [0.055, 0.165, 0.32], luz: [0.18, 0.48, 0.0] },
};
const coresDe = (esquema) => (document.documentElement.dataset.paleta === 'classica' ? CLASSICA : CORES)[esquema];
const CORES = {
  // no escuro, a matéria é o papel; no claro, é a tinta. O acento é o mesmo
  // vermelhão nos dois (um pouco mais fechado no papel, pelo contraste)
  escuro: { base: [0.86, 0.82, 0.75], luz: [1.0, 0.33, 0.2] },
  claro: { base: [0.1, 0.09, 0.08], luz: [0.83, 0.2, 0.09] },
};

const limitar = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const suave = (t) => t * t * (3 - 2 * t);
const mistura = (a, b, t) => a + (b - a) * t;

function quantas(qualidade, W) {
  const celular = W < 760;
  if (qualidade === 'alta') return celular ? 9000 : W > 1700 ? 22000 : 16000;
  return celular ? 1400 : 2400;
}

// ---------------------------------------------------------------------------
// O desenhista da GPU. As duas formas (A e B) ficam em atributos; a mistura,
// o voo, o respiro, o cursor e o estiramento da rolagem são do shader.
function desenhistaGPU(canvas, N) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const cena = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.BufferGeometry();
  const a = (n) => new THREE.BufferAttribute(new Float32Array(N * n), n).setUsage(THREE.DynamicDrawUsage);
  const semente = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) semente[i] = Math.random();
  // o atraso de cada partícula acompanha a ordem da varredura diagonal:
  // a troca de forma passa como uma onda da esquerda para a direita
  for (let i = 0; i < N; i++) semente[i * 4] = (i / N) * 0.7 + semente[i * 4] * 0.3;
  const attrs = {
    position: new THREE.BufferAttribute(new Float32Array(N * 3), 3),
    aSemente: new THREE.BufferAttribute(semente, 4),
    aA: a(2), aB: a(2), aLuzA: a(1), aLuzB: a(1), aTamA: a(1), aTamB: a(1), aOscA: a(3), aOscB: a(3),
  };
  for (const [k, v] of Object.entries(attrs)) geo.setAttribute(k, v);

  const u = {
    uT: { value: 0 }, uOffA: { value: new THREE.Vector2() }, uOffB: { value: new THREE.Vector2() },
    uTempo: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uPx: { value: 1 },
    uMouse: { value: new THREE.Vector2(-9999, -9999) }, uMouseR: { value: 140 }, uMouseOn: { value: 0 },
    uVel: { value: 0 }, uBase: { value: new THREE.Color() }, uLuz: { value: new THREE.Color() },
    uAlfa: { value: 1 }, uTam: { value: 2 }, uVoo: { value: 1 }, uClaro: { value: 0 },
    uInclina: { value: new THREE.Vector2() },
  };
  const material = new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthTest: false,
    vertexShader: /* glsl */ `
      attribute vec4 aSemente; attribute vec2 aA; attribute vec2 aB;
      attribute float aLuzA; attribute float aLuzB; attribute float aTamA; attribute float aTamB;
      attribute vec3 aOscA; attribute vec3 aOscB;
      uniform float uT, uTempo, uPx, uMouseR, uMouseOn, uVel, uTam, uVoo;
      uniform vec2 uOffA, uOffB, uRes, uMouse, uInclina;
      uniform vec3 uBase, uLuz;
      varying vec3 vCor; varying float vBrilho;
      float saida(float t) { return 1.0 - pow(1.0 - t, 3.0); }
      float emOnda(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
      void main() {
        // cada partícula sai no seu tempo (a onda) e chega com o ease da página
        float e = emOnda(clamp((uT - aSemente.x * 0.45) / 0.55, 0.0, 1.0));
        vec2 pa = aA + uOffA + aOscA.xy * sin(uTempo * 1.4 + aOscA.z);
        vec2 pb = aB + uOffB + aOscB.xy * sin(uTempo * 1.4 + aOscB.z);
        vec2 p = mix(pa, pb, e);
        // o voo: no meio da troca a partícula faz uma curva própria e cresce,
        // como se passasse mais perto de quem lê
        float voo = sin(3.14159 * e) * uVoo;
        float ang = aSemente.y * 6.2832 + uTempo * 0.35;
        p += voo * vec2(cos(ang), sin(ang)) * (30.0 + 170.0 * aSemente.w);
        // a profundidade: cada partícula mora numa camada; o mouse inclina a
        // massa inteira e as camadas deslizam umas sobre as outras (paralaxe),
        // como um objeto de verdade no espaço, não um desenho chapado
        float camada = aSemente.z - 0.5;
        p += uInclina * camada * 34.0;
        // o respiro: ninguém fica completamente parado
        p += vec2(sin(uTempo * 0.8 + aSemente.y * 40.0), cos(uTempo * 0.7 + aSemente.z * 40.0)) * 1.2;
        // a rolagem rápida estica a massa no sentido do movimento
        p.y -= uVel * (0.3 + aSemente.w) * 2.2;
        // o cursor abre caminho e acende quem está perto
        vec2 dm = p - uMouse;
        float d = length(dm);
        float perto = (1.0 - smoothstep(0.0, uMouseR, d)) * uMouseOn;
        p += (dm / max(d, 0.001)) * perto * perto * uMouseR * 0.42;
        float luz = clamp(mix(aLuzA, aLuzB, e) + perto * 0.9, 0.0, 1.0);
        vCor = mix(uBase, uLuz, luz);
        vBrilho = 0.55 + 0.45 * aSemente.z + luz * 0.3;
        vec2 clip = vec2(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0);
        gl_Position = vec4(clip, 0.0, 1.0);
        float tam = mix(aTamA, aTamB, e);
        gl_PointSize = uTam * uPx * tam * (0.7 + aSemente.w * 0.6) * (1.0 + voo * 1.3) * (1.0 + luz * 0.25);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlfa; uniform float uClaro;
      varying vec3 vCor; varying float vBrilho;
      void main() {
        // um disco com a borda macia de meio pixel: nítido, sem halo
        float r = length(gl_PointCoord - 0.5);
        float a = 1.0 - smoothstep(0.38, 0.5, r);
        if (a < 0.01) discard;
        float alfa = a * uAlfa * mix(vBrilho, 1.0, uClaro);
        gl_FragColor = vec4(vCor, alfa);
      }`,
  });
  const pontos = new THREE.Points(geo, material);
  pontos.frustumCulled = false;
  cena.add(pontos);

  return {
    tipo: 'alta',
    tamanho(w, h, dpr) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      u.uRes.value.set(w, h);
      u.uPx.value = dpr;
    },
    carregar(lado, f) {
      const [P, L, T, O] = lado === 'A' ? ['aA', 'aLuzA', 'aTamA', 'aOscA'] : ['aB', 'aLuzB', 'aTamB', 'aOscB'];
      attrs[P].array.set(f.pos);
      attrs[L].array.set(f.luz);
      attrs[T].array.set(f.tam);
      attrs[O].array.set(f.osc);
      for (const k of [P, L, T, O]) attrs[k].needsUpdate = true;
    },
    desenhar(q) {
      u.uT.value = q.t;
      u.uOffA.value.set(q.offA.x, q.offA.y);
      u.uOffB.value.set(q.offB.x, q.offB.y);
      u.uTempo.value = q.tempo;
      u.uMouse.value.set(q.mouse.x, q.mouse.y);
      u.uMouseOn.value = q.mouse.on;
      u.uMouseR.value = q.mouse.r;
      u.uVel.value = q.vel;
      u.uBase.value.setRGB(...q.base);
      u.uLuz.value.setRGB(...q.luz);
      u.uAlfa.value = q.alfa;
      u.uTam.value = q.tam;
      u.uVoo.value = q.voo;
      u.uClaro.value = q.claro;
      u.uInclina.value.set(q.inclina.x, q.inclina.y);
      renderer.render(cena, camera);
    },
    limpar() {
      renderer.clear();
    },
    destruir() {
      geo.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    },
  };
}

// ---------------------------------------------------------------------------
// O desenhista leve: a mesma conta, no processador, com menos partículas.
function desenhista2D(canvas, N) {
  const ctx = canvas.getContext('2d');
  const semente = Array.from({ length: N }, (_, i) => [(i / N) * 0.7 + Math.random() * 0.3, Math.random(), Math.random(), Math.random()]);
  let A = null;
  let B = null;
  let W = 1;
  let H = 1;
  const emOnda = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  return {
    tipo: 'leve',
    tamanho(w, h, dpr) {
      W = w;
      H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    carregar(lado, f) {
      if (lado === 'A') A = f;
      else B = f;
    },
    desenhar(q) {
      ctx.clearRect(0, 0, W, H);
      if (!A || !B) return;
      const cor = (l) => `rgb(${(mistura(q.base[0], q.luz[0], l) * 255) | 0},${(mistura(q.base[1], q.luz[1], l) * 255) | 0},${(mistura(q.base[2], q.luz[2], l) * 255) | 0})`;
      const corBase = cor(0);
      const corLuz = cor(1);
      ctx.globalAlpha = q.alfa * (q.claro ? 1 : 0.85);
      const r2 = q.mouse.r * q.mouse.r;
      for (let i = 0; i < N; i++) {
        const s = semente[i];
        const e = emOnda(limitar((q.t - s[0] * 0.45) / 0.55));
        let x = mistura(A.pos[i * 2] + q.offA.x, B.pos[i * 2] + q.offB.x, e);
        let y = mistura(A.pos[i * 2 + 1] + q.offA.y, B.pos[i * 2 + 1] + q.offB.y, e);
        const voo = Math.sin(Math.PI * e) * q.voo;
        const ang = s[1] * 6.2832 + q.tempo * 0.35;
        x += voo * Math.cos(ang) * (30 + 170 * s[3]);
        y += voo * Math.sin(ang) * (30 + 170 * s[3]) - q.vel * (0.3 + s[3]) * 2.2;
        let luz = mistura(A.luz[i], B.luz[i], e);
        if (q.mouse.on) {
          const dx = x - q.mouse.x;
          const dy = y - q.mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const d = Math.sqrt(d2) || 1;
            const p = 1 - d / q.mouse.r;
            x += (dx / d) * p * p * q.mouse.r * 0.42;
            y += (dy / d) * p * p * q.mouse.r * 0.42;
            luz = Math.min(1, luz + p * 0.9);
          }
        }
        const t = q.tam * mistura(A.tam[i], B.tam[i], e) * (0.7 + s[3] * 0.6) * (1 + voo);
        ctx.fillStyle = luz > 0.5 ? corLuz : corBase;
        ctx.fillRect(x - t / 2, y - t / 2, t, t);
      }
    },
    limpar() {
      ctx.clearRect(0, 0, W, H);
    },
    destruir() {},
  };
}

// ---------------------------------------------------------------------------

// o que é clicável não reage como área vazia
export function criarMateria({ rolagem, som, qualidade: qualidadeInicial }) {
  const calmoSistema = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let canvas = document.getElementById('materia');
  let qualidade = calmoSistema && qualidadeInicial === 'alta' ? 'parado' : qualidadeInicial;
  let desenhista = null;
  let N = 0;
  let W = 0;
  let H = 0;
  let estacoes = [];
  let par = '';
  let rodando = false;
  let ultimaChegada = -1;
  let vel = 0;
  let yAntes = window.scrollY;
  let alfaEntrada = 0; // a matéria nasce depois do carregamento
  let pulso = null; // o segredo: um pulso de voz
  let aberto = false; // só aparece quando o carregamento sai da frente
  let introInicio = null;
  let morfe = null; // uma troca de forma dentro da mesma estação
  const carregadas = { A: null, B: null };
  const t0 = performance.now();
  const mouse = { x: -9999, y: -9999, on: 0, alvoOn: 0, r: 140 };
  const inclina = { x: 0, y: 0 };
  const cor = { base: [...CORES.escuro.base], luz: [...CORES.escuro.luz], claro: 0 };

  function montar() {
    desenhista?.destruir();
    // um canvas que já teve WebGL não aceita 2D (e vice-versa): troca o elemento
    const novo = canvas.cloneNode(false);
    canvas.replaceWith(novo);
    canvas = novo;
    desenhista = null;
    W = window.innerWidth;
    H = window.innerHeight;
    if (qualidade === 'alta' && THREE) {
      try {
        N = quantas('alta', W);
        desenhista = desenhistaGPU(canvas, N);
      } catch {
        qualidade = 'leve';
      }
    } else if (qualidade === 'alta') {
      // ainda chegando: desenha leve agora e troca quando o three chegar
      buscarThree().then(() => {
        if (qualidade !== 'alta') return;
        montar();
        medirEstacoes();
        ligar();
      }, () => (qualidade = 'leve'));
    }
    if (!desenhista) {
      N = quantas('leve', W);
      desenhista = desenhista2D(canvas, N);
    }
    document.documentElement.dataset.materia = qualidade;
    medirTela();
    par = '';
  }

  function medirTela() {
    W = window.innerWidth;
    H = window.innerHeight;
    desenhista?.tamanho(W, H, Math.min(window.devicePixelRatio || 1, qualidade === 'alta' ? 2 : 1.5));
  }

  // o tema de uma caixa: o da seção dela, a não ser que o painel force um só
  const esquemaDe = (el) => {
    const pref = document.documentElement.dataset.prefTema;
    if (pref === 'escuro' || pref === 'claro') return pref;
    return el.closest('[data-tema]')?.dataset.tema || 'escuro';
  };
  const topoNaPagina = (el) => el.getBoundingClientRect().top + window.scrollY;

  // ---- as estações: onde cada forma está inteira, em px de rolagem ----
  // Uma figura comum está inteira enquanto o centro dela passa entre 64% e
  // 40% da altura da tela. Um passo de trilho (seção presa) está inteiro no
  // meio do trecho dele.
  function medirEstacoes() {
    esquecerFormas();
    const lista = [];
    document.querySelectorAll('[data-forma]').forEach((el) => {
      const caixaEl = el.dataset.caixa ? document.querySelector(el.dataset.caixa) : el;
      if (!caixaEl || !caixaEl.offsetWidth) return;
      // um trilho só vale enquanto está preso (no celular os casos empilham)
      const trilhoEl = el.closest('.trilho');
      const trilho = trilhoEl && trilhoEl.offsetHeight > H * 1.3 ? trilhoEl : null;
      let a;
      let b;
      if (trilho) {
        const passos = [...trilho.querySelectorAll('[data-forma]')];
        const k = passos.indexOf(el);
        const T0 = topoNaPagina(trilho);
        const seg = (trilho.offsetHeight - H) / passos.length;
        a = T0 + seg * (k + 0.5) - seg * 0.28;
        b = T0 + seg * (k + 0.5) + seg * 0.28;
      } else if (el.dataset.estacao === 'topo') {
        a = 0;
        b = H * 0.08;
      } else if (el.dataset.estacao === 'fim') {
        const fim = document.documentElement.scrollHeight - H;
        a = fim - H * 0.25;
        b = fim;
      } else if (el.dataset.estacao === 'larga') {
        // uma caixa em que a pessoa mexe (o quadro de desenho, a conta): a
        // forma fica inteira por quase toda a passagem dela pela tela
        const r = caixaEl.getBoundingClientRect();
        const c = r.top + window.scrollY + r.height / 2;
        a = c - H * 0.85;
        b = c - H * 0.2;
      } else if (el.dataset.ate) {
        // um desenho que fica preso ao lado de uma lista: está inteiro desde
        // que a lista entra até ela terminar (medido pelo pai, porque a
        // posição de quem está preso muda com a rolagem)
        const ate = document.querySelector(el.dataset.ate);
        const de = el.dataset.de ? document.querySelector(el.dataset.de) : caixaEl.parentElement;
        a = topoNaPagina(de) - H * 0.35;
        b = topoNaPagina(ate) + ate.offsetHeight - H * 0.62;
      } else {
        const r = caixaEl.getBoundingClientRect();
        const c = r.top + window.scrollY + r.height / 2;
        a = c - H * 0.64;
        b = c - H * 0.4;
      }
      lista.push({ el, caixaEl, nome: el.dataset.forma, a, b, esquema: esquemaDe(caixaEl), som: el.dataset.som });
    });
    // nunca uma estação antes da anterior (telas muito baixas), nem depois do
    // fim da página
    const fim = document.documentElement.scrollHeight - H;
    for (let i = 0; i < lista.length; i++) {
      const e = lista[i];
      e.a = Math.min(e.a, fim);
      e.b = Math.min(e.b, fim);
      if (i && e.a < lista[i - 1].b) e.a = lista[i - 1].b;
      if (e.b < e.a) e.b = e.a;
    }
    estacoes = lista;
    par = '';
    if (import.meta.env.DEV) window.__estacoes = () => estacoes.map((e) => [e.nome, Math.round(e.a), Math.round(e.b)]);
  }

  function formaDe(e) {
    const r = e.caixaEl.getBoundingClientRect();
    const f = FORMAS[e.nome](r.width, r.height, N, e.esquema);
    return { f, x: r.left, y: r.top };
  }

  // onde a rolagem está: numa estação ou entre duas
  function situar(y) {
    if (!estacoes.length) return null;
    if (y <= estacoes[0].b) return { i: 0, j: 0, t: 0 };
    for (let i = 1; i < estacoes.length; i++) {
      const e = estacoes[i];
      if (y < e.a) return { i: i - 1, j: i, t: (y - estacoes[i - 1].b) / Math.max(1, e.a - estacoes[i - 1].b) };
      if (y <= e.b) return { i, j: i, t: 0 };
    }
    const u = estacoes.length - 1;
    return { i: u, j: u, t: 0 };
  }

  function quadro(agora) {
    const y = window.scrollY;
    const tempo = (agora - t0) / 1000;
    const parado = qualidade === 'parado';
    const dy = Math.max(-80, Math.min(80, y - yAntes));
    yAntes = y;
    vel += ((parado ? 0 : dy) - vel) * 0.1;
    mouse.on += (mouse.alvoOn - mouse.on) * 0.08;
    // a inclinação segue o mouse devagar (e a rolagem rápida inclina também)
    const ix = mouseFino && mouse.alvoOn && !parado ? mouse.x / W - 0.5 : 0;
    const iy = mouseFino && mouse.alvoOn && !parado ? mouse.y / H - 0.5 : 0;
    inclina.x += (ix - inclina.x) * 0.05;
    inclina.y += (iy + vel * 0.004 - inclina.y) * 0.05;
    const onde = situar(y);
    if (!onde || !aberto) {
      desenhista.limpar();
      return false;
    }

    // a abertura: logo depois do carregamento, a poeira solta na tela inteira
    // se junta no visto do início
    let intro = null;
    if (introInicio !== null) {
      const p = (agora - introInicio) / 2400;
      if (p >= 1 || parado) introInicio = null;
      else if (onde.i === 0 && onde.j === 0) intro = p;
    }
    let A = estacoes[onde.i];
    let B = estacoes[onde.j];
    let chave = `${onde.i}>${onde.j}`;
    let ga = formaDe(A);
    let gb = onde.i === onde.j ? ga : formaDe(B);
    if (intro !== null) {
      chave = 'abertura';
      gb = ga;
      ga = { f: FORMAS.poeira(W, H, N), x: 0, y: 0 };
      onde.t = intro;
    }
    // uma forma que mudou no lugar (o desenho de quem lê, o número da conta):
    // a antiga vira o ponto de partida e a nova chega com a mesma onda
    if (morfe && intro === null && onde.i === onde.j && A.el === morfe.el) {
      const p = (agora - morfe.inicio) / morfe.dur;
      if (p >= 1 || parado) morfe = null;
      else {
        ga = { f: morfe.de, x: gb.x, y: gb.y };
        onde.t = p;
      }
    }
    // os buffers só são trocados quando a forma de um dos lados muda (as
    // formas vêm de um cache: a mesma forma é o mesmo objeto)
    if (chave !== par || ga.f !== carregadas.A || gb.f !== carregadas.B) {
      desenhista.carregar('A', ga.f);
      desenhista.carregar('B', gb.f);
      carregadas.A = ga.f;
      carregadas.B = gb.f;
      par = chave;
    }

    // chegou numa estação: um som curto, uma vez
    if (onde.i === onde.j && onde.i !== ultimaChegada) {
      if (ultimaChegada !== -1 && A.som) som?.[A.som]?.(onde.i);
      ultimaChegada = onde.i;
    }

    // a cor segue o tema da seção de destino
    const t = limitar(onde.t);
    const ca = coresDe(A.esquema);
    const cb = coresDe(B.esquema);
    const tc = suave(limitar((t - 0.3) / 0.4));
    const k = parado ? 1 : 0.18;
    for (let c = 0; c < 3; c++) {
      cor.base[c] += (mistura(ca.base[c], cb.base[c], tc) - cor.base[c]) * k;
      cor.luz[c] += (mistura(ca.luz[c], cb.luz[c], tc) - cor.luz[c]) * k;
    }
    cor.claro += ((mistura(A.esquema === 'claro' ? 1 : 0, B.esquema === 'claro' ? 1 : 0, tc)) - cor.claro) * k;

    alfaEntrada = Math.min(1, alfaEntrada + (parado ? 1 : 0.025));
    let alfa = alfaEntrada;
    let tt = t;
    // na abertura a matéria já nasce mais leve e chega inteira
    if (intro !== null) alfa *= 0.35 + 0.65 * intro;
    if (parado && onde.i !== onde.j) {
      // parado: a forma some e a próxima aparece, sem voo
      alfa *= Math.abs(1 - 2 * t);
      tt = t < 0.5 ? 0 : 1;
    }
    // no meio do voo a massa fica mais leve: passa por trás do texto sem pesar
    alfa *= 1 - Math.sin(Math.PI * t) * 0.35;

    let tam = W < 760 ? 2.1 : 2.4;
    if (pulso) {
      const p = (agora - pulso) / 2600;
      if (p > 1) pulso = null;
      else tam *= 1 + Math.sin(p * Math.PI * 9) * 0.5 * (1 - p);
    }

    desenhista.desenhar({
      t: tt,
      offA: ga,
      offB: gb,
      tempo: parado ? 0 : tempo,
      vel: vel,
      mouse: { x: mouse.x, y: mouse.y, on: mouseFino && !parado ? mouse.on : 0, r: mouse.r },
      base: cor.base,
      luz: cor.luz,
      claro: cor.claro,
      alfa,
      tam,
      voo: parado ? 0 : 1,
      inclina,
    });
    // parado e sem nada mudando: descansa até a próxima rolagem
    return !parado || Math.abs(vel) > 0.05;
  }

  function laco(agora) {
    if (document.hidden || !quadro(agora)) {
      rodando = false;
      return;
    }
    requestAnimationFrame(laco);
  }
  function ligar() {
    if (rodando || !desenhista) return;
    rodando = true;
    requestAnimationFrame(laco);
  }
  document.addEventListener('visibilitychange', () => !document.hidden && ligar());

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.alvoOn = 1;
  });
  document.documentElement.addEventListener('pointerleave', () => (mouse.alvoOn = 0));
  // segurar o clique abre um raio maior: a matéria abre espaço
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && !e.target.closest('a, button, input, label, summary')) mouse.r = 240;
  });
  window.addEventListener('pointerup', () => (mouse.r = 140));

  let espera = 0;
  function remedir() {
    const larguraAntes = W;
    medirTela();
    // atravessou a fronteira celular/computador: muda o número de partículas
    if ((larguraAntes < 760) !== (W < 760)) montar();
    medirEstacoes();
    ligar();
  }
  const adiar = () => {
    clearTimeout(espera);
    espera = setTimeout(remedir, 150);
  };
  // no celular a barra do navegador muda a altura a cada rolagem: só a
  // largura justifica remedir
  let larguraVista = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== larguraVista || window.innerWidth >= 760) {
      larguraVista = window.innerWidth;
      adiar();
    }
  });
  new ResizeObserver(adiar).observe(document.querySelector('main'));

  montar();
  medirEstacoes();
  rolagem.aoRolar(ligar);

  return {
    ligar,
    remedir,
    get qualidade() {
      return qualidade;
    },
    mudarQualidade(q) {
      qualidade = q;
      montar();
      medirEstacoes();
      ligar();
    },
    // o carregamento saiu: a poeira se junta no visto
    // a forma que uma caixa mostra agora (para servir de partida de um morfe)
    formaAtual(el) {
      const e = estacoes.find((x) => x.el === el || x.caixaEl === el);
      return e && N ? formaDe(e).f : null;
    },
    // a forma de uma caixa mudou: anima da antiga (de) para a nova, no lugar
    morfar(el, de, dur = 1500) {
      const e = estacoes.find((x) => x.el === el || x.caixaEl === el);
      if (!e || !de) return;
      morfe = { el: e.el, de, inicio: performance.now(), dur };
      ligar();
    },
    abrir() {
      aberto = true;
      introInicio = performance.now();
      ligar();
    },
    pulsar() {
      pulso = performance.now();
      ligar();
    },
  };
}
