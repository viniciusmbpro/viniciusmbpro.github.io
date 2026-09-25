// A régua do Método: cada etapa ganha uma estação. Quando a leitura passa
// por ela, o fio se enche de vermelhão e a estação recebe o visto —
// literalmente "etapa aprovada". Na tela larga as etapas estão em três
// colunas: a coluna da direita espera um pouco mais, para o fio andar da
// esquerda para a direita.
const VISTO = '<svg class="visto-svg" viewBox="0 0 100 85" aria-hidden="true"><path d="M8 41 L36 65 L94 7" pathLength="130"/></svg>';

export function iniciarMetodo(rolagem, { som }) {
  const lista = document.getElementById('linha-metodo');
  if (!lista) return;
  const itens = [...lista.children];
  itens.forEach((li) => li.insertAdjacentHTML('afterbegin', `<span class="estacao" aria-hidden="true">${VISTO}</span>`));
  const passou = new Set();

  function atualizar() {
    const H = window.innerHeight;
    const colunas = getComputedStyle(lista).gridTemplateColumns.split(' ').length;
    itens.forEach((li, k) => {
      const r = li.getBoundingClientRect();
      const atraso = (k % colunas) * H * 0.06;
      const enche = Math.max(0, Math.min(1, (H * 0.78 - atraso - r.top) / (H * 0.28)));
      li.style.setProperty('--enche', `${(enche * 100).toFixed(1)}%`);
      const foi = enche > 0.08;
      if (foi !== passou.has(li)) {
        li.classList.toggle('passou', foi);
        if (foi) {
          passou.add(li);
          som?.tique(0.8);
        } else passou.delete(li);
      }
    });
  }
  rolagem.aoRolar(atualizar);
  window.addEventListener('resize', atualizar);
  atualizar();
}
