// As etapas de "Como começa": a seção fica presa enquanto a rolagem passa por
// cada etapa. A etapa do trecho acende e abre o texto; a matéria, ao lado,
// muda de desenho no mesmo compasso (ver motor.js — as duas contas usam o
// mesmo trecho).
export function iniciarTrilho(rolagem) {
  const trilhos = [...document.querySelectorAll('.trilho')];
  const estado = new Map();
  function atualizar(y = window.scrollY) {
    const H = window.innerHeight;
    for (const t of trilhos) {
      const passos = [...t.querySelectorAll('.etapa')];
      const T0 = t.getBoundingClientRect().top + y;
      const seg = (t.offsetHeight - H) / passos.length;
      const k = Math.max(0, Math.min(passos.length - 1, Math.floor((y - T0) / seg)));
      if (estado.get(t) !== k) {
        estado.set(t, k);
        passos.forEach((p, i) => p.classList.toggle('acesa', i === k));
      }
    }
  }
  rolagem.aoRolar(atualizar);
  window.addEventListener('resize', () => atualizar());
  atualizar();
}
