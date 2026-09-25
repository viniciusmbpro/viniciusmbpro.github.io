// A ordem da página:
//   1. os ajustes guardados (tema e qualidade) — antes de tudo desenhar;
//   2. a rolagem, o som (só efeitos, e só depois de um gesto) e as trocas;
//   3. a matéria, que já mede as estações mas só aparece quando o
//      carregamento sai da frente;
//   4. o carregamento conta até 100 esperando as fontes e o retrato;
//   5. na saída: a poeira vira o visto, o título do início assenta.
import { criarRolagem } from './rolagem.js';
import { criarSom } from './som.js';
import { criarAmbiente } from './ambiente.js';
import { criarMateria } from './materia/motor.js';
import { carregarRetrato } from './materia/formas.js';
import { lerAjustes, iniciarAjustes } from './site/ajustes.js';
import { iniciarCarregador } from './site/carregador.js';
import { iniciarTrocas } from './site/trocas.js';
import { iniciarTopo } from './site/topo.js';
import { iniciarRoda } from './site/roda.js';
import { iniciarTrilho } from './site/trilho.js';
import { iniciarMetodo } from './site/metodo.js';
import { iniciarRevisao } from './site/revisar.js';
import { iniciarCursor } from './site/cursor.js';
import { iniciarSegredo } from './site/segredo.js';
import { iniciarMonte } from './site/monte.js';
import { criarSistema } from './site/sistema.js';
import { iniciarConta } from './site/conta.js';
import { iniciarCasos } from './site/casos.js';
import { iniciarRetrato } from './site/retrato.js';

const { qualidade } = lerAjustes();
const parado = () => document.documentElement.classList.contains('parado');

const rolagem = criarRolagem();
rolagem.parar?.();
window.scrollTo(0, 0);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const som = criarSom();
som.armar();
const ambiente = criarAmbiente(som);
// o ambiente só volta sozinho para quem escolheu: no primeiro gesto
if (ambiente.quer && som.ligado) {
  const umaVez = () => {
    ambiente.tocar(true);
    window.removeEventListener('click', umaVez, true);
  };
  window.addEventListener('click', umaVez, true);
}

const trocas = iniciarTrocas(rolagem);
const revisao = iniciarRevisao({ som });
const materia = criarMateria({ rolagem, som, qualidade });

iniciarTopo(rolagem, { aoCapitulo: (s) => ambiente.carater(s.dataset.tema) });
iniciarRoda(rolagem, { som, parado });
iniciarTrilho(rolagem);
iniciarMetodo(rolagem, { som });
const cursor = iniciarCursor(rolagem, { parado, som });
iniciarSegredo({ materia, som });
iniciarMonte({ materia, som, rolagem, sistema: criarSistema({ materia, som, rolagem }) });
iniciarConta({ materia, som });
iniciarCasos(rolagem);
iniciarRetrato();
iniciarAjustes({
  som,
  ambiente,
  qualidade: materia.qualidade,
  aoMudarTema() {
    trocas.marcar();
    materia.remedir();
  },
  aoMudarQualidade(q) {
    materia.mudarQualidade(q);
    cursor.atualizar();
  },
});

// o visto do botão final se desenha quando a matéria pousa nele
const convite = document.getElementById('convite');
rolagem.aoRolar((y) => {
  const fim = document.documentElement.scrollHeight - window.innerHeight;
  convite?.classList.toggle('aprovado', y > fim - 8);
});

const fontes = document.fonts?.ready ?? Promise.resolve();
const retrato = carregarRetrato('/img/retrato.webp');

iniciarCarregador({
  esperar: [fontes, retrato],
  aoSair() {
    // as fontes mudam a altura dos blocos: remede antes de aparecer
    materia.remedir();
    rolagem.soltar?.();
    materia.abrir();
    revisao.abrirMestre();
    som.pronto();
  },
});
