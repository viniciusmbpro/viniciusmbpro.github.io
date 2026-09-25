// O topo: acompanha o tema da seção que está por baixo dele, some quando o
// leitor desce (a página é dele) e volta quando ele sobe. O menu marca o
// capítulo em que o leitor está. No celular, o menu abre em tela cheia.
export function iniciarTopo(rolagem, { aoCapitulo } = {}) {
  const topo = document.getElementById('topo');
  const menu = document.getElementById('menu');
  const abre = document.getElementById('menu-abre');
  const secoes = [...document.querySelectorAll('main > .secao')];
  const links = new Map([...menu.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
  let yAntes = window.scrollY;
  let capitulo = '';

  function atualizar(y = window.scrollY) {
    const H = window.innerHeight;
    const alto = topo.offsetHeight;
    // o tema de quem está sob o topo
    const sob = secoes.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= alto * 0.5 && r.bottom > alto * 0.5;
    });
    if (sob) topo.dataset.tema = sob.dataset.tema;
    topo.classList.toggle('com-fundo', y > 24);
    // some ao descer (depois do início), volta ao subir
    const aberto = menu.classList.contains('aberto') || document.documentElement.classList.contains('ajustes-aberto');
    if (!aberto && Math.abs(y - yAntes) > 6) topo.classList.toggle('escondido', y > yAntes && y > H * 0.8);
    yAntes = y;
    // o capítulo: a seção que cobre o meio da tela
    const atual = secoes.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= H * 0.45 && r.bottom > H * 0.45;
    });
    if (atual && atual.id !== capitulo) {
      capitulo = atual.id;
      links.forEach((a, id) => a.setAttribute('aria-current', String(id === capitulo)));
      aoCapitulo?.(atual);
    }
  }

  function abrirMenu(sim) {
    menu.classList.toggle('aberto', sim);
    abre.setAttribute('aria-expanded', String(sim));
    abre.querySelector('.visualmente-oculto').textContent = sim ? 'Fechar o menu' : 'Abrir o menu';
    if (sim) {
      topo.classList.remove('escondido');
      rolagem.parar();
      menu.querySelector('a')?.focus();
    } else rolagem.soltar();
  }
  abre.addEventListener('click', () => abrirMenu(!menu.classList.contains('aberto')));
  menu.addEventListener('click', (e) => e.target.closest('a') && abrirMenu(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('aberto')) {
      abrirMenu(false);
      abre.focus();
    }
  });
  // quem navega pelo teclado sempre vê o topo
  topo.addEventListener('focusin', () => topo.classList.remove('escondido'));

  rolagem.aoRolar(atualizar);
  atualizar();
}
