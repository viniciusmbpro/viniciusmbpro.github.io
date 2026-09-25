import { defineConfig } from 'vite';
import { cpSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// O que o site novo NÃO processa, mas tem de continuar publicado exatamente
// como está: o domínio, a página de negociação (com o css/ e o js/ dela) e
// os ícones antigos que ela usa. Vão para dist/ tal e qual.
const PRESERVAR = ['CNAME', 'negotiation-helper.html', 'css', 'js', 'img'];

function preservar() {
  return {
    name: 'preservar-arquivos',
    apply: 'build',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist');
      for (const item of PRESERVAR) {
        const de = resolve(import.meta.dirname, item);
        if (existsSync(de)) cpSync(de, resolve(dist, item), { recursive: true });
      }
      // o GitHub Pages não deve passar o site pelo Jekyll
      writeFileSync(resolve(dist, '.nojekyll'), '');
    },
  };
}

// A VERSÃO NO AR. Localmente o site tem as duas paletas e a escolha no painel;
// no ar vai só a clássica (verde e azul-marinho), fixa, sem a escolha. E as
// marcações [CONFIRMAR] — que são perguntas para o dono revisar — não vão
// para o ar: o build tira cada <mark class="confirmar"> com o que há dentro.
const PALETA_NO_AR = 'classica';

function versaoNoAr() {
  return {
    name: 'versao-no-ar',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<html lang="pt-BR" class="sem-js">', `<html lang="pt-BR" class="sem-js" data-paleta="${PALETA_NO_AR}" data-paleta-fixa>`)
          .replace(/\s*<!-- paleta:inicio[\s\S]*?<!-- paleta:fim -->/, '')
          .replace(/\s*<mark class="confirmar">[\s\S]*?<\/mark>/g, '')
          .replace('<meta name="theme-color" content="#100f0d" />', '<meta name="theme-color" content="#0e2a52" />')
          .replaceAll('/img/favicon.svg', '/img/favicon-classica.svg')
          .replaceAll('/img/favicon-32.png', '/img/favicon-classica-32.png')
          .replaceAll('/img/favicon-180.png', '/img/favicon-classica-180.png')
          .replaceAll('https://viniciusmarques.dev/og.png', 'https://viniciusmarques.dev/og-classica.png')
          .replace('O visto em vermelhão sobre fundo carvão', 'O visto em verde sobre fundo azul-marinho');
      },
    },
  };
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 600,
    // o three.js vai num pedaço separado: o texto aparece antes do 3D
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
  plugins: [versaoNoAr(), preservar()],
});
