// A CONTA: quanto custa, por ano, o processo que hoje é feito à mão. Quatro
// números de quem lê (pessoas, horas, custo da hora, quanto a IA assume) e
// a matéria escreve o resultado. A parte ACESA do número é a fração que pode
// voltar: se a IA assume 40%, 40% do número se acende, da esquerda para a
// direita — o gráfico é o próprio número.
//
// É uma conta de guardanapo, dita como tal. O diagnóstico refaz a conta com
// os dados de verdade.
import { amostrar, dinamicas, BRANCO, ACESO } from '../materia/formas.js';

const SEMANAS = 48; // semanas de trabalho num ano, descontadas férias e feriados
const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const inteiro = (v) => Math.round(v).toLocaleString('pt-BR');

// o número curto que as partículas escrevem
function curto(v) {
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (v >= 1e4) return `R$ ${Math.round(v / 1e3)} mil`;
  return `R$ ${inteiro(v)}`;
}

export function iniciarConta({ materia, som }) {
  const raiz = document.getElementById('conta-form');
  if (!raiz) return;
  const figura = document.getElementById('conta-figura');
  const resultado = document.getElementById('conta-resultado');
  const levar = document.getElementById('conta-levar');
  const campos = [...raiz.querySelectorAll('input[type="range"]')];
  let versao = 0;
  let texto = '';
  let fracao = 0.4;
  let espera = 0;

  const fonte = () => getComputedStyle(document.body).fontFamily;

  dinamicas.conta = (w, h, n) =>
    amostrar(`conta-${versao}`, w, h, n, (c) => {
      // o tamanho da letra: o maior que cabe na caixa, numa linha
      // a largura estreita da marca; trocar c.font zera o fontStretch, então
      // ele é reaplicado a cada troca (senão mede estreito e desenha largo)
      const letra = (px) => {
        c.font = `760 ${px}px ${fonte()}`;
        if ('fontStretch' in c) c.fontStretch = 'condensed';
      };
      letra(100);
      const m = c.measureText(texto);
      const tam = Math.min(h * 0.62, (w * 0.94 * 100) / m.width);
      letra(tam);
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      const largura = c.measureText(texto).width;
      const x = (w - largura) / 2;
      c.fillStyle = BRANCO;
      c.fillText(texto, x, h / 2);
      // a parte que volta: o número se acende até a fração escolhida
      c.save();
      c.beginPath();
      c.rect(x, 0, largura * fracao, h);
      c.clip();
      c.fillStyle = ACESO;
      c.fillText(texto, x, h / 2);
      c.restore();
      // a régua embaixo: onde a fração termina
      c.fillStyle = BRANCO;
      c.fillRect(x, h / 2 + tam * 0.46, largura, 3);
      c.fillStyle = ACESO;
      c.fillRect(x, h / 2 + tam * 0.46 - 2, largura * fracao, 7);
    }, { semente: 97, resolucao: 460 });

  function calcular(animar) {
    const v = Object.fromEntries(campos.map((c) => [c.name, Number(c.value)]));
    campos.forEach((c) => {
      const saida = raiz.querySelector(`output[for="${c.id}"]`);
      if (saida) saida.textContent = c.name === 'hora' ? reais(v.hora) : c.name === 'parte' ? `${v.parte}%` : inteiro(v[c.name]);
    });
    const horasAno = v.pessoas * v.horas * SEMANAS;
    const custo = horasAno * v.hora;
    const volta = custo * (v.parte / 100);
    resultado.innerHTML = `O jeito manual custa <strong>${reais(custo)} por ano</strong> em ${inteiro(horasAno)} horas de gente. Se a IA assumir ${v.parte}% desse trabalho, voltam <strong>${reais(volta)}</strong> e <strong>${inteiro(horasAno * (v.parte / 100))} horas</strong> por ano.`;
    const corpo = [
      'Olá, Vinícius.',
      '',
      'Fiz a conta no seu site:',
      `- ${v.pessoas} pessoas, ${v.horas} horas por semana cada, hora a ${reais(v.hora)}`,
      `- custo do processo manual: ${reais(custo)} por ano`,
      `- se a IA assumir ${v.parte}%: ${reais(volta)} por ano`,
      '',
      'O processo é:',
      'Empresa e tamanho:',
    ].join('\n');
    levar.href = `mailto:viniciusmbpro@gmail.com?subject=${encodeURIComponent('A conta do processo manual')}&body=${encodeURIComponent(corpo)}`;
    const novo = curto(custo);
    const novaFracao = v.parte / 100;
    if (novo === texto && novaFracao === fracao) return;
    // a matéria só se refaz quando a mão para (senão ela nunca pousa)
    clearTimeout(espera);
    espera = setTimeout(
      () => {
        const de = materia.formaAtual(figura);
        texto = novo;
        fracao = novaFracao;
        versao++;
        if (animar) {
          materia.morfar(figura, de, 1100);
          som?.graos();
        }
      },
      animar ? 220 : 0,
    );
  }

  campos.forEach((c) => c.addEventListener('input', () => calcular(true)));
  calcular(false);
  // a fonte da página pode chegar depois: redesenha com ela
  document.fonts?.ready.then(() => {
    versao++;
  });
}
