// O painel de ajustes: som, tema e qualidade gráfica. Fica guardado no
// navegador; na primeira visita a qualidade é escolhida pelo aparelho.
const CHAVE_TEMA = 'vm:tema';
const CHAVE_QUALIDADE = 'vm:qualidade';
const ler = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const guardar = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

// a qualidade que o aparelho aguenta, quando a pessoa ainda não escolheu
function qualidadeDoAparelho() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'parado';
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return 'leve';
  } catch {
    return 'leve';
  }
  const fraco = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  // economia de dados ligada: a pessoa pediu leveza
  if (navigator.connection?.saveData) return 'leve';
  return fraco ? 'leve' : 'alta';
}

export function lerAjustes() {
  const tema = ler(CHAVE_TEMA) || 'alternado';
  const qualidade = ler(CHAVE_QUALIDADE) || qualidadeDoAparelho();
  document.documentElement.dataset.prefTema = tema;
  document.documentElement.classList.toggle('parado', qualidade === 'parado');
  return { tema, qualidade };
}

export function iniciarAjustes({ som, ambiente, qualidade, aoMudarTema, aoMudarQualidade }) {
  const botao = document.getElementById('ajustes-abre');
  const painel = document.getElementById('ajustes');
  const raiz = document.documentElement;
  const marcar = (nome, valor) => {
    const r = painel.querySelector(`input[name="${nome}"][value="${valor}"]`);
    if (r) r.checked = true;
  };
  marcar('som', !som.ligado ? 'off' : ambiente.quer ? 'ambiente' : 'efeitos');
  marcar('tema', raiz.dataset.prefTema);
  marcar('qualidade', qualidade);
  marcar('paleta', raiz.dataset.paleta === 'classica' ? 'classica' : 'visto');

  // o painel toma as cores da seção sob o topo
  const tingir = () => (painel.dataset.tema = document.getElementById('topo').dataset.tema || 'escuro');
  function abrir(sim) {
    painel.hidden = !sim;
    botao.setAttribute('aria-expanded', String(sim));
    raiz.classList.toggle('ajustes-aberto', sim);
    if (sim) {
      tingir();
      painel.querySelector('input:checked')?.focus();
    }
  }
  botao.addEventListener('click', () => abrir(painel.hidden));
  painel.querySelector('.ajustes-fecha').addEventListener('click', () => {
    abrir(false);
    botao.focus();
  });
  document.addEventListener('pointerdown', (e) => {
    if (!painel.hidden && !painel.contains(e.target) && !botao.contains(e.target)) abrir(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !painel.hidden) {
      abrir(false);
      botao.focus();
    }
  });

  painel.addEventListener('change', async (e) => {
    const { name, value } = e.target;
    if (name === 'som') {
      som.alternar(value !== 'off');
      ambiente.querer(value === 'ambiente');
      await ambiente.tocar(value === 'ambiente');
      if (value !== 'off') {
        await som.destravar();
        som.visto();
      }
    } else if (name === 'tema') {
      raiz.dataset.prefTema = value;
      guardar(CHAVE_TEMA, value);
      aoMudarTema?.(value);
      tingir();
    } else if (name === 'paleta') {
      if (value === 'classica') raiz.dataset.paleta = 'classica';
      else delete raiz.dataset.paleta;
      guardar('vm:paleta', value);
      // a matéria relê as cores no próximo quadro; o remedir a acorda
      aoMudarTema?.(raiz.dataset.prefTema);
    } else if (name === 'qualidade') {
      guardar(CHAVE_QUALIDADE, value);
      raiz.classList.toggle('parado', value === 'parado');
      aoMudarQualidade?.(value);
    }
  });
}
