// A roda de "O que eu construo", como a lista de serviços do Emotion: a
// rolagem passa os itens pelo meio da tela e o do meio acende (o visto
// aparece, o texto abre). No computador, os itens longe do meio recuam de
// leve para a direita e diminuem — a borda de uma roda girando. Só o título
// se move: os fios entre os itens ficam alinhados, como a régua que são.
export function iniciarRoda(rolagem, { som, parado }) {
  const roda = document.getElementById('roda');
  if (!roda) return;
  const itens = [...roda.children];
  // o texto de cada item ganha um invólucro (para abrir com grid 0fr → 1fr)
  itens.forEach((li) => {
    const p = li.querySelector('p');
    p.innerHTML = `<span>${p.innerHTML}</span>`;
  });
  const largo = window.matchMedia('(min-width: 761px)');
  let atual = -1;

  function atualizar() {
    const H = window.innerHeight;
    const meio = H * 0.48;
    let perto = 0;
    let menor = Infinity;
    const ds = itens.map((li, k) => {
      const r = li.getBoundingClientRect();
      const d = (r.top + Math.min(r.height, 90) / 2 - meio) / H;
      if (Math.abs(d) < menor) {
        menor = Math.abs(d);
        perto = k;
      }
      return d;
    });
    // antes da lista entrar ou depois de sair, nenhum aceso
    const primeiro = itens[0].getBoundingClientRect().top;
    const ultimo = itens[itens.length - 1].getBoundingClientRect().bottom;
    if (primeiro > H * 0.75 || ultimo < H * 0.25) perto = -1;
    if (perto !== atual) {
      atual = perto;
      itens.forEach((li, k) => li.classList.toggle('acesa', k === perto));
      if (perto >= 0) som?.tique(0.6);
    }
    if (!largo.matches || parado()) {
      itens.forEach((li) => (li.firstElementChild.style.transform = ''));
      return;
    }
    itens.forEach((li, k) => {
      const d = Math.min(1, Math.abs(ds[k]) * 1.6);
      li.firstElementChild.style.transform = `translateX(${(d * d * 48).toFixed(1)}px) scale(${(1 - d * 0.08).toFixed(3)})`;
    });
  }
  rolagem.aoRolar(atualizar);
  window.addEventListener('resize', atualizar);
  atualizar();
}
