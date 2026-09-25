// Só as peças do three.js que a matéria usa. O motor importa ESTE arquivo
// sob demanda: assim o empacotador descarta o resto do three (uma importação
// dinâmica de 'three' inteiro traria a biblioteca toda).
//
// Toda peça usada em motor.js (THREE.X) tem de estar aqui. Faltando uma, ela
// chega como undefined e a GPU recusa o buffer sem erro no console — só
// aviso de WebGL, e nenhuma partícula na tela.
export { WebGLRenderer, Scene, OrthographicCamera, BufferGeometry, BufferAttribute, ShaderMaterial, Points, Vector2, Color, DynamicDrawUsage } from 'three';
