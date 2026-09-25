// Os CASOS na horizontal: a seção fica presa e a rolagem passa as fichas de
// lado, uma a uma. Em cada ficha a pista PARA (enquanto a matéria desenha o
// sistema dela) e só anda no meio do caminho entre uma e outra — a mesma
// conta de trechos que o motor usa, então ficha e desenho chegam juntos.
// No celular as fichas empilham (rolar de lado com o polegar, preso, cansa).
export function iniciarCasos(rolagem) {
  const trilho = document.getElementById('trilho-casos');
  const pista = document.getElementById('pista-casos');
  if (!trilho || !pista) return;
  const fichas = [...pista.children];
  const atual = document.getElementById('pista-atual');
  const enche = document.getElementById('pista-enche');
  const largo = window.matchMedia('(min-width: 761px)');
  const n = fichas.length;
  const suave = (t) => t * t * (3 - 2 * t);
  let ultima = -1;
  let tx = 0; // o deslocamento aplicado agora

  function atualizar(y = window.scrollY) {
    if (!largo.matches) {
      tx = 0;
      pista.style.transform = '';
      return;
    }
    const H = window.innerHeight;
    const T0 = trilho.getBoundingClientRect().top + y;
    const seg = (trilho.offsetHeight - H) / n;
    // q: o índice contínuo; parado em cada ficha, andando só no meio
    const q = Math.max(0, Math.min(n - 1, (y - T0) / seg - 0.5));
    const k = Math.floor(q);
    const f = q - k;
    const idx = k + suave(Math.max(0, Math.min(1, (f - 0.28) / 0.44)));
    // posições naturais (sem o deslocamento atual), medidas na tela
    const natural = (i) => fichas[i].getBoundingClientRect().left - tx;
    const passo = fichas[1] ? natural(1) - natural(0) : 0;
    const centro = (window.innerWidth - fichas[0].offsetWidth) / 2 - natural(0);
    tx = centro - idx * passo;
    pista.style.transform = `translate3d(${tx.toFixed(1)}px, 0, 0)`;
    const perto = Math.round(idx);
    if (perto !== ultima) {
      ultima = perto;
      atual.textContent = String(perto + 1);
      fichas.forEach((fi, i) => fi.classList.toggle('na-vez', i === perto));
    }
    enche.style.transform = `scaleX(${((idx + 1) / n).toFixed(3)})`;
  }
  rolagem.aoRolar(atualizar);
  window.addEventListener('resize', () => atualizar());
  atualizar();
}
