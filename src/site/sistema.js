// O SISTEMA DE VERDADE — um produto próprio para cada área.
//
// Cada área é um aplicativo com identidade e layout dele, não o mesmo
// esqueleto repetido:
//   Financeiro  → "Caixa":   menu lateral e a faixa de saldos sempre à vista;
//   Operação    → "Torre":   abas no alto, mapa de rotas, escala por hora;
//   Comercial   → "Funil":   abas em pílula, quadro de etapas, documentos;
//   Atendimento → "Central": trilho escuro, caixa de entrada em colunas.
// E cada módulo tem a tela que o trabalho dele pede (agenda, DANFE,
// conciliação, Gantt, rastreio, kanban, comparação de contrato…).
//
// A matéria faz as passagens: quando uma tela entra, ela se dissolve, as
// partículas desenham o ESQUELETO lido da própria interface (cada caixa vira
// contorno, cada linha de texto um traço, cada botão um bloco — o principal
// em vermelhão —, cada rota do mapa uma linha) e a tela se solidifica por cima.
// Todos os dados são fictícios, e o sistema diz isso no topo.
import { amostrar, dinamicas, BRANCO, ACESO } from '../materia/formas.js';

const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const feito = (t) => `<p class="app-feito">${esc(t)}</p>`;
const botao = (t, acao, arg = '', sim = false) => `<button type="button" class="app-botao${sim ? ' app-botao--sim' : ''}" data-t="${acao}" data-a="${esc(arg)}">${esc(t)}</button>`;
const cab = (m, extra = '') => `<div class="app-cab"><div><h3>${esc(m.nome)}</h3><p class="app-ia"><span class="app-ia-selo">IA</span>${esc(`A IA ${m.ia}.`)}${m.aprova ? ` <strong>${esc(`Você ${m.aprova}.`)}</strong>` : ''}</p></div>${extra}</div>`;

// os produtos: nome, casca e o que fica fixo em todas as telas da área
const PRODUTOS = {
  financeiro: { nome: 'Caixa', area: 'Financeiro', casca: 'lateral', status: 'setembro aberto' },
  operacao: { nome: 'Torre', area: 'Operação e logística', casca: 'abas', status: '3 veículos em rota' },
  comercial: { nome: 'Funil', area: 'Comercial', casca: 'pilulas', status: 'R$ 309 mil em negociação' },
  atendimento: { nome: 'Central', area: 'Atendimento', casca: 'trilho', status: '5 conversas abertas' },
};

// ===========================================================================
// FINANCEIRO — "Caixa"
const faixaCaixa = () => `<div class="caixa-faixa">
  <div class="e-caixa"><span>Saldo hoje</span><strong>R$ 184.320</strong></div>
  <div class="e-caixa"><span>A pagar na semana</span><strong>R$ 36.610</strong></div>
  <div class="e-caixa"><span>A receber na semana</span><strong>R$ 63.300</strong></div>
</div>`;

const AGENDA = {
  pagar: [
    ['seg 29', [['Transportes Serra Azul', 18450, '']]],
    ['ter 30', [['Papelaria Central', 1240, 'pago']]],
    ['qua 01', [['Clínica Bem Viver', 9600, '']]],
    ['qui 02', []],
    ['sex 03', [['Auto Peças Minas', 7320, 'atrasado']]],
  ],
  receber: [
    ['seg 29', []],
    ['ter 30', [['Grupo Horizonte', 42000, '']]],
    ['qua 01', []],
    ['qui 02', [['Rede Farma Mais', 12400, '']]],
    ['sex 03', [['Escola Nova Era', 8900, '']]],
  ],
};

const FILA_ALCADA = [
  { quem: 'Transportes Serra Azul', o: 'Frete de setembro', v: 18450, limite: 25000, ia: 'Conferi com o contrato: valor e rotas batem.' },
  { quem: 'Auto Peças Minas', o: 'Manutenção da frota', v: 7320, limite: 5000, ia: 'Acima do limite do setor: precisa da sua aprovação.' },
  { quem: 'Gráfica Ponto Certo', o: 'Material impresso', v: 3180, limite: 5000, ia: 'Pedido de compra encontrado; a nota ainda não chegou.' },
];

const NOTAS = [
  { n: '004.812', emit: 'Transportes Serra Azul Ltda.', data: '25/09/2026', itens: [['Frete — rotas de setembro', '14', 'R$ 18.450,00']], total: 'R$ 18.450,00', pedido: 'PC-1177', confere: true },
  { n: '118.340', emit: 'Auto Peças Minas S.A.', data: '24/09/2026', itens: [['Pastilha de freio', '8', 'R$ 2.960,00'], ['Mão de obra', '1', 'R$ 4.360,00']], total: 'R$ 7.320,00', pedido: 'PC-1180', confere: false, diverge: 'O pedido PC-1180 é de R$ 6.890: a nota veio R$ 430 acima.' },
];

const CONCILIA = [
  ['23/09', 'PIX GRUPO HORIZONTE', 42000, 'Recebimento · contrato 2026'],
  ['23/09', 'BOLETO SERRA AZUL', -18450, 'Frete de setembro'],
  ['24/09', 'TED CLINICA BEM VIVER', -9600, 'Plano de saúde'],
  ['24/09', 'TAR PACOTE SERV', -189, null],
  ['25/09', 'PIX REDE FARMA', 12400, 'Parcela 3/6'],
];

const COBRANCAS = [
  { quem: 'Clínica Bem Viver', v: 9600, dias: 3, linha: [['D+1', 'Lembrete enviado pelo WhatsApp'], ['D+3', 'Cliente: “vamos pagar só dia 05”']], ia: 'Sem problema! Registrei a promessa para 05/10 e mando o boleto atualizado sem multa até essa data.' },
  { quem: 'Padaria Trigo Bom', v: 2350, dias: 8, linha: [['D+1', 'Lembrete enviado'], ['D+3', 'Lembrete enviado'], ['D+7', 'Sem resposta']], ia: 'Oi! A fatura de R$ 2.350 venceu há 8 dias. Posso gerar um PIX com vencimento para sexta?' },
];

const FECHAMENTO = [
  ['Lançamentos importados', '412 de 412', 'ok'],
  ['Conciliação bancária', '398 pela IA · 14 por você', 'ok'],
  ['Provisões do mês', 'férias, 13º e impostos', 'ok'],
  ['Reclassificações', '2 despesas mudaram de conta — veja no relatório', 'aviso'],
  ['Relatório de fechamento', 'pronto para a diretoria', 'ok'],
];

const TELAS = {};
const ACOES = {};

TELAS['Contas a pagar e receber'] = (m, st) => {
  const lado = st.lado || 'pagar';
  const dias = AGENDA[lado];
  return `${faixaCaixa()}${cab(m, `<div class="app-chips" role="group" aria-label="Ver">${['pagar', 'receber'].map((l) => `<button type="button" class="chip" data-t="lado" data-a="${l}" aria-pressed="${l === lado}">A ${l}</button>`).join('')}</div>`)}
  <div class="agenda">${dias
    .map(([d, itens]) => {
      const total = itens.reduce((s, i) => s + i[1], 0);
      return `<div class="agenda-dia e-caixa"><p class="agenda-data">${esc(d)}</p><p class="agenda-total">${total ? reais(total) : '—'}</p>${itens.map(([q, v, s]) => `<div class="agenda-item${s ? ` agenda-item--${s}` : ''}"><span>${esc(q)}</span><strong>${reais(v)}</strong>${s ? `<em>${s}</em>` : ''}</div>`).join('')}</div>`;
    })
    .join('')}</div>
  <p class="app-nota-ia"><span class="app-ia-selo">IA</span> Dois boletos chegaram por e-mail hoje e já estão na agenda.</p>`;
};
ACOES['Contas a pagar e receber'] = (t, a, st) => (t === 'lado' ? ((st.lado = a), 'passar') : null);

TELAS['Aprovação em alçadas'] = (m, st) => {
  const faltam = FILA_ALCADA.filter((_, i) => !st[i]).length;
  return `${faixaCaixa()}${cab(m)}<p class="app-contador">${faltam ? `${faltam} esperando você` : 'Nada esperando você.'}</p>
  <div class="alcadas">${FILA_ALCADA.map((f, i) => {
    const acima = f.v > f.limite;
    const perc = Math.min(100, (f.v / Math.max(f.v, f.limite)) * 100);
    const marca = (f.limite / Math.max(f.v, f.limite)) * 100;
    return `<article class="alcada e-caixa${acima ? ' alerta' : ''}">
      <header><div><strong>${esc(f.quem)}</strong><span>${esc(f.o)}</span></div><p class="alcada-valor">${reais(f.v)}</p></header>
      <div class="alcada-regua" aria-label="Valor diante do limite de ${reais(f.limite)}"><span class="e-barra" style="width:${perc}%"></span><i style="left:${marca}%"></i></div>
      <p class="alcada-limite">limite do setor: ${reais(f.limite)}</p>
      <p class="app-nota">${esc(f.ia)}</p>
      ${st[i] ? feito(st[i] === 'sim' ? 'Aprovado por você' : 'Recusado, com a sua nota') : `<div class="app-botoes">${botao('Aprovar', 'decide', `${i}:sim`, true)}${botao('Recusar', 'decide', `${i}:nao`)}</div>`}
    </article>`;
  }).join('')}</div>`;
};
ACOES['Aprovação em alçadas'] = (t, a, st, som) => {
  if (t !== 'decide') return null;
  const [i, d] = a.split(':');
  st[i] = d;
  if (d === 'sim') som?.visto();
  return 'redesenhar';
};

TELAS['Leitura de notas'] = (m, st) => {
  const k = (st.i || 0) % NOTAS.length;
  const n = NOTAS[k];
  return `${faixaCaixa()}${cab(m)}
  <div class="leitura">
    <div class="danfe e-caixa">
      <div class="danfe-topo"><strong>DANFE</strong><span>NF-e nº ${n.n} · série 1</span></div>
      <div class="danfe-grade"><div class="e-caixa"><small>Emitente</small><span class="lido" style="--j:0">${esc(n.emit)}</span></div><div class="e-caixa"><small>Emissão</small><span>${n.data}</span></div></div>
      <table class="danfe-itens"><thead><tr><th>Descrição</th><th>Qtd.</th><th>Valor</th></tr></thead><tbody>${n.itens.map(([d, q, v]) => `<tr><td>${esc(d)}</td><td>${q}</td><td>${v}</td></tr>`).join('')}</tbody></table>
      <div class="danfe-total e-caixa"><small>Valor total da nota</small><span class="lido" style="--j:1">${n.total}</span></div>
    </div>
    <div class="leitura-campos">
      <p class="app-rotulo">O que a IA tirou da nota</p>
      <dl>${[['Fornecedor', n.emit], ['Valor', n.total], ['Pedido de compra', n.pedido], ['Confere com o pedido', n.confere ? 'Sim' : 'Não']].map(([a, b], j) => `<div class="app-campo" style="--j:${j}"><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
      ${n.diverge ? `<p class="app-diverge e-caixa">${esc(n.diverge)}</p>` : '<p class="app-ok">Nada fora do esperado.</p>'}
      <div class="app-botoes">${st[`ok${k}`] ? feito('Leitura confirmada por você') : botao('Confirmar leitura', 'confirma', k, true)}${botao('Ler a próxima', 'proxima')}</div>
    </div>
  </div>`;
};
ACOES['Leitura de notas'] = (t, a, st, som) => {
  if (t === 'confirma') return (st[`ok${a}`] = true), som?.visto(), 'redesenhar';
  if (t === 'proxima') return (st.i = (st.i || 0) + 1), 'passar';
  return null;
};

TELAS['Conciliação'] = (m, st) => {
  const casados = 398 + (st.aceita ? 1 : 0);
  return `${faixaCaixa()}${cab(m, `<p class="concilia-conta"><strong>${casados}</strong> de 412 casados</p>`)}
  <div class="concilia">
    <div class="concilia-cab"><span>Extrato do banco</span><span></span><span>No sistema</span></div>
    ${CONCILIA.map(([d, desc, v, sis]) => {
      const par = sis || (st.aceita ? 'Despesas bancárias · tarifa' : null);
      return `<div class="concilia-linha${par ? '' : ' sem-par'}">
        <div class="e-caixa"><small>${d}</small><span>${esc(desc)}</span><strong class="${v < 0 ? 'saida' : 'entrada'}">${reais(v)}</strong></div>
        <span class="concilia-elo${par ? ' casado' : ''}" aria-hidden="true"></span>
        ${par ? `<div class="e-caixa"><span>${esc(par)}</span><strong>${reais(v)}</strong></div>` : `<div class="concilia-sugere e-caixa"><span>IA sugere: <strong>Despesas bancárias · tarifa</strong></span>${botao('Aceitar', 'aceita', '', true)}</div>`}
      </div>`;
    }).join('')}
  </div>`;
};
ACOES['Conciliação'] = (t, a, st, som) => (t === 'aceita' ? ((st.aceita = true), som?.visto(), 'redesenhar') : null);

TELAS['Cobrança'] = (m, st) => {
  const k = st.i || 0;
  const c = COBRANCAS[k];
  return `${faixaCaixa()}${cab(m)}
  <div class="cobranca">
    <ul class="cobranca-lista e-caixa">${COBRANCAS.map((x, i) => `<li><button type="button" class="cobranca-item" data-t="cliente" data-a="${i}" aria-current="${i === k}"><span>${esc(x.quem)}</span><small>${reais(x.v)} · ${x.dias} dias</small></button></li>`).join('')}</ul>
    <div class="cobranca-regua">
      <ol class="regua">${c.linha.map(([d, t]) => `<li><span class="regua-dia">${d}</span><span>${esc(t)}</span></li>`).join('')}</ol>
      ${st[`env${k}`] ? `<p class="app-msg app-msg--eu">${esc(c.ia)}</p>${feito('Enviado por você')}` : `<div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> sugere responder:</p><p>${esc(c.ia)}</p><div class="app-botoes">${botao('Enviar', 'envia', k, true)}${botao('Registrar promessa', 'envia', k)}</div></div>`}
    </div>
  </div>`;
};
ACOES['Cobrança'] = (t, a, st, som) => {
  if (t === 'cliente') return (st.i = Number(a)), 'passar';
  if (t === 'envia') return (st[`env${a}`] = true), som?.visto(), 'redesenhar';
  return null;
};

TELAS['Fechamento'] = (m, st) => `${faixaCaixa()}${cab(m)}
  <ol class="checklist">${FECHAMENTO.map(([t, d, s]) => `<li class="checklist-item checklist-item--${s} e-caixa"><span class="checklist-marca" aria-hidden="true"></span><div><strong>${esc(t)}</strong><span>${esc(d)}</span></div></li>`).join('')}</ol>
  ${st.fechado ? feito('Setembro fechado por você às 17:42') : `<div class="app-botoes">${botao('Aprovar o fechamento de setembro', 'fecha', '', true)}${botao('Reabrir', 'nada')}</div>`}`;
ACOES['Fechamento'] = (t, a, st, som) => (t === 'fecha' ? ((st.fechado = true), som?.visto(), 'redesenhar') : null);

// ===========================================================================
// OPERAÇÃO — "Torre"
const LUGARES = { Contagem: [70, 96], Betim: [26, 152], Centro: [196, 128], Pampulha: [226, 54], Barreiro: [142, 208], 'Nova Lima': [292, 184], Itabirito: [356, 236], 'Venda Nova': [258, 18] };
const ORDENS = [
  // o trajeto: os lugares nas pontas e as curvas do caminho no meio
  { os: 'OS-2481', cli: 'Metalúrgica Vale', rota: ['Contagem', 'Betim'], via: [[70, 96], [92, 118], [60, 128], [44, 146], [26, 152]], saida: '06:10', s: 'Em rota', p: 0.62 },
  { os: 'OS-2482', cli: 'Hospital Santa Luzia', rota: ['Centro', 'Pampulha'], via: [[196, 128], [178, 104], [206, 86], [214, 66], [226, 54]], saida: '06:40', s: 'Em rota', p: 0.4 },
  { os: 'OS-2483', cli: 'Escola Nova Era', rota: ['Barreiro', 'Centro'], via: [[142, 208], [150, 180], [176, 168], [182, 146], [196, 128]], saida: '07:00', s: 'Aguardando', p: 0 },
  { os: 'OS-2484', cli: 'Mineração Alvorada', rota: ['Nova Lima', 'Itabirito'], via: [[292, 184], [318, 176], [326, 204], [344, 214], [356, 236]], saida: '07:30', s: 'Atrasada', p: 0.3 },
  { os: 'OS-2485', cli: 'Shopping Del Rey', rota: ['Venda Nova', 'Pampulha'], via: [[258, 18], [270, 36], [248, 44], [226, 54]], saida: '08:00', s: 'Concluída', p: 1 },
];
const ESQUERDA = new Set(['Nova Lima', 'Betim', 'Barreiro']);
const pontos = (via) => via.map((p) => p.join(',')).join(' ');
// o ponto a uma fração p do comprimento do trajeto (onde o veículo está)
function aoLongo(via, p) {
  const trechos = via.slice(1).map((q, k) => Math.hypot(q[0] - via[k][0], q[1] - via[k][1]));
  let d = p * trechos.reduce((a, b) => a + b, 0);
  for (let k = 0; k < trechos.length; k++) {
    if (d <= trechos[k]) {
      const t = d / trechos[k];
      return [via[k][0] + (via[k + 1][0] - via[k][0]) * t, via[k][1] + (via[k + 1][1] - via[k][1]) * t];
    }
    d -= trechos[k];
  }
  return via[via.length - 1];
}

function mapa(sel) {
  const ruas = [];
  for (let x = 20; x < 400; x += 40) ruas.push(`<line x1="${x}" y1="0" x2="${x}" y2="260" />`);
  for (let y = 20; y < 260; y += 40) ruas.push(`<line x1="0" y1="${y}" x2="400" y2="${y}" />`);
  return `<svg class="mapa e-caixa" viewBox="0 0 400 260" role="img" aria-label="Mapa das rotas do dia">
    <g class="mapa-ruas">${ruas.join('')}</g>
    ${ORDENS.map((o, i) => `<polyline class="mapa-rota e-linha${i === sel ? ' acesa' : ''}" points="${pontos(o.via)}" />`).join('')}
    ${Object.entries(LUGARES).map(([n, [x, y]]) => {
      // o nome fica do lado em que nenhuma rota nem veículo passa por cima
      const esq = ESQUERDA.has(n);
      return `<g class="mapa-lugar"><circle cx="${x}" cy="${y}" r="4" /><text x="${esq ? x - 7 : x + 7}" y="${y + 4}" text-anchor="${esq ? 'end' : 'start'}">${n}</text></g>`;
    }).join('')}
    ${ORDENS.filter((o) => o.p > 0 && o.p < 1).map((o) => {
      const [x, y] = aoLongo(o.via, o.p);
      return `<circle class="mapa-veiculo${ORDENS.indexOf(o) === sel ? ' aceso' : ''}" r="6" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" />`;
    }).join('')}
  </svg>`;
}

TELAS['Ordens de serviço'] = (m, st) => {
  const sel = st.sel ?? 0;
  const o = ORDENS[sel];
  return `${cab(m)}<div class="torre">
    <ul class="torre-lista">${ORDENS.map((x, i) => `<li><button type="button" class="torre-os e-caixa" data-t="sel" data-a="${i}" aria-current="${i === sel}"><span><strong>${x.os}</strong> ${esc(x.cli)}</span><small>${x.rota.join(' → ')} · ${x.saida}</small><em class="estado estado--${x.s.split(' ')[0].toLowerCase()}">${x.s}</em></button></li>`).join('')}</ul>
    <div class="torre-mapa">${mapa(sel)}<p class="torre-legenda"><strong>${o.os}</strong> · ${esc(o.cli)} · ${o.rota.join(' → ')} · ${o.s}</p></div>
  </div>`;
};
ACOES['Ordens de serviço'] = (t, a, st) => (t === 'sel' ? ((st.sel = Number(a)), 'redesenhar') : null);

const ESCALA = [
  { v: 'Ônibus 12', q: 'Paulo', blocos: [[6.1, 7.4, 'Contagem → Betim'], [9, 10.5, 'Betim → Contagem']] },
  { v: 'Ônibus 07', q: 'Sérgio', blocos: [[7.5, 9.2, 'Nova Lima → Itabirito', 'conflito']] },
  { v: 'Van 03', q: 'Luana', blocos: [[6.6, 7.6, 'Centro → Pampulha'], [8, 8.8, 'Pampulha → Centro']] },
  { v: 'Ônibus 21', q: 'Marcos', blocos: [[10, 11.5, 'Barreiro → Centro']] },
];
TELAS['Programação'] = (m, st) => {
  const H0 = 5;
  const H1 = 12;
  const pos = (h) => ((h - H0) / (H1 - H0)) * 100;
  return `${cab(m)}<div class="gantt e-caixa">
    <div class="gantt-horas"><span></span>${Array.from({ length: H1 - H0 + 1 }, (_, k) => `<small style="left:${pos(H0 + k)}%">${String(H0 + k).padStart(2, '0')}h</small>`).join('')}</div>
    ${ESCALA.map((l) => `<div class="gantt-linha"><div class="gantt-veiculo"><strong>${l.v}</strong><span>${st.trocou && l.q === 'Sérgio' ? 'Marcos' : l.q}</span></div><div class="gantt-trilho">${l.blocos.map(([a, b, r, c]) => `<span class="gantt-bloco e-barra${c && !st.trocou ? ' gantt-bloco--conflito' : ''}" style="left:${pos(a)}%;width:${pos(b) - pos(a)}%">${esc(r)}</span>`).join('')}</div></div>`).join('')}
  </div>
  ${st.trocou ? feito('Escala confirmada: Marcos assume a rota das 07:30') : `<div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> Sérgio passa do limite de horas da semana na rota das 07:30. Marcos está livre até as 10h.</p><div class="app-botoes">${botao('Trocar por Marcos', 'troca', '', true)}${botao('Manter', 'nada')}</div></div>`}`;
};
ACOES['Programação'] = (t, a, st, som) => (t === 'troca' ? ((st.trocou = true), som?.visto(), 'redesenhar') : null);

const MENSAGENS = [
  ['06:52', 'Paulo · OS-2481', '“Pneu furou na Via Expressa, já troquei, perdi uns 20 minutos, sigo pra Betim.”', 'OS-2481 · atraso de 20 min · resolvido em rota'],
  ['07:05', 'Luana · OS-2482', '“Peguei os 12, saindo agora.”', 'OS-2482 · embarque completo · em rota'],
  ['07:48', 'Sérgio · OS-2484', '“Luz de temperatura acendeu, parei no posto do km 12.”', 'OS-2484 · veículo parado · precisa de socorro'],
];
TELAS['Acompanhamento'] = (m, st) => {
  const n = Math.min(MENSAGENS.length, st.n || 2);
  return `${cab(m)}<div class="feed">
    <div class="feed-col"><p class="app-rotulo">Chegou dos motoristas</p>${MENSAGENS.slice(0, n).map(([h, q, t]) => `<div class="app-msg app-msg--eles"><small>${h} · ${esc(q)}</small>${esc(t)}</div>`).join('')}</div>
    <div class="feed-col"><p class="app-rotulo">O que a IA registrou</p>${MENSAGENS.slice(0, n).map(([h, , , r]) => `<div class="feed-registro e-caixa${/socorro/.test(r) ? ' alerta' : ''}"><small>${h}</small><span>${esc(r)}</span></div>`).join('')}</div>
  </div>${n < MENSAGENS.length ? `<div class="app-botoes">${botao('Receber a próxima mensagem', 'mais', '', true)}</div>` : ''}`;
};
ACOES['Acompanhamento'] = (t, a, st) => (t === 'mais' ? ((st.n = (st.n || 2) + 1), 'passar') : null);

TELAS['Painel do cliente'] = (m, st) => `${cab(m)}<div class="rastreio e-caixa">
  <p class="app-rotulo">O que o seu cliente vê</p>
  <h4>Hospital Santa Luzia · sua viagem de hoje</h4>
  <p class="rastreio-eta">chega em <strong>12 min</strong></p>
  <ol class="rastreio-paradas">${[['Saída', '06:40', 'feita'], ['Av. Amazonas', '06:52', 'feita'], ['Centro', 'agora', 'agora'], ['Pampulha', '07:10', '']].map(([p, h, s]) => `<li class="${s}"><span class="rastreio-ponto"></span><strong>${p}</strong><small>${h}</small></li>`).join('')}</ol>
  ${st.avisou ? feito('Aviso enviado pelo WhatsApp do cliente') : `<div class="app-botoes">${botao('Avisar o cliente', 'avisa', '', true)}</div>`}
</div>`;
ACOES['Painel do cliente'] = (t, a, st, som) => (t === 'avisa' ? ((st.avisou = true), som?.visto(), 'redesenhar') : null);

TELAS['Ocorrências'] = (m, st) => {
  const onda = Array.from({ length: 48 }, (_, i) => 18 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31)) * 82);
  return `${cab(m)}<div class="ocorrencia">
    <div class="ocorrencia-audio e-caixa"><p class="app-rotulo">Áudio de Sérgio · 07:48 · 0:21</p><div class="onda">${onda.map((h) => `<span class="e-barra" style="height:${h.toFixed(0)}%"></span>`).join('')}</div>
    <p class="ocorrencia-texto">“Bom dia, aqui é o Sérgio, OS 2484. A luz de temperatura acendeu, parei no posto do km 12 da MG-030.”</p></div>
    <div class="leitura-campos"><p class="app-rotulo">O que a IA entendeu</p>
      <dl>${[['Ordem', 'OS-2484'], ['Tipo', 'Superaquecimento'], ['Onde', 'Posto do km 12 · MG-030'], ['Risco', 'Rota das 08:30']].map(([a, b], j) => `<div class="app-campo" style="--j:${j}"><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
      ${st.socorro ? feito('Ônibus reserva a caminho · chega em 25 min') : `<p class="app-diverge e-caixa">Sugestão: mandar o ônibus reserva da garagem de Nova Lima.</p><div class="app-botoes">${botao('Mandar o reserva', 'socorro', '', true)}${botao('Ligar para o Sérgio', 'nada')}</div>`}
    </div>
  </div>`;
};
ACOES['Ocorrências'] = (t, a, st, som) => (t === 'socorro' ? ((st.socorro = true), som?.visto(), 'redesenhar') : null);

const CUSTOS = [
  ['OS-2481', 'Metalúrgica Vale', 900, 860],
  ['OS-2482', 'Hospital Santa Luzia', 640, 655],
  ['OS-2484', 'Mineração Alvorada', 1450, 1980],
  ['OS-2485', 'Shopping Del Rey', 520, 498],
];
TELAS['Custos'] = (m, st) => `${cab(m)}<div class="custos e-caixa">${CUSTOS.map(([os, cli, p, r]) => {
  const d = (r - p) / p;
  const excede = d > 0.15;
  return `<div class="custos-linha${excede ? ' alerta' : ''}"><div><strong>${os}</strong><span>${esc(cli)}</span></div>
    <div class="custos-barras"><span class="e-barra previsto" style="width:${(p / 2000) * 100}%"></span><span class="e-barra realizado" style="width:${(r / 2000) * 100}%"></span></div>
    <div class="custos-num"><span>${reais(p)} → ${reais(r)}</span><em>${d > 0 ? '+' : ''}${Math.round(d * 100)}%</em></div></div>`;
}).join('')}</div>
  <div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> OS-2484 custou 37% acima: pedágio extra e 38 km de desvio pela serra.</p>${st.aprovou ? feito('Exceção aprovada por você') : `<div class="app-botoes">${botao('Aprovar a exceção', 'aprova', '', true)}${botao('Contestar', 'nada')}</div>`}</div>`;
ACOES['Custos'] = (t, a, st, som) => (t === 'aprova' ? ((st.aprovou = true), som?.visto(), 'redesenhar') : null);

// ===========================================================================
// COMERCIAL — "Funil"
const ETAPAS = ['Contato', 'Proposta', 'Negociação', 'Fechado'];
const NEGOCIOS = [
  { e: 'Padaria Trigo Bom', o: 'Pedidos online', v: 9500, etapa: 0 },
  { e: 'Clínica Sorriso', o: 'Agendamento', v: 38000, etapa: 1 },
  { e: 'Construtora Pilar', o: 'Controle de obras', v: 64000, etapa: 1 },
  { e: 'Grupo Horizonte', o: 'Renovação anual', v: 120000, etapa: 2 },
  { e: 'Rede Farma Mais', o: 'Integração de lojas', v: 87000, etapa: 3 },
];
TELAS['Funil de negócios'] = (m, st) => {
  st.etapas ||= NEGOCIOS.map((n) => n.etapa);
  return `${cab(m)}<div class="kanban">${ETAPAS.map((et, k) => {
    const aqui = NEGOCIOS.map((n, i) => [n, i]).filter(([, i]) => st.etapas[i] === k);
    return `<div class="kanban-col e-caixa"><p class="kanban-titulo">${et} <small>${reais(aqui.reduce((s, [n]) => s + n.v, 0))}</small></p>${aqui
      .map(([n, i]) => `<div class="kanban-card e-caixa"><strong>${esc(n.e)}</strong><span>${esc(n.o)}</span><p>${reais(n.v)}</p>${k < 3 ? `<button type="button" class="chip" data-t="avanca" data-a="${i}">avançar →</button>` : '<span class="kanban-ganho">ganho</span>'}</div>`)
      .join('')}</div>`;
  }).join('')}</div>`;
};
ACOES['Funil de negócios'] = (t, a, st, som) => {
  if (t !== 'avanca') return null;
  st.etapas[a] = Math.min(3, st.etapas[a] + 1);
  if (st.etapas[a] === 3) som?.visto();
  return 'redesenhar';
};

const EMAILS = [
  { de: 'diretoria@clinicasorriso.com.br', ass: 'Sistema de agendamento para 3 unidades', tags: ['Agendamento', '3 unidades', 'Prioridade alta'], para: 'Ana' },
  { de: 'compras@construtorapilar.com.br', ass: 'Controle de 3 obras com medição semanal', tags: ['Controle de obras', 'até R$ 70 mil', 'Já tem proposta'], para: 'Bruno' },
  { de: 'contato@buffetestrela.com.br', ass: 'Orçamento de site', tags: ['Fora do escopo', 'Prioridade baixa'], para: 'Arquivar' },
];
TELAS['Triagem de contatos'] = (m, st) => `${cab(m)}<ul class="inbox">${EMAILS.map((e, i) => `<li class="inbox-item e-caixa">
  <div class="inbox-de"><strong>${esc(e.de)}</strong><span>${esc(e.ass)}</span></div>
  <div class="inbox-tags">${e.tags.map((t) => `<span class="tag${/alta|Já tem/.test(t) ? ' tag--acesa' : ''}">${esc(t)}</span>`).join('')}</div>
  ${st[i] ? feito(e.para === 'Arquivar' ? 'Arquivado' : `Com ${e.para}`) : botao(e.para === 'Arquivar' ? 'Arquivar' : `Encaminhar para ${e.para}`, 'encaminha', i, e.para !== 'Arquivar')}
</li>`).join('')}</ul>`;
ACOES['Triagem de contatos'] = (t, a, st) => (t === 'encaminha' ? ((st[a] = true), 'redesenhar') : null);

TELAS['Propostas'] = (m, st) => `${cab(m)}<div class="proposta">
  <article class="folha e-caixa">
    <p class="folha-marca">Proposta comercial · nº 2026-041</p>
    <h4>Clínica Sorriso</h4>
    <p class="folha-sub">Sistema de agendamento com confirmação pelo WhatsApp</p>
    <p class="folha-secao">Escopo</p>
    <ul><li>Agenda das 3 unidades num lugar só</li><li>Confirmação automática 24 h antes</li><li>Lista de espera para encaixe</li></ul>
    <p class="folha-secao">Investimento</p>
    <table><tbody><tr><td>Implantação</td><td>R$ 32.000</td></tr><tr><td>Desconto de fidelidade</td><td>− R$ 2.000</td></tr><tr><td>Acompanhamento (6 meses)</td><td>R$ 8.000</td></tr><tr class="folha-total"><td>Total</td><td>R$ 38.000</td></tr></tbody></table>
  </article>
  <aside class="proposta-notas"><p class="app-rotulo">Notas da IA</p>
    <p class="nota-margem e-caixa">Montei a partir do e-mail de 22/09 e da tabela de preços vigente.</p>
    <p class="nota-margem e-caixa">Apliquei o desconto de fidelidade: é cliente desde 2023.</p>
    ${st.enviou ? feito('Enviada por você às 10:14') : `<div class="app-botoes">${botao('Enviar proposta', 'envia', '', true)}${botao('Ajustar', 'nada')}</div>`}
  </aside></div>`;
ACOES['Propostas'] = (t, a, st, som) => (t === 'envia' ? ((st.enviou = true), som?.visto(), 'redesenhar') : null);

TELAS['Contratos'] = (m, st) => `${cab(m)}<div class="diff">
  <div class="diff-cab"><span>Seu modelo</span><span>Recebido do Grupo Horizonte</span></div>
  ${[
    ['4. Reajuste', 'Reajuste anual pelo IPCA.', 'Reajuste anual pelo IPCA.'],
    ['7. Multa', 'Multa de 2% por atraso.', 'Multa de 2% por atraso.'],
    ['9. Rescisão', 'Rescisão com aviso prévio de <mark>60</mark> dias.', 'Rescisão com aviso prévio de <mark>30</mark> dias.'],
  ].map(([t, a, b]) => `<div class="diff-linha${a !== b ? ' mudou' : ''}"><p class="diff-clausula">${t}</p><div class="e-caixa">${a}</div><div class="e-caixa">${st.pediu && a !== b ? a : b}</div></div>`).join('')}
  ${st.pediu ? feito('Pedido de ajuste enviado: 60 dias de aviso') : `<div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> 13 de 14 cláusulas iguais ao modelo. A 9 reduz o aviso de 60 para 30 dias.</p><div class="app-botoes">${botao('Pedir 60 dias', 'pede', '', true)}${botao('Aceitar 30 dias', 'nada')}</div></div>`}
</div>`;
ACOES['Contratos'] = (t, a, st, som) => (t === 'pede' ? ((st.pediu = true), som?.visto(), 'redesenhar') : null);

TELAS['Painel do funil'] = (m) => {
  const f = [['Contatos', 120], ['Reuniões', 38], ['Propostas', 14], ['Fechados', 5]];
  return `${cab(m)}<div class="funil">${f.map(([t, v], i) => `<div class="funil-degrau"><span class="e-barra${i === 3 ? ' acesa' : ''}" style="width:${(v / 120) * 100}%"></span><p><strong>${v}</strong> ${t}${i ? ` <small>${Math.round((v / f[i - 1][1]) * 100)}% da etapa anterior</small>` : ''}</p></div>`).join('')}</div>
  <div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> Propostas enviadas na terça fecham 2× mais que as de sexta. O Grupo Horizonte está parado há 9 dias na negociação.</p></div>`;
};

const CLIENTES = [
  ['Rede Farma Mais', 92, 'há 3 dias', 'Treinar as 2 lojas novas'],
  ['Escola Nova Era', 64, 'há 21 dias', 'Revisar o uso do módulo de matrícula'],
  ['Clínica Bem Viver', 38, 'há 47 dias', 'Ligar: uso caiu 60% no mês'],
];
TELAS['Pós-venda'] = (m, st) => `${cab(m)}<ul class="saude">${CLIENTES.map(([c, s, u, p], i) => `<li class="saude-item e-caixa${s < 50 ? ' alerta' : ''}">
  <div><strong>${esc(c)}</strong><small>último contato ${u}</small></div>
  <div class="saude-barra" aria-label="Saúde ${s} de 100"><span class="e-barra" style="width:${s}%"></span></div><p class="saude-num">${s}</p>
  <p class="saude-passo">${esc(p)}</p>${st[i] ? feito('Agendado') : botao('Agendar', 'agenda', i, s < 50)}
</li>`).join('')}</ul>`;
ACOES['Pós-venda'] = (t, a, st) => (t === 'agenda' ? ((st[a] = true), 'redesenhar') : null);

// ===========================================================================
// ATENDIMENTO — "Central"
const FILAS_CANAL = [
  ['WhatsApp', [['Mariana Souza', 'Troca de produto', '4 min'], ['Roberto Dias', 'Cobrança em dobro', '1 h 52', 'estourando']]],
  ['E-mail', [['Carlos Menezes', 'Nota fiscal', '38 min'], ['Júlia Castro', 'Cancelamento', '2 h 40', 'estourando']]],
  ['Site', [['Ana Beatriz Lima', 'Prazo de entrega', '9 min']]],
];
TELAS['Central de atendimento'] = (m) => `${cab(m, '<p class="central-resumo"><strong>61%</strong> resolvidos pela IA hoje</p>')}<div class="canais">${FILAS_CANAL.map(([c, itens]) => `<div class="canal e-caixa"><p class="canal-nome">${c} <small>${itens.length}</small></p>${itens.map(([q, a, t, s]) => `<div class="canal-ticket e-caixa${s ? ' alerta' : ''}"><strong>${esc(q)}</strong><span>${esc(a)}</span><em>${t}</em></div>`).join('')}</div>`).join('')}</div>`;

const CONVERSAS = [
  { q: 'Ana Beatriz Lima', c: 'Site', msgs: ['Meu pedido 88340 chega quando?'], ia: 'Oi, Ana! Seu pedido saiu hoje cedo e chega amanhã até as 18h. Mando o rastreio por aqui.', ficha: ['Cliente desde 2024', '6 pedidos', 'Último: 88340 · em rota'] },
  { q: 'Mariana Souza', c: 'WhatsApp', msgs: ['Quero trocar o tênis, veio pequeno.'], ia: 'Claro, Mariana! A troca está liberada. Qual número você prefere? Buscamos na sua casa sem custo.', ficha: ['Cliente desde 2022', '14 pedidos', 'Último: 88213 · entregue há 9 dias'] },
];
TELAS['Caixa única'] = (m, st) => {
  const k = st.i || 0;
  const c = CONVERSAS[k];
  return `${cab(m)}<div class="caixa3">
    <ul class="caixa3-lista">${CONVERSAS.map((x, i) => `<li><button type="button" class="caixa3-item" data-t="conv" data-a="${i}" aria-current="${i === k}"><strong>${esc(x.q)}</strong><span class="canal-selo">${x.c}</span></button></li>`).join('')}</ul>
    <div class="caixa3-fio">${c.msgs.map((t) => `<p class="app-msg app-msg--eles">${esc(t)}</p>`).join('')}
      ${st[`env${k}`] ? `<p class="app-msg app-msg--eu">${esc(c.ia)}</p>${feito('Enviada por você')}` : `<div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> sugere:</p><p>${esc(c.ia)}</p><div class="app-botoes">${botao('Usar esta resposta', 'envia', k, true)}${botao('Editar', 'nada')}</div></div>`}</div>
    <aside class="caixa3-ficha e-caixa"><p class="app-rotulo">${esc(c.q)}</p>${c.ficha.map((f) => `<p>${esc(f)}</p>`).join('')}</aside>
  </div>`;
};
ACOES['Caixa única'] = (t, a, st, som) => {
  if (t === 'conv') return (st.i = Number(a)), 'passar';
  if (t === 'envia') return (st[`env${a}`] = true), som?.visto(), 'redesenhar';
  return null;
};

TELAS['Respostas com a base'] = (m, st) => `${cab(m)}<div class="base">
  <p class="app-msg app-msg--eles"><small>Carlos Menezes · e-mail</small>Vocês emitem nota fiscal para pessoa física? E em quanto tempo chega?</p>
  <div class="base-resposta e-caixa"><p class="app-rotulo">Resposta da IA · confiança alta</p>
    <p>Emitimos, sim: é só informar o CPF no pedido. A nota chega no seu e-mail em até 24 horas.</p>
    <p class="base-fontes">Fontes: <button type="button" class="chip" data-t="fonte" data-a="1">Política fiscal §2</button> <button type="button" class="chip" data-t="fonte" data-a="2">FAQ de pedidos §7</button></p>
    ${st.fonte ? `<blockquote class="e-caixa">${st.fonte === '1' ? '“§2 — Emitimos NF-e para pessoa física e jurídica. O CPF ou CNPJ deve constar no pedido.”' : '“§7 — A nota fiscal é enviada ao e-mail do pedido em até 24 horas úteis após o faturamento.”'}</blockquote>` : ''}
    ${st.usou ? feito('Enviada por você') : `<div class="app-botoes">${botao('Usar a resposta', 'usa', '', true)}${botao('Editar', 'nada')}</div>`}
  </div></div>`;
ACOES['Respostas com a base'] = (t, a, st, som) => {
  if (t === 'fonte') return (st.fonte = st.fonte === a ? null : a), 'redesenhar';
  if (t === 'usa') return (st.usou = true), som?.visto(), 'redesenhar';
  return null;
};

const TRATATIVAS = [
  { q: 'Roberto Dias', a: 'Cobrança em dobro', sla: '8 min para estourar', col: 0, ia: 'A segunda cobrança é indevida: sugiro estorno.' },
  { q: 'Júlia Castro', a: 'Cancelamento', sla: '40 min', col: 1, ia: 'Cliente há 4 anos: ofereça a pausa de 2 meses.' },
  { q: 'Pedro Alves', a: 'Produto com defeito', sla: 'resolvido', col: 2, ia: 'Troca enviada.' },
];
TELAS['Tratativas'] = (m, st) => {
  st.col ||= TRATATIVAS.map((x) => x.col);
  return `${cab(m)}<div class="kanban kanban--3">${['Novo', 'Em andamento', 'Resolvido'].map((t, k) => `<div class="kanban-col e-caixa"><p class="kanban-titulo">${t}</p>${TRATATIVAS.map((x, i) => [x, i]).filter(([, i]) => st.col[i] === k).map(([x, i]) => `<div class="kanban-card e-caixa${k === 0 ? ' alerta' : ''}"><strong>${esc(x.q)}</strong><span>${esc(x.a)}</span><small class="sla">${k === 2 ? 'resolvido' : x.sla}</small><p class="app-nota">${esc(x.ia)}</p>${k < 2 ? `<button type="button" class="chip" data-t="move" data-a="${i}">${k === 0 ? 'assumir →' : 'resolver →'}</button>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
};
ACOES['Tratativas'] = (t, a, st, som) => {
  if (t !== 'move') return null;
  st.col[a] = Math.min(2, st.col[a] + 1);
  if (st.col[a] === 2) som?.visto();
  return 'redesenhar';
};

const PEDIDOS_TROCA = [
  { q: 'Mariana Souza', p: 'Pedido 88213 · tênis, número 37', regra: [['Dentro de 30 dias', 'comprado há 9 dias', true], ['Com nota fiscal', 'NF 7781 no pedido', true], ['Sem sinais de uso', 'foto enviada pela cliente', true]] },
  { q: 'Lucas Prado', p: 'Pedido 87990 · jaqueta', regra: [['Dentro de 30 dias', 'comprado há 41 dias', false], ['Com nota fiscal', 'NF 7702 no pedido', true], ['Sem sinais de uso', 'foto enviada', true]] },
];
TELAS['Trocas e reembolsos'] = (m, st) => `${cab(m)}<div class="trocas">${PEDIDOS_TROCA.map((x, i) => {
  const ok = x.regra.every((r) => r[2]);
  return `<article class="troca e-caixa${ok ? '' : ' alerta'}"><header><strong>${esc(x.q)}</strong><span>${esc(x.p)}</span></header>
    <ul class="checklist checklist--curto">${x.regra.map(([t, d, v]) => `<li class="checklist-item checklist-item--${v ? 'ok' : 'falha'}"><span class="checklist-marca" aria-hidden="true"></span><div><strong>${t}</strong><span>${d}</span></div></li>`).join('')}</ul>
    <p class="app-nota">${ok ? 'A regra permite: a IA já preparou a coleta.' : 'Fora do prazo: só com exceção sua.'}</p>
    ${st[i] ? feito(st[i] === 'sim' ? 'Aprovado por você' : 'Recusado, com explicação à cliente') : `<div class="app-botoes">${botao(ok ? 'Aprovar a troca' : 'Abrir exceção', 'decide', `${i}:sim`, true)}${botao('Recusar', 'decide', `${i}:nao`)}</div>`}
  </article>`;
}).join('')}</div>`;
ACOES['Trocas e reembolsos'] = (t, a, st, som) => {
  if (t !== 'decide') return null;
  const [i, d] = a.split(':');
  st[i] = d;
  if (d === 'sim') som?.visto();
  return 'redesenhar';
};

TELAS['Motivos da semana'] = (m) => {
  const mot = [['Prazo de entrega', 88, '+40%'], ['Troca de tamanho', 71, '+6%'], ['Nota fiscal', 44, '−12%'], ['Cobrança', 31, '−3%'], ['Cancelamento', 19, '+2%']];
  return `${cab(m)}<div class="motivos e-caixa">${mot.map(([t, v, d], i) => `<div class="motivo"><span class="motivo-nome">${t}</span><span class="motivo-barra"><span class="e-barra${i === 0 ? ' acesa' : ''}" style="width:${(v / 88) * 100}%"></span></span><strong>${v}</strong><em class="${d.startsWith('+') ? 'sobe' : 'desce'}">${d}</em></div>`).join('')}</div>
  <div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> “Prazo de entrega” subiu 40%: todos os casos são da transportadora nova, na região norte. Troca de tamanho cresce desde que a tabela de medidas saiu do site.</p></div>`;
};

// ===========================================================================
export function criarSistema({ materia, som }) {
  const caixa = document.getElementById('sistema');
  if (!caixa) return null;
  const app = caixa.querySelector('.app');
  const menu = caixa.querySelector('.app-menu');
  const tela = caixa.querySelector('.app-tela');
  const titulo = caixa.querySelector('.app-titulo');
  const calmo = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('parado');
  let area = null;
  let modulos = [];
  let atual = 0;
  let versao = 0;
  let esqueleto = [];
  const estado = new Map();

  // ---- o esqueleto, lido da interface ----
  function lerEsqueleto() {
    const base = caixa.getBoundingClientRect();
    const R = (r) => ({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
    const lista = [];
    const visivel = (el) => el.getClientRects().length > 0;
    app.querySelectorAll('.app-topo, .app-menu, .e-caixa, table, tr, input').forEach((el) => visivel(el) && lista.push({ tipo: 'caixa', ...R(el.getBoundingClientRect()) }));
    app.querySelectorAll('button, .chip, a.app-botao, .tag').forEach((el) => visivel(el) && lista.push({ tipo: el.matches('.app-botao--sim, [aria-current="true"], .tag--acesa') ? 'aceso' : 'bloco', ...R(el.getBoundingClientRect()) }));
    app.querySelectorAll('.e-barra').forEach((el) => visivel(el) && lista.push({ tipo: el.matches('.acesa, .gantt-bloco--conflito') ? 'aceso' : 'bloco', ...R(el.getBoundingClientRect()) }));
    // as linhas do mapa: cada rota vira um traço de partículas
    app.querySelectorAll('polyline.e-linha').forEach((pl) => {
      const m = pl.getScreenCTM();
      if (!m) return;
      const pts = [...pl.points].map((p) => [p.x * m.a + p.y * m.c + m.e - base.left, p.x * m.b + p.y * m.d + m.f - base.top]);
      lista.push({ tipo: pl.classList.contains('acesa') ? 'linha-acesa' : 'linha', pts });
    });
    const andar = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const faixa = document.createRange();
    while (andar.nextNode()) {
      const n = andar.currentNode;
      if (n.parentElement.closest('button, .chip, a.app-botao, svg, .tag')) continue;
      faixa.selectNodeContents(n);
      for (const r of faixa.getClientRects()) {
        if (r.width < 2) continue;
        const q = R(r);
        lista.push({ tipo: 'texto', x: q.x, y: q.y + q.h * 0.3, w: q.w, h: q.h * 0.4 });
      }
    }
    esqueleto = lista;
    versao++;
  }

  dinamicas.sistema = (w, h, n) =>
    amostrar(`sistema-${versao}`, w, h, n, (c) => {
      c.lineJoin = 'round';
      c.lineCap = 'round';
      for (const e of esqueleto) {
        if (e.tipo === 'caixa') {
          c.strokeStyle = BRANCO;
          c.lineWidth = 2.5;
          c.strokeRect(e.x, e.y, e.w, e.h);
        } else if (e.tipo === 'texto') {
          c.fillStyle = BRANCO;
          c.fillRect(e.x, e.y, e.w, Math.max(2.5, e.h));
        } else if (e.tipo.startsWith('linha')) {
          c.strokeStyle = e.tipo === 'linha-acesa' ? ACESO : BRANCO;
          c.lineWidth = e.tipo === 'linha-acesa' ? 6 : 3.5;
          c.beginPath();
          e.pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
          c.stroke();
        } else {
          c.fillStyle = e.tipo === 'aceso' ? ACESO : BRANCO;
          c.beginPath();
          c.roundRect(e.x, e.y, e.w, e.h, Math.min(e.h / 2, 10));
          c.fill();
        }
      }
    }, { semente: 113, resolucao: 520 });

  function desenharTela() {
    if (!modulos.length) {
      tela.innerHTML = `<div class="app-cab"><div><h3>Escolha uma área</h3><p class="app-ia">As telas do seu sistema vão aparecer aqui, uma por carta.</p></div></div><div class="app-vazio"><div class="e-caixa"></div><div class="e-caixa"></div><div class="e-caixa"></div></div>`;
      return;
    }
    const m = modulos[atual];
    const st = estado.get(m.nome) || {};
    estado.set(m.nome, st);
    tela.innerHTML = (TELAS[m.nome] || ((mm) => cab(mm)))(m, st);
    tela.scrollTop = 0;
    menu.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === atual)));
    const b = menu.querySelectorAll('button')[atual];
    if (b && menu.scrollWidth > menu.clientWidth) menu.scrollTo({ left: b.offsetLeft - menu.clientWidth / 2 + b.offsetWidth / 2, behavior: calmo() ? 'auto' : 'smooth' });
  }

  // ---- a passagem pela matéria: dissolve, redesenha, solidifica ----
  let espera = 0;
  function passar(fn) {
    clearTimeout(espera);
    const de = materia.formaAtual(caixa);
    materia.velar(caixa, true);
    tela.classList.add('dissolvido');
    fn();
    requestAnimationFrame(() => {
      lerEsqueleto();
      if (calmo()) {
        if (modulos.length) tela.classList.remove('dissolvido');
        return;
      }
      materia.morfar(caixa, de, 1000);
      som?.graos();
      if (!modulos.length) return; // sem área, a tela fica só em matéria
      espera = setTimeout(() => {
        tela.classList.remove('dissolvido');
        espera = setTimeout(() => materia.velar(caixa, false), 550);
      }, 860);
    });
  }

  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mod]');
    if (!b || Number(b.dataset.mod) === atual) return;
    passar(() => {
      atual = Number(b.dataset.mod);
      desenharTela();
    });
  });
  tela.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-t]');
    if (!alvo || !modulos.length) return;
    const m = modulos[atual];
    const st = estado.get(m.nome);
    const r = ACOES[m.nome]?.(alvo.dataset.t, alvo.dataset.a, st, som);
    if (r === 'passar') passar(desenharTela);
    else if (r === 'redesenhar') {
      desenharTela();
      lerEsqueleto();
    }
  });

  new ResizeObserver(() => lerEsqueleto()).observe(caixa);
  tela.classList.add('dissolvido');
  desenharTela();
  requestAnimationFrame(lerEsqueleto);
  document.fonts?.ready.then(lerEsqueleto);

  return {
    // monta (ou remonta) o sistema: a área, os módulos e a tela em foco
    configurar({ chave, lista, foco = lista.length - 1, zerar = false }) {
      if (zerar) estado.clear();
      passar(() => {
        area = chave;
        modulos = lista;
        atual = Math.max(0, Math.min(foco, lista.length - 1));
        const p = PRODUTOS[chave];
        app.dataset.casca = p ? p.casca : 'lateral';
        app.dataset.area = chave || '';
        titulo.textContent = p ? p.nome : 'Seu sistema';
        caixa.querySelector('.app-area').textContent = p ? p.area : '';
        caixa.querySelector('.app-status').textContent = p ? p.status : '';
        menu.innerHTML = modulos.map((m, i) => `<button type="button" data-mod="${i}">${m.aprova ? '<span class="app-visto" aria-hidden="true"></span>' : ''}${esc(m.nome)}</button>`).join('');
        desenharTela();
      });
    },
    botao: (i) => menu.querySelectorAll('button')[i],
    caixa,
  };
}
