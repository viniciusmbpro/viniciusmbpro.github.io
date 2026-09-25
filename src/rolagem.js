import Lenis from 'lenis';
import gsap from 'gsap';

// Rolagem com inércia (Lenis) no mesmo relógio do gsap, para que tudo que
// depende da posição da página ande no mesmo quadro. Quem pediu menos
// movimento fica com a rolagem nativa, sem inércia.
export function criarRolagem() {
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ouvintes = new Set();
  const avisar = () => ouvintes.forEach((f) => f(window.scrollY));
  const topo = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topo')) || 72;

  if (calmo) {
    window.addEventListener('scroll', avisar, { passive: true });
    return {
      aoRolar: (f) => ouvintes.add(f),
      parar() {},
      soltar() {},
      irPara: (alvo) => (typeof alvo === 'number' ? window.scrollTo(0, alvo) : (typeof alvo === 'string' ? document.querySelector(alvo) : alvo)?.scrollIntoView()),
    };
  }

  const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', avisar);

  // âncoras internas passam pela mesma inércia, descontando o cabeçalho
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const alvo = document.querySelector(a.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: a.getAttribute('href') === '#inicio' ? 0 : -topo() + 1, duration: 1.5 });
    // o foco acompanha a âncora (teclado e leitor de tela continuam dali)
    alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
  });

  return {
    lenis,
    aoRolar: (f) => ouvintes.add(f),
    parar: () => lenis.stop(),
    soltar: () => lenis.start(),
    irPara: (alvo, opcoes) => lenis.scrollTo(alvo, { duration: 1.2, ...opcoes }),
  };
}
