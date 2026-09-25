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
  plugins: [preservar()],
});
