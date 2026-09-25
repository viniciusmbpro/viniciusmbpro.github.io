// Para quem explora: digitar "jarvis" em qualquer lugar da página. A matéria
// pulsa como uma voz, toca o visto e o assistente responde — um aceno ao
// orquestrador por voz com que este site (e os sistemas das fichas) foram
// construídos.
export function iniciarSegredo({ materia, som }) {
  const aviso = document.getElementById('segredo');
  const palavra = 'jarvis';
  let digitado = '';
  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.key.length !== 1) return;
    digitado = (digitado + e.key.toLowerCase()).slice(-palavra.length);
    if (digitado !== palavra) return;
    digitado = '';
    materia.pulsar();
    som.destravar().then(() => som.visto());
    aviso.textContent = 'Jarvis: às ordens. Pode falar.';
    aviso.classList.remove('aparece');
    void aviso.offsetWidth;
    aviso.classList.add('aparece');
    setTimeout(() => aviso.classList.remove('aparece'), 3200);
  });
}
