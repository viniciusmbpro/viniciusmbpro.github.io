// O carregamento: um contador de 000 a 100 enquanto as fontes e o retrato
// chegam. Ele não mente: só passa de 80 quando o que falta carregou de fato,
// e nunca fica menos de ~1,2 s (menos que isso, parece um piscar).
// Enquanto conta, o visto se desenha; no 100 ele sai por cima, com a borda
// em V — o mesmo gesto das trocas de seção.
export function iniciarCarregador({ esperar = [], aoSair }) {
  const el = document.getElementById('carregador');
  const conta = document.getElementById('conta');
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el) {
    aoSair?.();
    return;
  }
  let pronto = false;
  Promise.allSettled(esperar).then(() => (pronto = true));
  // se algo travar (rede ruim), a página não fica refém do contador
  setTimeout(() => (pronto = true), 4000);

  const t0 = performance.now();
  const minimo = calmo ? 200 : 1200;
  let valor = 0;
  function quadro(agora) {
    const decorrido = agora - t0;
    // até 80 anda sozinho, no tempo mínimo; os últimos 20 esperam o que falta
    const alvo = Math.min(pronto ? 100 : 80, (decorrido / minimo) * 100);
    valor += (alvo - valor) * 0.14;
    if (alvo === 100 && valor > 99.4) valor = 100;
    const n = Math.floor(valor);
    conta.textContent = String(n).padStart(3, '0');
    el.style.setProperty('--carga', (valor / 100).toFixed(3));
    if (n < 100) {
      requestAnimationFrame(quadro);
      return;
    }
    setTimeout(sair, calmo ? 0 : 220);
  }
  function sair() {
    el.classList.add('saindo');
    document.documentElement.classList.add('carregou');
    aoSair?.();
    setTimeout(() => el.remove(), calmo ? 50 : 1200);
  }
  requestAnimationFrame(quadro);
}
