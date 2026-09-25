// MONTE O SEU SISTEMA — a obra.
//
// O sistema já está na tela desde o começo: a janela real de um aplicativo,
// ainda só em matéria. A pessoa escolhe a área — e cada área é um produto
// com cara própria (sistema.js) —, e as
// dores daquela área aparecem como CARTAS sobre a mesa, nas palavras de quem
// vive o problema ("Aprovação de pagamento pelo WhatsApp").
//
// Cada carta jogada para dentro do sistema (arrastada, ou só tocada) voa até
// o menu e vira um módulo: a matéria desenha o esqueleto da tela daquele
// módulo e ela se solidifica na hora, já funcionando. Sem modos: montar é usar.
//
// O vermelhão tem um sentido só: o visto marca o módulo em que UMA PESSOA
// APROVA. A IA faz; a pessoa aprova.

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

const calmo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('parado');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function iniciarMonte({ som, sistema }) {
  const raiz = document.getElementById('monte');
  if (!raiz || !sistema) return;
  const cartasEl = raiz.querySelector('.monte-cartas');
  const dica = raiz.querySelector('.monte-dica');
  const resumo = raiz.querySelector('.monte-resumo');
  const acoes = raiz.querySelector('.monte-acoes');
  const enviar = [...raiz.querySelectorAll('[data-acao="enviar"]')];
  const caixa = sistema.caixa;

  let area = null;
  let jogadas = []; // índices das dores, na ordem em que entraram

  const modulos = () => (area ? [{ ...AREAS[area].nucleo, aprova: null, nucleo: true }, ...jogadas.map((i) => AREAS[area].dores[i])] : []);

  // ---- as cartas na mesa ----
  function pintarCartas(dar = false) {
    const livres = AREAS[area].dores.map((d, i) => [d, i]).filter(([, i]) => !jogadas.includes(i));
    cartasEl.replaceChildren(
      ...livres.map(([d, i], k) => {
        const li = document.createElement('li');
        // cada carta cai na mesa um pouco torta, como papel de verdade
        const giro = ((i * 37) % 7) - 3;
        li.innerHTML = `<button type="button" class="carta${d.aprova ? ' carta--aprova' : ''}" data-i="${i}" style="--giro:${giro}deg;--k:${k}">
          <span class="carta-hoje">Hoje</span>
          <span class="carta-dor">${esc(d.dor)}</span>
          <span class="carta-vira">vira <strong>${esc(d.nome)}</strong>${d.aprova ? '<span class="carta-visto" aria-hidden="true"></span>' : ''}</span>
        </button>`;
        if (dar && !calmo()) li.firstElementChild.classList.add('dando');
        return li;
      }),
    );
    dica.textContent = livres.length ? 'Arraste uma carta para dentro do sistema, ou toque nela.' : 'Todas as cartas estão no sistema.';
  }

  function atualizar() {
    const M = modulos();
    acoes.hidden = !area;
    if (!area) return;
    const ap = M.filter((m) => m.aprova).length;
    resumo.textContent = `${AREAS[area].nome}: ${M.length} ${M.length === 1 ? 'módulo' : 'módulos'}${ap ? `, ${ap} com aprovação de uma pessoa` : ''}.`;
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
    const href = `mailto:viniciusmbpro@gmail.com?subject=${encodeURIComponent(`Sistema de ${AREAS[area].nome.toLowerCase()}`)}&body=${encodeURIComponent(corpo)}`;
    enviar.forEach((a) => (a.href = href));
  }

  function configurar(foco, zerar = false) {
    sistema.configurar({ chave: area, nome: AREAS[area]?.nome, lista: modulos(), foco, zerar });
    atualizar();
  }

  // ---- jogar uma carta no sistema ----
  function jogar(i, de) {
    if (!area || jogadas.includes(i)) return;
    jogadas.push(i);
    configurar(jogadas.length);
    som?.graos();
    // o voo: a carta sai de onde estava e encolhe até o novo item do menu
    const alvo = sistema.botao(jogadas.length);
    if (de && alvo && !calmo()) {
      const r = alvo.getBoundingClientRect();
      const fantasma = de.el.cloneNode(true);
      fantasma.classList.add('carta--voando');
      fantasma.classList.remove('dando', 'arrastando');
      Object.assign(fantasma.style, { left: `${de.r.left}px`, top: `${de.r.top}px`, width: `${de.r.width}px`, height: `${de.r.height}px`, transform: de.transform || '' });
      document.body.append(fantasma);
      const dx = r.left + r.width / 2 - (de.r.left + de.r.width / 2);
      const dy = r.top + r.height / 2 - (de.r.top + de.r.height / 2);
      const k = Math.min(r.width / de.r.width, 0.6);
      fantasma
        .animate([{ transform: de.transform || 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(${k}) rotate(0deg)`, opacity: 0.2 }], { duration: 650, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' })
        .finished.then(() => {
          fantasma.remove();
          alvo.classList.add('chegou');
        });
    }
    pintarCartas();
    // o foco do teclado continua na mesa
    cartasEl.querySelector('.carta')?.focus({ preventScroll: true });
  }

  // ---- arrastar (mouse e caneta; no toque, tocar joga a carta) ----
  let arrasto = null;
  cartasEl.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.carta');
    if (!c || e.pointerType === 'touch' || e.button !== 0) return;
    arrasto = { el: c, x0: e.clientX, y0: e.clientY, ativo: false, id: e.pointerId };
  });
  window.addEventListener('pointermove', (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const dx = e.clientX - arrasto.x0;
    const dy = e.clientY - arrasto.y0;
    if (!arrasto.ativo && Math.hypot(dx, dy) < 6) return;
    if (!arrasto.ativo) {
      arrasto.ativo = true;
      arrasto.r = arrasto.el.getBoundingClientRect();
      arrasto.el.classList.add('arrastando');
      arrasto.el.setPointerCapture?.(e.pointerId);
    }
    // a carta inclina para o lado em que está sendo puxada
    const giro = Math.max(-12, Math.min(12, (e.movementX || 0) * 0.8));
    arrasto.transform = `translate(${dx}px, ${dy}px) rotate(${giro}deg) scale(1.04)`;
    arrasto.el.style.transform = arrasto.transform;
    const s = caixa.getBoundingClientRect();
    const dentro = e.clientX > s.left && e.clientX < s.right && e.clientY > s.top && e.clientY < s.bottom;
    caixa.classList.toggle('pronto-para-soltar', dentro);
  });
  window.addEventListener('pointerup', (e) => {
    if (!arrasto || e.pointerId !== arrasto.id) return;
    const a = arrasto;
    arrasto = null;
    caixa.classList.remove('pronto-para-soltar');
    if (!a.ativo) return; // foi um clique: o click cuida
    a.el.dataset.arrastou = '1';
    const s = caixa.getBoundingClientRect();
    if (e.clientX > s.left && e.clientX < s.right && e.clientY > s.top && e.clientY < s.bottom) {
      const r = a.el.getBoundingClientRect();
      jogar(Number(a.el.dataset.i), { el: a.el, r: { left: r.left, top: r.top, width: r.width, height: r.height } });
    } else {
      // fora do sistema: a carta volta para a mesa
      a.el.classList.remove('arrastando');
      a.el.animate([{ transform: a.transform }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
      a.el.style.transform = '';
    }
  });

  // ---- cliques ----
  raiz.addEventListener('click', (e) => {
    const carta = e.target.closest('.carta');
    if (carta) {
      if (carta.dataset.arrastou) {
        delete carta.dataset.arrastou;
        return;
      }
      const r = carta.getBoundingClientRect();
      jogar(Number(carta.dataset.i), { el: carta, r: { left: r.left, top: r.top, width: r.width, height: r.height } });
      return;
    }
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    if (b.dataset.acao === 'desfazer' && jogadas.length) {
      jogadas.pop();
      configurar(jogadas.length);
      pintarCartas();
    } else if (b.dataset.acao === 'recomecar') {
      jogadas = [];
      configurar(0, true);
      pintarCartas(true);
    }
  });

  raiz.addEventListener('change', (e) => {
    if (e.target.name !== 'area') return;
    area = e.target.value;
    jogadas = [];
    configurar(0, true);
    pintarCartas(true);
    som?.tique(0.8);
  });

  atualizar();
}
