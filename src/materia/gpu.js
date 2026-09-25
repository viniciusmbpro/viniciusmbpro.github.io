// Só as peças do three.js que a matéria usa. O motor importa ESTE arquivo
// sob demanda: assim o empacotador consegue descartar o resto do three
// (uma importação dinâmica de 'three' inteiro traria a biblioteca toda).
export { WebGLRenderer, Scene, OrthographicCamera, BufferGeometry, BufferAttribute, ShaderMaterial, Points, Vector2, Color } from 'three';
