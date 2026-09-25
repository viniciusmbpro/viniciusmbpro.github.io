// Capturas de conferência: abre o site, espera o carregamento e fotografa a
// matéria inteira em cada estação (o meio de cada forma), mais o topo de
// cada seção. Uso:
//   node scripts/capturas.mjs [largura] [altura] [prefixo] [url]
//   node scripts/capturas.mjs 390 844 cel
import { chromium } from 'playwright';
const [largura, altura, pref, url] = [Number(process.argv[2] || 1440), Number(process.argv[3] || 900), process.argv[4] || 'pc', process.argv[5] || 'http://127.0.0.1:5190/'];
const celular = largura < 760;
const pasta = process.env.PASTA || '/tmp/vm';
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: largura, height: altura }, deviceScaleFactor: celular ? 2 : 1, isMobile: celular, hasTouch: celular });
const erros = [];
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
p.on('pageerror', (e) => erros.push(String(e)));
if (process.env.QUALIDADE) await p.addInitScript((q) => localStorage.setItem('vm:qualidade', q), process.env.QUALIDADE);
if (process.env.TEMA) await p.addInitScript((t) => localStorage.setItem('vm:tema', t), process.env.TEMA);
await p.goto(url);
await p.waitForTimeout(500);
await p.screenshot({ path: `${pasta}/${pref}-00-carregando.png` });
await p.waitForSelector('html.carregou', { timeout: 20000 });
await p.waitForTimeout(3200);
await p.screenshot({ path: `${pasta}/${pref}-01-inicio.png` });
const estacoes = await p.evaluate(() => (window.__estacoes ? window.__estacoes() : []));
let n = 2;
for (const [nome, a, b2] of estacoes.slice(1)) {
  const y = Math.round((a + b2) / 2);
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${pasta}/${pref}-${String(n++).padStart(2, '0')}-${nome}.png` });
}
// um instante no meio de uma troca (o voo)
if (estacoes.length > 3) {
  const [, , b1] = estacoes[1];
  const [, a2] = estacoes[2];
  await p.evaluate((y) => window.scrollTo(0, y), Math.round((b1 + a2) / 2));
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${pasta}/${pref}-voo.png` });
}
console.log(JSON.stringify(estacoes));
console.log('erros:', erros.length ? erros : 'nenhum');
await b.close();
