// Todo som do site é sintetizado na hora (Web Audio): nenhum arquivo para
// baixar, e cada toque soa um pouco diferente do anterior.
//
// A família sonora é a do lápis de revisão: um risco curto de grafite sobre
// papel e, quando algo fica pronto, o "visto" — duas notas subindo uma quinta
// (mi → si). Nada de zumbido, nada de som contínuo: por padrão o site toca só
// esses efeitos, e só depois do primeiro gesto de quem lê.
const CHAVE = 'vm:som';

export function criarSom() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  let ac = null;
  let saida = null;
  let ruido = null;
  let ligado = true;
  try {
    if (localStorage.getItem(CHAVE) === 'off') ligado = false;
  } catch {}

  function contexto() {
    if (ac || !Ctx) return ac;
    ac = new Ctx();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    saida = ac.createGain();
    saida.gain.value = 0.8;
    saida.connect(comp).connect(ac.destination);
    ruido = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }

  const podeTocar = () => ligado && ac && ac.state === 'running';

  function envelope(g, t, pico, ataque, dur) {
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(Math.max(pico, 2e-4), t + ataque);
    g.gain.exponentialRampToValueAtTime(1e-4, t + ataque + dur);
  }
  function tom({ tipo = 'sine', f0, f1 = f0, t = ac.currentTime, dur, pico, ataque = 0.004 }) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    envelope(g, t, pico, ataque, dur);
    o.connect(g).connect(saida);
    o.start(t);
    o.stop(t + ataque + dur + 0.05);
  }
  function chiado({ t = ac.currentTime, dur, pico, tipo = 'bandpass', f0, f1 = f0, q = 1, ataque = 0.005 }) {
    const src = ac.createBufferSource();
    src.buffer = ruido;
    const filtro = ac.createBiquadFilter();
    filtro.type = tipo;
    filtro.Q.value = q;
    filtro.frequency.setValueAtTime(f0, t);
    filtro.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const g = ac.createGain();
    envelope(g, t, pico, ataque, dur);
    src.connect(filtro).connect(g).connect(saida);
    src.start(t, Math.random() * 0.5);
    src.stop(t + ataque + dur + 0.05);
  }

  const efeitos = {
    // o cursor sobre algo clicável: um toque seco de ponta de lápis
    tique(forca = 1) {
      if (!podeTocar()) return;
      chiado({ dur: 0.02, pico: 0.05 * forca, f0: 4200, q: 2.5, ataque: 0.001 });
      tom({ f0: 1400, f1: 1300, dur: 0.03, pico: 0.02 * forca, ataque: 0.001 });
    },
    // um risco de grafite: o traço que sublinha um título
    risco(dur = 0.5) {
      if (!podeTocar()) return;
      chiado({ dur, pico: 0.045, f0: 2600, f1: 3600, q: 1.4, ataque: dur * 0.2 });
    },
    // a matéria chegou numa forma: um toque de madeira, afinado pela ordem
    // do capítulo (a página inteira sobe uma escala pentatônica)
    chegada(i = 0) {
      if (!podeTocar()) return;
      const escala = [329.6, 392, 440, 493.9, 587.3, 659.3, 784, 880, 987.8];
      const f = escala[i % escala.length];
      tom({ f0: f, f1: f * 0.985, dur: 0.22, pico: 0.05 });
      tom({ tipo: 'triangle', f0: f * 2, dur: 0.08, pico: 0.008 });
      tom({ f0: 120, f1: 70, dur: 0.07, pico: 0.06 });
    },
    // grãos: a matéria se espalhando
    graos() {
      if (!podeTocar()) return;
      const t = ac.currentTime;
      for (let k = 0; k < 6; k++) chiado({ t: t + k * 0.03 + Math.random() * 0.02, dur: 0.015, pico: 0.02, f0: 3000 + Math.random() * 3000, q: 6, ataque: 0.001 });
    },
    // O VISTO: o risco curto do lápis e duas notas subindo uma quinta.
    // É a assinatura sonora do site.
    visto() {
      if (!podeTocar()) return;
      const t = ac.currentTime;
      chiado({ t, dur: 0.07, pico: 0.06, f0: 2200, f1: 3400, q: 1.6, ataque: 0.004 });
      chiado({ t: t + 0.08, dur: 0.16, pico: 0.05, f0: 3000, f1: 5200, q: 1.6, ataque: 0.01 });
      tom({ f0: 659.3, t: t + 0.06, dur: 0.9, pico: 0.06, ataque: 0.006 });
      tom({ f0: 987.8, t: t + 0.2, dur: 1.3, pico: 0.055, ataque: 0.006 });
      tom({ tipo: 'triangle', f0: 1975.5, t: t + 0.2, dur: 0.35, pico: 0.008 });
      tom({ f0: 164.8, t, dur: 1, pico: 0.05, ataque: 0.02 });
    },
    // o contador do carregamento chegando a 100
    pronto() {
      if (podeTocar()) tom({ f0: 987.8, dur: 0.7, pico: 0.035, ataque: 0.005 });
    },
  };

  return {
    ...efeitos,
    // o navegador só libera áudio depois de um gesto. No celular esse gesto é
    // o CLIQUE (o pointerdown não conta no iOS): arma para retomar no
    // primeiro clique ou tecla, em qualquer lugar da página
    armar() {
      const eventos = ['click', 'keydown', 'touchend'];
      const umaVez = () => {
        this.destravar();
        eventos.forEach((e) => window.removeEventListener(e, umaVez, true));
      };
      eventos.forEach((e) => window.addEventListener(e, umaVez, { capture: true, passive: true }));
    },
    async destravar() {
      // iPhone: por padrão o Web Audio obedece à chave de silencioso. Declarar
      // a sessão como reprodução faz o som tocar como um vídeo tocaria
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';
      } catch {}
      contexto();
      if (!ac) return false;
      // um quadro de silêncio tocado DENTRO do gesto destrava Safaris antigos
      try {
        const vazio = ac.createBufferSource();
        vazio.buffer = ac.createBuffer(1, 1, ac.sampleRate);
        vazio.connect(ac.destination);
        vazio.start(0);
      } catch {}
      if (ac.state !== 'running') {
        try {
          await ac.resume();
        } catch {}
      }
      return ac.state === 'running';
    },
    get contexto() {
      return ac;
    },
    get ligado() {
      return ligado;
    },
    alternar(valor = !ligado) {
      ligado = valor;
      try {
        localStorage.setItem(CHAVE, ligado ? 'on' : 'off');
      } catch {}
      return ligado;
    },
  };
}
