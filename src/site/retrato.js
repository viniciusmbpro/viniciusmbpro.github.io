// A FOTO por baixo das partículas. O meio-tom é o rascunho; a foto é o
// original. Com o mouse, uma lanterna mostra a foto onde a pessoa olha (e a
// matéria já abre espaço ali, porque foge do cursor). No toque, ou pelo
// botão, a foto aparece inteira num círculo que cresce do centro.
export function iniciarRetrato() {
  const caixa = document.getElementById('retrato');
  const botao = document.querySelector('.retrato-botao');
  if (!caixa || !botao) return;
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.documentElement.classList.toggle('sem-lanterna', !mouse);

  const mostrar = (sim) => {
    caixa.classList.toggle('inteira', sim);
    botao.setAttribute('aria-pressed', String(sim));
    botao.textContent = sim ? 'Voltar às partículas' : 'Ver a foto';
    if (sim) {
      caixa.style.setProperty('--mx', '50%');
      caixa.style.setProperty('--my', '45%');
    }
  };
  botao.addEventListener('click', () => mostrar(!caixa.classList.contains('inteira')));
  if (mouse) {
    caixa.addEventListener('pointermove', (e) => {
      if (caixa.classList.contains('inteira')) return;
      const r = caixa.getBoundingClientRect();
      caixa.style.setProperty('--mx', `${e.clientX - r.left}px`);
      caixa.style.setProperty('--my', `${e.clientY - r.top}px`);
      caixa.classList.add('lanterna');
    });
    caixa.addEventListener('pointerleave', () => caixa.classList.remove('lanterna'));
  } else {
    caixa.addEventListener('click', () => mostrar(!caixa.classList.contains('inteira')));
  }
}
