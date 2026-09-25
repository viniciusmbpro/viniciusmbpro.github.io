// MONTE O SEU SISTEMA: a pessoa escolhe a área e marca, nas palavras dela,
// o que acontece ali hoje ("aprovação pelo WhatsApp", "conferir nota por
// nota"). Cada dor marcada vira um módulo, e a matéria o encaixa na planta —
// os lugares ainda vazios ficam tracejados, como obra por fazer.
//
// O vermelhão aqui tem um sentido só: o visto marca o módulo em que UMA
// PESSOA APROVA. É a tese do site no desenho: a IA faz, a pessoa aprova.
//
// "Ver funcionando" põe pedidos para correr pela planta; eles param no visto
// até a aprovação e seguem. No fim, a ficha técnica do sistema (módulos, o
// que a IA faz, onde a pessoa aprova) vai por e-mail.
import { amostrar, dinamicas, BRANCO, ACESO } from '../materia/formas.js';

// cada área: um núcleo (sempre presente) e as dores que viram módulos.
// ia = o que a IA faz ali; aprova = o que a pessoa decide (quando há)
const AREAS = {
  financeiro: {
    nome: 'Financeiro',
    nucleo: { nome: 'Contas a pagar e receber', ia: 'registra e organiza cada lançamento que chega' },
    dores: [
      { dor: 'Aprovação de pagamento pelo WhatsApp', nome: 'Aprovação em alçadas', ia: 'monta o pedido e confere com o contrato', aprova: 'aprova o que passa do limite' },
      { dor: 'Conferir nota fiscal uma por uma', nome: 'Leitura de notas', ia: 'lê a nota e compara com o pedido', aprova: null },
      { dor: 'Conciliação bancária na planilha', nome: 'Conciliação', ia: 'casa o extrato com os lançamentos', aprova: null },
      { dor: 'Cobrança de cliente feita à mão', nome: 'Cobrança', ia: 'manda os lembretes e registra as promessas', aprova: null },
      { dor: 'Fechamento do mês leva dias', nome: 'Fechamento', ia: 'prepara o fechamento com as pendências', aprova: 'aprova o fechamento' },
    ],
  },
  operacao: {
    nome: 'Operação e logística',
    nucleo: { nome: 'Ordens de serviço', ia: 'abre a ordem a partir do pedido' },
    dores: [
      { dor: 'Escala da frota montada na planilha', nome: 'Programação', ia: 'sugere a escala do dia', aprova: 'confirma a escala' },
      { dor: 'Status chega por mensagem solta', nome: 'Acompanhamento', ia: 'lê as mensagens e atualiza o status', aprova: null },
      { dor: 'Cliente liga perguntando onde está', nome: 'Painel do cliente', ia: 'mostra a posição e o prazo ao cliente', aprova: null },
      { dor: 'Checklist e ocorrência no papel', nome: 'Ocorrências', ia: 'transcreve foto e áudio e classifica', aprova: null },
      { dor: 'Custo da viagem só aparece depois', nome: 'Custos', ia: 'calcula o custo na hora', aprova: 'aprova as exceções' },
    ],
  },
  comercial: {
    nome: 'Comercial',
    nucleo: { nome: 'Funil de negócios', ia: 'registra cada oportunidade que entra' },
    dores: [
      { dor: 'Contato esquecido no e-mail', nome: 'Triagem de contatos', ia: 'lê, classifica e distribui', aprova: null },
      { dor: 'Proposta montada do zero toda vez', nome: 'Propostas', ia: 'monta a proposta a partir do pedido', aprova: 'revisa e envia' },
      { dor: 'Contrato revisado à mão', nome: 'Contratos', ia: 'compara com o modelo e aponta o que mudou', aprova: 'aprova o contrato' },
      { dor: 'Ninguém sabe o que está em negociação', nome: 'Painel do funil', ia: 'resume a semana de cada negócio', aprova: null },
      { dor: 'Pós-venda que ninguém faz', nome: 'Pós-venda', ia: 'agenda e registra os contatos', aprova: null },
    ],
  },
  atendimento: {
    nome: 'Atendimento',
    nucleo: { nome: 'Central de atendimento', ia: 'recebe cada chamado com o histórico do cliente' },
    dores: [
      { dor: 'Pedido chega por vários canais', nome: 'Caixa única', ia: 'junta WhatsApp, e-mail e site num lugar', aprova: null },
      { dor: 'As mesmas perguntas o dia inteiro', nome: 'Respostas com a base', ia: 'responde com o conteúdo da empresa', aprova: null },
      { dor: 'Reclamação que se perde no meio', nome: 'Tratativas', ia: 'classifica a urgência e cobra o prazo', aprova: 'resolve os casos graves' },
      { dor: 'Troca e reembolso sem regra clara', nome: 'Trocas e reembolsos', ia: 'confere a regra e prepara a decisão', aprova: 'aprova a devolução' },
      { dor: 'Não sabemos do que mais reclamam', nome: 'Motivos da semana', ia: 'agrupa e resume os motivos', aprova: null },
    ],
  },
};

const TOTAL = 10; // pedidos por rodada
const FAIXA = 0.4; // a altura (em fração da caixa) por onde os pedidos correm
const calmo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('parado');

export function iniciarMonte({ materia, som }) {
  const raiz = document.getElementById('monte');
  if (!raiz) return;
  const figura = raiz.querySelector('.monte-planta');
  const nomes = raiz.querySelector('.monte-nomes');
  const fluxo = raiz.querySelector('.monte-fluxo');
  const doresEl = raiz.querySelector('.monte-dores');
  const passoDores = raiz.querySelector('.monte-passo--dores');
  const ficha = raiz.querySelector('.monte-ficha');
  const rodar = raiz.querySelector('[data-acao="rodar"]');
  const enviar = raiz.querySelector('[data-acao="enviar"]');
  const aviso = raiz.querySelector('.monte-aviso');

  let area = null;
  let marcadas = []; // índices das dores, na ordem em que foram marcadas
  let versao = 0;
  let W = 1;
  let H = 1;
  let rodando = null;

  // os módulos do sistema montado: o núcleo e as dores marcadas
  const modulos = () => (area ? [{ ...AREAS[area].nucleo, aprova: null }, ...marcadas.map((i) => AREAS[area].dores[i])] : []);

  // os lugares da planta: 6, em "cobra" (a linha de baixo volta), para o
  // fluxo ser um caminho contínuo
  function lugares(w, h) {
    const col = w / h < 1.15 ? 2 : 3;
    const n = 6;
    const lin = Math.ceil(n / col);
    const gap = Math.min(w, h) * 0.08;
    const bw = (w - gap * (col + 1)) / col;
    // no celular (duas colunas) a caixa é mais alta: o nome quebra em mais linhas
    const bh = Math.min(bw * (col === 2 ? 0.8 : 0.58), (h - gap * (lin + 1)) / lin);
    const oy = (h - (lin * bh + (lin - 1) * gap)) / 2;
    const out = [];
    for (let k = 0; k < n; k++) {
      const r = Math.floor(k / col);
      let c = k % col;
      if (r % 2) c = col - 1 - c;
      out.push({ x: gap + c * (bw + gap), y: oy + r * (bh + gap), w: bw, h: bh });
    }
    return out;
  }

  // ---- a planta, em partículas ----
  dinamicas.monte = (w, h, n) =>
    amostrar(`monte-${versao}`, w, h, n, (c) => {
      const L = lugares(w, h);
      const M = modulos();
      c.lineCap = 'round';
      c.lineJoin = 'round';
      L.forEach((s, k) => {
        const m = M[k];
        c.strokeStyle = BRANCO;
        if (!m) {
          // lugar vazio: tracejado, obra por fazer
          c.lineWidth = 3;
          c.setLineDash([10, 12]);
          c.beginPath();
          c.roundRect(s.x, s.y, s.w, s.h, 12);
          c.stroke();
          c.setLineDash([]);
          return;
        }
        c.lineWidth = 6;
        c.beginPath();
        c.roundRect(s.x, s.y, s.w, s.h, 12);
        c.stroke();
        c.fillStyle = BRANCO;
        c.fillRect(s.x + 3, s.y + 3, s.w - 6, Math.min(14, s.h * 0.14));
        if (m.aprova) {
          // o visto no canto: aqui uma pessoa aprova
          const t = Math.min(s.w, s.h) * 0.22;
          const x = s.x + s.w - t * 1.35;
          const y = s.y + s.h - t * 1.1;
          c.strokeStyle = ACESO;
          c.lineWidth = Math.max(5, t * 0.2);
          c.beginPath();
          c.moveTo(x, y + t * 0.45);
          c.lineTo(x + t * 0.35, y + t * 0.8);
          c.lineTo(x + t, y);
          c.stroke();
        }
      });
      // as ligações entre módulos montados, na ordem do caminho
      c.strokeStyle = BRANCO;
      c.lineWidth = 4;
      for (let k = 0; k < M.length - 1; k++) {
        const [a, b] = ponte(L[k], L[k + 1]);
        c.beginPath();
        c.moveTo(...a);
        c.lineTo(...b);
        c.stroke();
      }
    }, { semente: 101, resolucao: 420 });

  // a ponte entre dois lugares vizinhos: de borda a borda
  function ponte(A, B) {
    if (Math.abs(A.y - B.y) < 2) {
      const esq = A.x < B.x ? A : B;
      const dir = esq === A ? B : A;
      const y = A.y + A.h * FAIXA;
      const p = [[esq.x + esq.w + 4, y], [dir.x - 4, y]];
      return esq === A ? p : [p[1], p[0]];
    }
    const x = A.x + A.w / 2;
    return [[x, A.y + A.h + 4], [x, B.y - 4]];
  }

  // ---- os nomes sobre os módulos (texto de verdade, não partícula) ----
  function pintarNomes() {
    const L = lugares(W, H);
    const M = modulos();
    nomes.replaceChildren(
      ...M.map((m, k) => {
        const s = L[k];
        const el = document.createElement('span');
        el.className = 'monte-nome';
        el.textContent = m.nome;
        // o nome embaixo, à esquerda; o visto fica no canto direito e o
        // caminho dos pedidos passa acima, na faixa do meio
        // recuo folgado: a borda de partículas tem uns 8 px de espessura
        el.style.left = `${s.x + 20}px`;
        el.style.bottom = `${H - (s.y + s.h) + 16}px`;
        el.style.width = `${m.aprova ? s.w * 0.58 : s.w - 40}px`;
        return el;
      }),
    );
  }

  // ---- a ficha técnica e o e-mail ----
  function pintarFicha() {
    const M = modulos();
    ficha.hidden = !M.length;
    rodar.disabled = M.length < 2;
    if (!M.length) return;
    const aprovacoes = M.filter((m) => m.aprova);
    ficha.querySelector('.monte-resumo').textContent =
      `${AREAS[area].nome}: ${M.length} ${M.length === 1 ? 'módulo' : 'módulos'}` +
      (aprovacoes.length ? `, ${aprovacoes.length} com aprovação de uma pessoa.` : ', tudo automático até aqui.');
    ficha.querySelector('.monte-lista').replaceChildren(
      ...M.map((m) => {
        const li = document.createElement('li');
        li.className = m.aprova ? 'com-visto' : '';
        li.innerHTML = `<strong></strong><span class="monte-ia"></span>${m.aprova ? '<span class="monte-aprova"></span>' : ''}`;
        li.querySelector('strong').textContent = m.nome;
        li.querySelector('.monte-ia').textContent = `A IA ${m.ia}.`;
        if (m.aprova) li.querySelector('.monte-aprova').textContent = `Uma pessoa ${m.aprova}.`;
        return li;
      }),
    );
    const corpo = [
      'Olá, Vinícius.',
      '',
      `Montei no seu site o sistema de ${AREAS[area].nome.toLowerCase()} que falta aqui:`,
      '',
      ...M.map((m) => `- ${m.nome}: a IA ${m.ia}${m.aprova ? `; uma pessoa ${m.aprova}` : ''}.`),
      '',
      'Empresa e tamanho:',
      'Quem decide e para quando:',
    ].join('\n');
    enviar.href = `mailto:viniciusmbpro@gmail.com?subject=${encodeURIComponent(`Sistema de ${AREAS[area].nome.toLowerCase()}`)}&body=${encodeURIComponent(corpo)}`;
  }

  function mudar(fn) {
    parar();
    const de = materia.formaAtual(figura);
    fn();
    versao++;
    materia.morfar(figura, de, 1100);
    pintarNomes();
    pintarFicha();
  }

  // ---- as escolhas ----
  function mostrarDores() {
    doresEl.replaceChildren(
      ...AREAS[area].dores.map((d, i) => {
        const l = document.createElement('label');
        l.className = 'ficha-opcao';
        l.innerHTML = `<input type="checkbox" name="dor" value="${i}" /><span></span>`;
        l.querySelector('span').textContent = d.dor;
        return l;
      }),
    );
    passoDores.hidden = false;
  }
  raiz.addEventListener('change', (e) => {
    const alvo = e.target;
    if (alvo.name === 'area') {
      mudar(() => {
        area = alvo.value;
        marcadas = [];
      });
      mostrarDores();
      som?.tique(0.8);
    } else if (alvo.name === 'dor') {
      const i = Number(alvo.value);
      mudar(() => {
        marcadas = alvo.checked ? [...marcadas, i] : marcadas.filter((x) => x !== i);
      });
      som?.[alvo.checked ? 'graos' : 'tique']?.();
    }
  });

  // ---- ver funcionando: pedidos correndo pela planta ----
  function parar() {
    if (!rodando) return;
    cancelAnimationFrame(rodando.quadro);
    rodando = null;
    fluxo.replaceChildren();
    rodar.textContent = 'Ver funcionando';
    rodar.setAttribute('aria-pressed', 'false');
  }
  function iniciarFluxo() {
    const L = lugares(W, H).slice(0, modulos().length);
    const M = modulos();
    if (calmo()) {
      aviso.textContent = 'Com o movimento reduzido, os pedidos não correm: cada um passa pelos módulos em ordem e para no visto até alguém aprovar.';
      return;
    }
    // o caminho: centro de cada módulo, na ordem
    const pontos = L.map((s) => [s.x + s.w / 2, s.y + s.h * FAIXA]);
    const trecho = pontos.slice(1).map((p, k) => Math.hypot(p[0] - pontos[k][0], p[1] - pontos[k][1]));
    const pedidos = [];
    let criados = 0;
    let feitos = 0;
    let aprovados = 0;
    let ultimo = 0;
    rodando = { quadro: 0 };
    rodar.textContent = 'Parar';
    rodar.setAttribute('aria-pressed', 'true');
    const velocidade = 0.42; // px por ms
    function quadro(agora) {
      if (!rodando) return;
      if (criados < TOTAL && agora - ultimo > 420) {
        ultimo = agora;
        criados++;
        const el = document.createElement('span');
        el.className = 'monte-pedido';
        fluxo.append(el);
        pedidos.push({ el, k: 0, d: 0, espera: 0 });
      }
      for (const p of pedidos) {
        if (p.fim) continue;
        if (p.espera > agora) continue;
        p.d += velocidade * 16;
        while (p.k < trecho.length && p.d >= trecho[p.k]) {
          p.d -= trecho[p.k];
          p.k++;
          // chegou a um módulo com visto: espera a aprovação
          if (M[p.k]?.aprova) {
            p.espera = agora + 650;
            p.el.classList.add('aguarda');
            setTimeout(() => {
              p.el.classList.remove('aguarda');
              p.el.classList.add('aprovado');
              aprovados++;
            }, 600);
            break;
          }
        }
        if (p.k >= trecho.length) {
          p.fim = true;
          feitos++;
          p.el.classList.add('pronto');
          setTimeout(() => p.el.remove(), 500);
          continue;
        }
        const [a, b] = [pontos[p.k], pontos[p.k + 1]];
        const t = Math.min(1, p.d / trecho[p.k]);
        p.el.style.transform = `translate(${a[0] + (b[0] - a[0]) * t}px, ${a[1] + (b[1] - a[1]) * t}px)`;
      }
      aviso.textContent = `${feitos} de ${TOTAL} pedidos prontos${M.some((m) => m.aprova) ? ` · ${aprovados} aprovações de uma pessoa` : ''}.`;
      if (feitos >= TOTAL) {
        setTimeout(parar, 600);
        som?.visto();
        return;
      }
      rodando.quadro = requestAnimationFrame(quadro);
    }
    rodando.quadro = requestAnimationFrame(quadro);
  }
  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    if (b.dataset.acao === 'rodar') {
      if (rodando) parar();
      else iniciarFluxo();
    } else if (b.dataset.acao === 'recomecar') {
      mudar(() => {
        marcadas = [];
      });
      doresEl.querySelectorAll('input').forEach((i) => (i.checked = false));
      aviso.textContent = '';
    }
  });

  new ResizeObserver(() => {
    const r = figura.getBoundingClientRect();
    W = r.width;
    H = r.height;
    parar();
    versao++;
    pintarNomes();
  }).observe(figura);
  pintarFicha();
}
