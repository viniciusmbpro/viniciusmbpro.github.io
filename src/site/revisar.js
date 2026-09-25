// A revisão dos títulos.
//
// No título do início, o único momento "autoral" de texto: as letras chegam
// como tinta assentando — do desfocado ao nítido, da esquerda para a direita.
// Nos títulos de capítulo, nada de efeito letra a letra (seria o mesmo truque
// repetido em toda seção): o título aparece inteiro e o lápis grifa a
// palavra-chave, com um traço à mão levemente irregular.
//
// Os traços do grifo são desenhados uma vez, com uma pequena variação por
// palavra — não há dois grifos iguais, como não há na mão.
function tracoAMao(semente) {
  let s = semente;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const y0 = 5 + r() * 2;
  const y1 = 3 + r() * 3;
  const y2 = 4 + r() * 3;
  return `M1 ${y0.toFixed(1)} C 30 ${(y1 - 1).toFixed(1)}, 60 ${(y2 + 1).toFixed(1)}, 99 ${y1.toFixed(1)}`;
}

function prepararMestre(el) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  let i = 0;
  el.querySelectorAll('.linha').forEach((linha) => {
    const nos = [...linha.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    for (const n of nos) {
      const frag = document.createDocumentFragment();
      for (const parte of n.textContent.split(/(\s+)/)) {
        if (!parte) continue;
        if (/^\s+$/.test(parte)) {
          frag.append(' ');
          continue;
        }
        // cada palavra inteira numa caixa que não quebra (senão a linha
        // poderia quebrar no meio da palavra)
        const pal = document.createElement('span');
        pal.className = 'pal';
        pal.setAttribute('aria-hidden', 'true');
        for (const ch of parte) {
          const c = document.createElement('span');
          c.className = 'ch';
          c.style.setProperty('--i', i++);
          c.textContent = ch;
          pal.append(c);
        }
        frag.append(pal);
      }
      n.replaceWith(frag);
    }
  });
}

export function iniciarRevisao({ som }) {
  const mestre = document.querySelector('.titulo-mestre');
  if (mestre) prepararMestre(mestre);

  document.querySelectorAll('.grifo').forEach((g, k) => {
    g.insertAdjacentHTML(
      'beforeend',
      `<svg class="grifo-traco" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="${tracoAMao(k * 131 + 7)}" pathLength="1"/></svg>`,
    );
  });

  // os títulos e blocos de capítulo aparecem ao entrar na tela
  const alvos = document.querySelectorAll('.secao:not(.inicio) .titulo, .secao .lide, .desenho figcaption, .ficha, .regras, .lista-perguntas, .fontes');
  alvos.forEach((el) => el.classList.add('revelar'));
  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('visto-ok');
        if (e.target.matches('.titulo')) {
          e.target.classList.add('revisado');
          if (e.target.querySelector('.grifo')) setTimeout(() => som?.risco(0.45), 350);
        }
        obs.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
  );
  alvos.forEach((el) => obs.observe(el));

  return {
    // o título do início é revisado quando o carregamento sai da frente
    abrirMestre() {
      mestre?.classList.add('revisado');
    },
  };
}
