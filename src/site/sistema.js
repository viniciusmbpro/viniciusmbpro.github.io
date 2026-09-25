// O SISTEMA DE VERDADE: depois de montar, a pessoa abre o sistema que montou
// — menu com os módulos dela, telas que funcionam, dados fictícios (e ditos
// como tal). A matéria faz as passagens:
//
//   abrir   — a planta se desmancha e as partículas desenham o ESQUELETO
//             exato da interface (menu, cabeçalho, linhas de texto, botões);
//             então o sistema se solidifica por cima;
//   trocar  — a tela atual se dissolve, as partículas redesenham a próxima e
//             ela se solidifica.
//
// O esqueleto não é desenhado à mão: ele é LIDO da própria interface. Cada
// caixa vira contorno, cada linha de texto vira um traço na altura do texto,
// cada botão vira um bloco — e o botão principal, em vermelhão. Por isso a
// matéria pousa exatamente onde o sistema vai aparecer.
import { amostrar, dinamicas, BRANCO, ACESO } from '../materia/formas.js';

const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ---------------------------------------------------------------------------
// OS DADOS (fictícios) — por área, e a tela de cada módulo
const LISTAS = {
  financeiro: {
    colunas: ['Fornecedor / cliente', 'Descrição', 'Valor', 'Vence', 'Situação'],
    linhas: [
      ['Transportes Serra Azul', 'Frete de setembro', 18450, '28/09', 'Em aberto'],
      ['Papelaria Central', 'Material de escritório', 1240, '30/09', 'Pago'],
      ['Clínica Bem Viver', 'Mensalidade do plano', 9600, '01/10', 'Em aberto'],
      ['Auto Peças Minas', 'Manutenção da frota', 7320, '03/10', 'Atrasado'],
      ['Grupo Horizonte', 'Recebimento de contrato', 42000, '05/10', 'A receber'],
    ],
  },
  operacao: {
    colunas: ['Ordem', 'Cliente', 'Rota', 'Saída', 'Situação'],
    linhas: [
      ['OS-2481', 'Metalúrgica Vale', 'Contagem → Betim', '06:10', 'Em rota'],
      ['OS-2482', 'Hospital Santa Luzia', 'Centro → Pampulha', '06:40', 'Aguardando'],
      ['OS-2483', 'Escola Nova Era', 'Barreiro → Centro', '07:00', 'Em rota'],
      ['OS-2484', 'Mineração Alvorada', 'Nova Lima → Itabirito', '07:30', 'Atrasada'],
      ['OS-2485', 'Shopping Del Rey', 'Venda Nova → Pampulha', '08:00', 'Concluída'],
    ],
  },
  comercial: {
    colunas: ['Empresa', 'Oportunidade', 'Valor', 'Etapa', 'Próximo passo'],
    linhas: [
      ['Clínica Sorriso', 'Sistema de agendamento', 38000, 'Proposta', 'Enviar até sexta'],
      ['Grupo Horizonte', 'Renovação anual', 120000, 'Negociação', 'Reunião terça'],
      ['Padaria Trigo Bom', 'Pedidos online', 9500, 'Contato', 'Ligar hoje'],
      ['Construtora Pilar', 'Controle de obras', 64000, 'Proposta', 'Revisar escopo'],
      ['Rede Farma Mais', 'Integração de lojas', 87000, 'Fechado', 'Kickoff dia 10'],
    ],
  },
  atendimento: {
    colunas: ['Cliente', 'Canal', 'Assunto', 'Aberto há', 'Situação'],
    linhas: [
      ['Mariana Souza', 'WhatsApp', 'Troca de produto', '12 min', 'Com a IA'],
      ['Carlos Menezes', 'E-mail', 'Nota fiscal', '1 h', 'Resolvido'],
      ['Ana Beatriz Lima', 'Site', 'Prazo de entrega', '25 min', 'Com a IA'],
      ['Roberto Dias', 'WhatsApp', 'Cobrança em dobro', '2 h', 'Com você'],
      ['Júlia Castro', 'E-mail', 'Cancelamento', '3 h', 'Com você'],
    ],
  },
};

// fila de aprovação: itens que a IA preparou e que esperam uma pessoa
const FILAS = {
  'Aprovação em alçadas': {
    sim: 'Aprovar',
    nao: 'Recusar',
    itens: [
      { titulo: 'Transportes Serra Azul', desc: 'Frete de setembro · R$ 18.450', ia: 'Conferi com o contrato: valor e rotas batem.', alerta: false },
      { titulo: 'Auto Peças Minas', desc: 'Manutenção da frota · R$ 7.320', ia: 'Acima do limite do setor (R$ 5.000): precisa da sua aprovação.', alerta: true },
      { titulo: 'Gráfica Ponto Certo', desc: 'Material de campanha · R$ 3.180', ia: 'Pedido de compra encontrado; nota ainda não chegou.', alerta: true },
    ],
  },
  Fechamento: {
    sim: 'Aprovar o fechamento',
    nao: 'Reabrir',
    itens: [{ titulo: 'Fechamento de setembro', desc: '412 lançamentos · 3 pendências resolvidas', ia: 'Tudo conciliado. Duas despesas foram reclassificadas; estão marcadas no relatório.', alerta: false }],
  },
  Programação: {
    sim: 'Confirmar',
    nao: 'Trocar',
    itens: [
      { titulo: 'Rota Contagem → Betim', desc: 'Ônibus 12 · motorista Paulo', ia: 'Paulo fez essa rota 18 vezes no mês; o ônibus está revisado.', alerta: false },
      { titulo: 'Rota Nova Lima → Itabirito', desc: 'Ônibus 07 · motorista Sérgio', ia: 'Sérgio está no limite de horas da semana: sugiro o Marcos.', alerta: true },
      { titulo: 'Rota Centro → Pampulha', desc: 'Van 03 · motorista Luana', ia: 'Van com 14 lugares para 12 passageiros: ok.', alerta: false },
    ],
  },
  Custos: {
    sim: 'Aprovar',
    nao: 'Contestar',
    itens: [
      { titulo: 'OS-2484 · Mineração Alvorada', desc: 'Custo R$ 1.980 · previsto R$ 1.450', ia: 'Pedágio extra e 38 km a mais por desvio: acima do previsto.', alerta: true },
      { titulo: 'OS-2481 · Metalúrgica Vale', desc: 'Custo R$ 860 · previsto R$ 900', ia: 'Dentro do previsto.', alerta: false },
    ],
  },
  Propostas: {
    sim: 'Enviar',
    nao: 'Ajustar',
    itens: [
      { titulo: 'Clínica Sorriso', desc: 'Sistema de agendamento · R$ 38.000', ia: 'Montei a partir do pedido e da tabela de preços; incluí o desconto de fidelidade.', alerta: false },
      { titulo: 'Construtora Pilar', desc: 'Controle de obras · R$ 64.000', ia: 'O pedido cita 3 obras e a tabela cobre 2: revise o escopo antes de enviar.', alerta: true },
    ],
  },
  Tratativas: {
    sim: 'Resolver',
    nao: 'Escalar',
    itens: [
      { titulo: 'Roberto Dias · cobrança em dobro', desc: 'Aberto há 2 h · WhatsApp', ia: 'Encontrei as duas cobranças; a segunda é indevida. Sugiro estorno imediato.', alerta: true },
      { titulo: 'Júlia Castro · cancelamento', desc: 'Aberto há 3 h · e-mail', ia: 'Cliente há 4 anos; ofereça a pausa de 2 meses antes do cancelamento.', alerta: false },
    ],
  },
  'Trocas e reembolsos': {
    sim: 'Aprovar',
    nao: 'Recusar',
    itens: [
      { titulo: 'Mariana Souza · troca', desc: 'Pedido 88213 · comprado há 9 dias', ia: 'Dentro dos 30 dias e com nota: a regra permite a troca.', alerta: false },
      { titulo: 'Lucas Prado · reembolso', desc: 'Pedido 87990 · comprado há 41 dias', ia: 'Fora do prazo de 30 dias: precisa de exceção sua.', alerta: true },
    ],
  },
};

// leitura: um documento que a IA lê e os campos que ela tira dele
const LEITURAS = {
  'Leitura de notas': {
    doc: 'Nota fiscal',
    itens: [
      { cabecalho: 'NF-e 004.812 · Transportes Serra Azul', linhas: ['Serviço de frete — setembro/2026', 'Rotas: 14 · Quilometragem: 3.210 km', 'Valor total: R$ 18.450,00', 'Vencimento: 28/09/2026'], campos: [['Fornecedor', 'Transportes Serra Azul'], ['Valor', 'R$ 18.450,00'], ['Pedido', 'PC-1177'], ['Confere com o pedido', 'Sim']], diverge: null },
      { cabecalho: 'NF-e 118.340 · Auto Peças Minas', linhas: ['Peças e mão de obra — frota', 'Itens: 23 · Ordem: OF-332', 'Valor total: R$ 7.320,00', 'Vencimento: 03/10/2026'], campos: [['Fornecedor', 'Auto Peças Minas'], ['Valor', 'R$ 7.320,00'], ['Pedido', 'PC-1180'], ['Confere com o pedido', 'Não']], diverge: 'O pedido PC-1180 é de R$ 6.890: a nota veio R$ 430 acima.' },
    ],
  },
  Ocorrências: {
    doc: 'Áudio do motorista (transcrito)',
    itens: [
      { cabecalho: 'Áudio de Paulo · 06:52', linhas: ['“Bom dia, aqui é o Paulo, OS 2481.', 'Pneu dianteiro furou na Via Expressa,', 'já troquei, perdi uns vinte minutos,', 'sigo pra Betim agora.”'], campos: [['Ordem', 'OS-2481'], ['Tipo', 'Pneu furado'], ['Atraso', '20 min'], ['Situação', 'Resolvida em rota']], diverge: null },
      { cabecalho: 'Foto de Sérgio · 07:48', linhas: ['[foto do painel do ônibus 07]', 'Luz de temperatura acesa', 'Legenda: “parei no posto do km 12”'], campos: [['Ordem', 'OS-2484'], ['Tipo', 'Superaquecimento'], ['Atraso', 'indefinido'], ['Situação', 'Precisa de socorro']], diverge: 'Risco para a rota das 08:30: sugiro mandar o ônibus reserva.' },
    ],
  },
  'Triagem de contatos': {
    doc: 'E-mail recebido',
    itens: [
      { cabecalho: 'De: diretoria@clinicasorriso.com.br', linhas: ['Olá! Somos 3 unidades e queremos', 'um sistema para agendar consultas', 'e confirmar pelo WhatsApp.', 'Conseguem uma proposta este mês?'], campos: [['Empresa', 'Clínica Sorriso'], ['Interesse', 'Agendamento'], ['Tamanho', '3 unidades'], ['Encaminhar para', 'Comercial · Ana']], diverge: null },
      { cabecalho: 'De: compras@construtorapilar.com.br', linhas: ['Precisamos controlar 3 obras', 'com medição semanal e fotos.', 'Orçamento até R$ 70 mil.'], campos: [['Empresa', 'Construtora Pilar'], ['Interesse', 'Controle de obras'], ['Orçamento', 'até R$ 70 mil'], ['Encaminhar para', 'Comercial · Bruno']], diverge: 'Já existe uma proposta aberta para esta empresa: junte as duas.' },
    ],
  },
  Contratos: {
    doc: 'Contrato recebido',
    itens: [
      { cabecalho: 'Contrato · Grupo Horizonte · renovação', linhas: ['Cláusula 4 — Reajuste anual pelo IPCA', 'Cláusula 7 — Multa de 2% por atraso', 'Cláusula 9 — Rescisão com 30 dias', 'Cláusula 12 — Foro de Belo Horizonte'], campos: [['Cláusulas lidas', '14'], ['Iguais ao modelo', '13'], ['Diferentes', '1'], ['Risco', 'Baixo']], diverge: 'A cláusula 9 veio com 30 dias de aviso; o seu modelo pede 60.' },
    ],
  },
};

// conversas: a mensagem que chegou e a resposta que a IA sugere
const CONVERSAS = {
  Cobrança: [
    { nome: 'Clínica Bem Viver', msgs: [['eles', 'Oi, recebemos o boleto, mas vamos pagar só dia 05.']], ia: 'Sem problema! Registrei a promessa para 05/10. Mando o boleto atualizado sem multa até essa data.' },
    { nome: 'Auto Peças Minas', msgs: [['eu', 'Lembrete: a fatura de R$ 7.320 venceu ontem.'], ['eles', 'Já pagamos, segue o comprovante.']], ia: 'Obrigado! Localizei o pagamento no extrato de hoje e já dei baixa.' },
  ],
  'Pós-venda': [
    { nome: 'Rede Farma Mais', msgs: [['eles', 'O sistema está rodando nas 12 lojas, mas duas ainda imprimem errado.']], ia: 'Que bom que as 12 estão no ar! Agendei nossa técnica para quinta às 10h nas duas lojas. Serve?' },
  ],
  'Caixa única': [
    { nome: 'Ana Beatriz · site', msgs: [['eles', 'Meu pedido 88340 chega quando?']], ia: 'Oi, Ana! Seu pedido saiu hoje cedo e chega amanhã até as 18h. Mando o rastreio por aqui.' },
    { nome: 'Mariana Souza · WhatsApp', msgs: [['eles', 'Quero trocar o tênis, veio pequeno.']], ia: 'Claro, Mariana! A troca está liberada. Qual número você prefere? Buscamos na sua casa sem custo.' },
  ],
  'Respostas com a base': [
    { nome: 'Carlos Menezes · e-mail', msgs: [['eles', 'Vocês emitem nota para pessoa física?']], ia: 'Emitimos, sim: é só informar o CPF no pedido. A nota chega no seu e-mail em até 24 h.' },
    { nome: 'Patrícia Rocha · WhatsApp', msgs: [['eles', 'Qual o horário de vocês no sábado?']], ia: 'No sábado abrimos das 8h às 13h. Se preferir, deixo seu pedido separado para retirar.' },
  ],
};

// painéis: números, a semana em barras e o que a IA percebeu
const PAINEIS = {
  'Painel do cliente': { numeros: [['Viagens hoje', '42'], ['No horário', '95%'], ['Em rota agora', '11']], semana: [38, 41, 40, 44, 42, 19, 8], nota: ['Mineração Alvorada teve 2 atrasos esta semana, os dois na mesma serra.', 'Os passageiros da rota Centro → Pampulha aumentaram 12%.'] },
  'Painel do funil': { numeros: [['Em negociação', 'R$ 309 mil'], ['Propostas abertas', '6'], ['Fechadas no mês', '3']], semana: [2, 4, 3, 5, 6, 1, 0], nota: ['Grupo Horizonte está parado há 9 dias na negociação.', 'Propostas enviadas na terça fecham mais que as de sexta.'] },
  'Motivos da semana': { numeros: [['Chamados', '318'], ['Resolvidos pela IA', '61%'], ['Tempo médio', '14 min']], semana: [52, 49, 61, 47, 55, 34, 20], nota: ['“Prazo de entrega” subiu 40%: a transportadora nova está atrasando.', 'Troca de tamanho é o maior motivo; a tabela de medidas do site está confusa.'] },
  Conciliação: { numeros: [['Lançamentos', '412'], ['Casados pela IA', '398'], ['Para você', '14']], semana: [61, 58, 70, 66, 59, 12, 4], nota: ['Os 14 que sobraram são pagamentos agrupados: a IA sugere como separar.', 'O banco mudou a descrição das tarifas; a regra já foi ajustada.'] },
  Fechamento: null,
};

// o tipo de tela de cada módulo
function telaDe(area, m) {
  if (m.nucleo) return { tipo: 'lista', dados: LISTAS[area] };
  if (FILAS[m.nome]) return { tipo: 'fila', dados: FILAS[m.nome] };
  if (LEITURAS[m.nome]) return { tipo: 'leitura', dados: LEITURAS[m.nome] };
  if (CONVERSAS[m.nome]) return { tipo: 'conversa', dados: CONVERSAS[m.nome] };
  if (PAINEIS[m.nome]) return { tipo: 'painel', dados: PAINEIS[m.nome] };
  // os módulos de acompanhamento viram a lista da área, filtrada
  return { tipo: 'lista', dados: LISTAS[area] };
}

// ---------------------------------------------------------------------------
export function criarSistema({ materia, som, rolagem }) {
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
  let esqueleto = []; // o que a matéria desenha: [{ tipo, x, y, w, h }]
  const estado = new Map(); // o que a pessoa já fez em cada tela

  // ---- o esqueleto, lido da interface ----
  function lerEsqueleto() {
    const base = caixa.getBoundingClientRect();
    const R = (r) => ({ x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height });
    const lista = [];
    // as caixas: contorno
    app.querySelectorAll('.app-topo, .app-menu, .e-caixa, table, tr, input').forEach((el) => {
      if (el.offsetParent === null) return;
      lista.push({ tipo: 'caixa', ...R(el.getBoundingClientRect()) });
    });
    // os botões: bloco (o principal, aceso)
    app.querySelectorAll('button, .chip, a.app-botao').forEach((el) => {
      if (el.offsetParent === null) return;
      lista.push({ tipo: el.matches('.app-botao--sim, [aria-current="true"]') ? 'aceso' : 'bloco', ...R(el.getBoundingClientRect()) });
    });
    app.querySelectorAll('.e-barra').forEach((el) => lista.push({ tipo: 'bloco', ...R(el.getBoundingClientRect()) }));
    // o texto: um traço por linha, na altura das letras
    const andar = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const faixa = document.createRange();
    while (andar.nextNode()) {
      const n = andar.currentNode;
      if (n.parentElement.closest('button, .chip, a.app-botao')) continue;
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
      for (const e of esqueleto) {
        if (e.tipo === 'caixa') {
          c.strokeStyle = BRANCO;
          c.lineWidth = 2.5;
          c.strokeRect(e.x, e.y, e.w, e.h);
        } else if (e.tipo === 'texto') {
          c.fillStyle = BRANCO;
          c.fillRect(e.x, e.y, e.w, Math.max(2.5, e.h));
        } else {
          c.fillStyle = e.tipo === 'aceso' ? ACESO : BRANCO;
          c.beginPath();
          c.roundRect(e.x, e.y, e.w, e.h, Math.min(e.h / 2, 10));
          c.fill();
        }
      }
    }, { semente: 113, resolucao: 520 });

  // ---- as telas ----
  const cabecalho = (m) => `<div class="app-cab"><h3>${esc(m.nome)}</h3><p class="app-ia"><span class="app-ia-selo">IA</span>${esc(`A IA ${m.ia}.`)}${m.aprova ? ` <strong>${esc(`Você ${m.aprova}.`)}</strong>` : ''}</p></div>`;

  function telaLista(m, d) {
    const st = estado.get(m.nome) || { busca: '', filtro: 'Todos' };
    const situacoes = ['Todos', ...new Set(d.linhas.map((l) => l[4]))];
    const linhas = d.linhas.filter((l) => (st.filtro === 'Todos' || l[4] === st.filtro) && l.join(' ').toLowerCase().includes(st.busca.toLowerCase()));
    return `${cabecalho(m)}
      <div class="app-barra"><input type="search" placeholder="Buscar" value="${esc(st.busca)}" aria-label="Buscar em ${esc(m.nome)}" data-campo="busca" />
      <div class="app-chips" role="group" aria-label="Filtrar por situação">${situacoes.map((s) => `<button type="button" class="chip" data-filtro="${esc(s)}" aria-pressed="${s === st.filtro}">${esc(s)}</button>`).join('')}</div></div>
      <div class="app-tabela e-caixa"><table><thead><tr>${d.colunas.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${linhas.map((l) => `<tr>${l.map((v, i) => `<td${i === 4 ? ` class="situacao" data-s="${esc(v)}"` : ''}>${typeof v === 'number' ? reais(v) : esc(v)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="5" class="vazio">Nada encontrado com esse filtro.</td></tr>`}
      </tbody></table></div>`;
  }

  function telaFila(m, d) {
    const st = estado.get(m.nome) || {};
    const faltam = d.itens.filter((_, i) => !st[i]).length;
    return `${cabecalho(m)}
      <p class="app-contador">${faltam ? `${faltam} ${faltam === 1 ? 'item espera' : 'itens esperam'} você` : 'Nada esperando você. A IA segue trabalhando.'}</p>
      <ul class="app-fila">${d.itens
        .map((it, i) => `<li class="e-caixa${it.alerta ? ' alerta' : ''}${st[i] ? ' decidido' : ''}">
          <div><strong>${esc(it.titulo)}</strong><span>${esc(it.desc)}</span></div>
          <p class="app-nota">${esc(it.ia)}</p>
          ${st[i] ? `<p class="app-feito">${st[i] === 'sim' ? `${esc(d.sim)}: feito por você` : `${esc(d.nao)}: devolvido com a sua nota`}</p>` : `<div class="app-botoes"><button type="button" class="app-botao app-botao--sim" data-decide="sim" data-i="${i}">${esc(d.sim)}</button><button type="button" class="app-botao" data-decide="nao" data-i="${i}">${esc(d.nao)}</button></div>`}
        </li>`)
        .join('')}</ul>`;
  }

  function telaLeitura(m, d) {
    const st = estado.get(m.nome) || { i: 0, lido: false };
    const it = d.itens[st.i % d.itens.length];
    return `${cabecalho(m)}
      <div class="app-leitura">
        <div class="app-doc e-caixa"><p class="app-doc-tipo">${esc(d.doc)}</p><p class="app-doc-cab">${esc(it.cabecalho)}</p>${it.linhas.map((l) => `<p>${esc(l)}</p>`).join('')}</div>
        <div class="app-campos">
          <dl>${it.campos.map(([k, v], j) => `<div class="app-campo" style="--j:${j}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          ${it.diverge ? `<p class="app-diverge e-caixa">${esc(it.diverge)}</p>` : '<p class="app-ok">Nada fora do esperado.</p>'}
          <div class="app-botoes">${st.lido ? '<p class="app-feito">Leitura confirmada por você</p>' : '<button type="button" class="app-botao app-botao--sim" data-acao-app="confirmar">Confirmar leitura</button>'}${d.itens.length > 1 ? '<button type="button" class="app-botao" data-acao-app="proximo">Ler o próximo</button>' : ''}</div>
        </div>
      </div>`;
  }

  function telaConversa(m, d) {
    const st = estado.get(m.nome) || { i: 0, enviadas: {} };
    const c = d[st.i % d.length];
    const enviada = st.enviadas[st.i % d.length];
    return `${cabecalho(m)}
      <div class="app-conversa">
        <ul class="app-contatos e-caixa">${d.map((x, i) => `<li><button type="button" class="app-contato" data-contato="${i}" aria-current="${i === st.i % d.length}">${esc(x.nome)}</button></li>`).join('')}</ul>
        <div class="app-fio">
          ${c.msgs.map(([quem, t]) => `<p class="app-msg app-msg--${quem}">${esc(t)}</p>`).join('')}
          ${enviada ? `<p class="app-msg app-msg--eu">${esc(c.ia)}</p><p class="app-feito">Enviada por você</p>` : `<div class="app-sugestao e-caixa"><p><span class="app-ia-selo">IA</span> sugere:</p><p>${esc(c.ia)}</p><div class="app-botoes"><button type="button" class="app-botao app-botao--sim" data-acao-app="enviar">Usar esta resposta</button><button type="button" class="app-botao" data-acao-app="editar">Editar</button></div></div>`}
        </div>
      </div>`;
  }

  function telaPainel(m, d) {
    if (!d) return telaFila(m, FILAS[m.nome]);
    const max = Math.max(...d.semana);
    const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    return `${cabecalho(m)}
      <div class="app-numeros">${d.numeros.map(([k, v]) => `<div class="e-caixa"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div>
      <div class="app-painel">
        <div class="app-semana e-caixa" aria-label="A semana, dia a dia">${d.semana.map((v, i) => `<div class="app-dia${v === max ? ' pico' : ''}"><span class="e-barra" style="height:${Math.max(4, (v / max) * 100)}%"></span><small>${dias[i]}</small></div>`).join('')}</div>
        <div class="app-percebeu"><p class="app-doc-tipo">O que a IA percebeu</p><ul>${d.nota.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      </div>`;
  }

  function desenharTela() {
    const m = modulos[atual];
    const t = telaDe(area, m);
    const f = { lista: telaLista, fila: telaFila, leitura: telaLeitura, conversa: telaConversa, painel: telaPainel }[t.tipo];
    tela.innerHTML = f(m, t.dados);
    tela.dataset.tipo = t.tipo;
    menu.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === atual)));
  }

  // ---- a passagem pela matéria ----
  let espera = 0;
  function passar(fn, { inteiro = false } = {}) {
    clearTimeout(espera);
    const de = materia.formaAtual(caixa);
    // some o que vai mudar (a tela, ou o sistema inteiro), revelando a matéria
    const alvo = inteiro ? app : tela;
    materia.velar(caixa, true);
    alvo.classList.add('dissolvido');
    fn();
    requestAnimationFrame(() => {
      lerEsqueleto();
      if (calmo()) {
        alvo.classList.remove('dissolvido');
        return;
      }
      materia.morfar(caixa, de, inteiro ? 1500 : 950);
      som?.graos();
      // a tela se solidifica quando a matéria já pousou
      espera = setTimeout(() => {
        alvo.classList.remove('dissolvido');
        // o sistema cobriu a matéria: ela some de vez (sem pontilhado nas bordas)
        espera = setTimeout(() => materia.velar(caixa, false), 500);
      }, inteiro ? 1350 : 820);
    });
  }

  // ---- interações dentro do sistema ----
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mod]');
    if (!b || Number(b.dataset.mod) === atual) return;
    passar(() => {
      atual = Number(b.dataset.mod);
      desenharTela();
    });
  });
  tela.addEventListener('input', (e) => {
    if (e.target.dataset.campo !== 'busca') return;
    const m = modulos[atual];
    const st = estado.get(m.nome) || { busca: '', filtro: 'Todos' };
    st.busca = e.target.value;
    estado.set(m.nome, st);
    const pos = e.target.selectionStart;
    desenharTela();
    const campo = tela.querySelector('[data-campo="busca"]');
    campo.focus();
    campo.setSelectionRange(pos, pos);
    lerEsqueleto();
  });
  tela.addEventListener('click', (e) => {
    const m = modulos[atual];
    const alvo = e.target.closest('button');
    if (!alvo) return;
    const st = estado.get(m.nome) || {};
    if (alvo.dataset.filtro) {
      st.filtro = alvo.dataset.filtro;
      st.busca ??= '';
    } else if (alvo.dataset.decide) {
      st[alvo.dataset.i] = alvo.dataset.decide;
      if (alvo.dataset.decide === 'sim') som?.visto();
    } else if (alvo.dataset.acaoApp === 'confirmar') {
      st.lido = true;
      som?.visto();
    } else if (alvo.dataset.acaoApp === 'proximo') {
      estado.set(m.nome, { i: (st.i || 0) + 1, lido: false });
      passar(desenharTela);
      return;
    } else if (alvo.dataset.contato) {
      st.i = Number(alvo.dataset.contato);
      st.enviadas ??= {};
      estado.set(m.nome, st);
      passar(desenharTela);
      return;
    } else if (alvo.dataset.acaoApp === 'enviar') {
      st.enviadas ??= {};
      st.enviadas[st.i || 0] = true;
      som?.visto();
    } else if (alvo.dataset.acaoApp === 'editar') {
      const s = tela.querySelector('.app-sugestao p:nth-child(2)');
      s.contentEditable = 'true';
      s.focus();
      return;
    } else return;
    estado.set(m.nome, st);
    desenharTela();
    lerEsqueleto();
  });

  new ResizeObserver(() => {
    if (!caixa.hidden) lerEsqueleto();
  }).observe(caixa);

  return {
    // abre o sistema montado; `de` é a forma da planta, ponto de partida
    abrir({ chave, nome, lista }, de) {
      area = chave;
      modulos = lista;
      atual = 0;
      estado.clear();
      titulo.textContent = `Sistema de ${nome.toLowerCase()}`;
      menu.innerHTML = modulos.map((m, i) => `<button type="button" data-mod="${i}">${m.aprova ? '<span class="app-visto" aria-hidden="true"></span>' : ''}${esc(m.nome)}</button>`).join('');
      desenharTela();
      app.classList.add('dissolvido');
      caixa.hidden = false;
      materia.remedir();
      requestAnimationFrame(() => {
        lerEsqueleto();
        if (calmo()) {
          app.classList.remove('dissolvido');
          return;
        }
        materia.velar(caixa, true);
        materia.morfar(caixa, de, 1700);
        som?.visto();
        setTimeout(() => {
          app.classList.remove('dissolvido');
          setTimeout(() => materia.velar(caixa, false), 700);
        }, 1500);
      });
    },
    // antes de fechar: a forma atual, para a planta nascer dela
    formaAtual: () => materia.formaAtual(caixa),
    fechar() {
      materia.velar(caixa, true);
      caixa.hidden = true;
    },
  };
}
