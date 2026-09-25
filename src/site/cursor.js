// O cursor: um anel de vermelhão que segue o mouse. Sobre o que é clicável
// ele cresce e diz a ação ("ir", "abrir", "escrever"); sobre o botão
// principal ele se recolhe num ponto e o próprio botão vem ao encontro dele
// (magnético). Só existe com mouse; no toque, com movimento reduzido ou na
// qualidade "Parado", fica o cursor do sistema.
const CLICAVEL = 'a, button, summary, label, [data-cursor]';
const MAGNETICO = '.botao--cheio';

function acaoDe(el) {
  if (el.dataset.cursor) return el.dataset.cursor;
  if (el.matches('summary')) return el.parentElement.open ? 'fechar' : 'abrir';
  if (el.matches('a[href^="mailto:"]')) return 'escrever';
  if (el.matches('a[target="_blank"]')) return 'abrir';
  if (el.matches('a[href^="#"]')) return 'ir';
  return '';
}

export function iniciarCursor(rolagem, { parado, som }) {
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)');
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fino.matches || calmo) return { atualizar() {} };
  const raiz = document.documentElement;
  const c = document.createElement('div');
  c.className = 'cursor';
  c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span class="cursor-anel"></span><span class="cursor-rotulo"></span>';
  document.body.append(c);
  const rotulo = c.lastChild;
  const alvo = { x: -100, y: -100 };
  const pos = { x: -100, y: -100 };
  let rodando = false;
  let magneto = null;
  let sobreAntes = null;

  const ligado = () => {
    const sim = !parado() && raiz.classList.contains('carregou');
    raiz.classList.toggle('cursor-proprio', sim);
    return sim;
  };

  function laco() {
    pos.x += (alvo.x - pos.x) * 0.28;
    pos.y += (alvo.y - pos.y) * 0.28;
    c.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px)`;
    if (Math.abs(alvo.x - pos.x) + Math.abs(alvo.y - pos.y) > 0.2) requestAnimationFrame(laco);
    else rodando = false;
  }

  function sob(alvoEl, x, y) {
    const el = alvoEl?.closest?.(CLICAVEL);
    const mag = alvoEl?.closest?.(MAGNETICO);
    const acao = el ? acaoDe(el) : '';
    c.classList.toggle('sobre', !!el && !mag);
    c.classList.toggle('recolhido', !!mag);
    c.classList.toggle('com-rotulo', !!acao && !mag);
    if (acao) rotulo.textContent = acao;
    if (el && el !== sobreAntes) som?.tique(0.5);
    sobreAntes = el;
    // o botão vem ao encontro do cursor, pouco, e volta por mola ao sair
    if (mag !== magneto) {
      magneto?.style.removeProperty('--x');
      magneto?.style.removeProperty('--y');
      magneto = mag;
    }
    if (mag) {
      const r = mag.getBoundingClientRect();
      mag.style.setProperty('--x', `${((x - (r.left + r.width / 2)) * 0.2).toFixed(1)}px`);
      mag.style.setProperty('--y', `${((y - (r.top + r.height / 2)) * 0.3).toFixed(1)}px`);
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !ligado()) return;
    alvo.x = e.clientX;
    alvo.y = e.clientY;
    c.classList.add('visivel');
    sob(e.target, e.clientX, e.clientY);
    if (!rodando) {
      rodando = true;
      requestAnimationFrame(laco);
    }
  });
  document.documentElement.addEventListener('pointerleave', () => c.classList.remove('visivel'));
  window.addEventListener('pointerdown', () => c.classList.add('apertado'));
  window.addEventListener('pointerup', () => c.classList.remove('apertado'));
  // a página rola por baixo do cursor parado: o que está sob ele muda
  rolagem.aoRolar(() => {
    if (c.classList.contains('visivel')) sob(document.elementFromPoint(alvo.x, alvo.y), alvo.x, alvo.y);
  });
  return {
    atualizar() {
      if (!ligado()) c.classList.remove('visivel');
    },
  };
}
