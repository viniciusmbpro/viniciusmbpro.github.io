// As trocas de tema entre seções. Quando a próxima seção tem outro tema, a
// cor dela sobe no pé da seção atual com a borda em V (o visto varrendo a
// página). Com o tema forçado no painel, não há troca.
export function iniciarTrocas(rolagem) {
  const secoes = [...document.querySelectorAll('main > .secao')];
  let trocas = [];

  function marcar() {
    const pref = document.documentElement.dataset.prefTema;
    const unico = pref === 'escuro' || pref === 'claro';
    secoes.forEach((s) => s.classList.remove('antes-da-troca'));
    trocas = [];
    for (let i = 1; i < secoes.length; i++) {
      if (unico || secoes[i].dataset.tema === secoes[i - 1].dataset.tema) continue;
      secoes[i - 1].classList.add('antes-da-troca');
      trocas.push(secoes[i - 1]);
    }
    atualizar();
  }

  // p vai de 0 (o pé da seção ainda embaixo da tela) a 1 (o pé já em 20% da
  // altura: a cor seguinte tomou o fim inteiro da seção)
  function atualizar() {
    const H = window.innerHeight;
    for (const s of trocas) {
      const r = s.getBoundingClientRect();
      if (r.bottom < -H || r.top > 2 * H) continue;
      const p = Math.max(0, Math.min(1, (H * 1.02 - r.bottom) / (H * 0.82)));
      s.style.setProperty('--p', p.toFixed(4));
    }
  }

  marcar();
  rolagem.aoRolar(atualizar);
  window.addEventListener('resize', atualizar);
  return { marcar };
}
