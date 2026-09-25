// O som ambiente: só toca para quem escolhe "Ambiente e efeitos" no painel.
// O padrão é "Só efeitos" — um som contínuo por padrão soa como motor ligado.
//
// Não é um acorde parado: são notas soltas e macias (mi, si, ré — a quinta do
// visto e uma sétima), uma de cada vez, com ataque lento, cauda longa e
// vários segundos de silêncio entre elas. Cada capítulo muda só o registro.
const CHAVE = 'vm:ambiente';
const CARATER = {
  claro: { notas: [329.6, 493.9, 587.3], pausa: [8, 13] },
  escuro: { notas: [164.8, 246.9, 329.6], pausa: [9, 14] },
};
const VOLUME = 0.02;

export function criarAmbiente(som) {
  let quer = false;
  try {
    quer = localStorage.getItem(CHAVE) === 'on';
  } catch {}
  let saida = null;
  let tocando = false;
  let atual = 'escuro';
  let proxima = 0;

  function montar() {
    const ac = som.contexto;
    if (saida || !ac) return ac;
    saida = ac.createGain();
    saida.gain.value = VOLUME;
    const filtro = ac.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 2000;
    saida.connect(filtro).connect(ac.destination);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(proxima);
      else if (tocando) agendar();
    });
    return ac;
  }

  function nota() {
    const ac = som.contexto;
    if (!tocando || !ac || ac.state !== 'running') return;
    const c = CARATER[atual];
    const f = c.notas[(Math.random() * c.notas.length) | 0];
    const t = ac.currentTime;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 1.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 7);
    g.connect(saida);
    for (const [mult, peso, desafina] of [[1, 1, 0], [2, 0.1, 4], [3, 0.03, -3]]) {
      const o = ac.createOscillator();
      const og = ac.createGain();
      o.frequency.value = f * mult;
      o.detune.value = desafina;
      og.gain.value = peso;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 7.2);
    }
    agendar();
  }
  function agendar() {
    clearTimeout(proxima);
    if (!tocando) return;
    const [a, b] = CARATER[atual].pausa;
    proxima = setTimeout(nota, (a + Math.random() * (b - a)) * 1000);
  }

  return {
    get quer() {
      return quer;
    },
    querer(sim) {
      quer = sim;
      try {
        localStorage.setItem(CHAVE, sim ? 'on' : 'off');
      } catch {}
    },
    async tocar(sim) {
      if (!sim) {
        tocando = false;
        clearTimeout(proxima);
        return;
      }
      await som.destravar();
      if (!montar()) return;
      const antes = tocando;
      tocando = som.contexto.state === 'running';
      if (tocando && !antes) proxima = setTimeout(nota, 1200);
    },
    carater(tema) {
      if (CARATER[tema]) atual = tema;
    },
  };
}
