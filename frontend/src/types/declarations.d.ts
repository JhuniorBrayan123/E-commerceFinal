// src/declarations.d.ts

// 1. Declaración para archivos CSS
// Esto le dice a TypeScript que cualquier importación que termine en '.css'
// debe ser tratada como un módulo, resolviendo el error de importación.
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// 2. (Opcional) Declaración para imágenes y otros assets (si los importas directamente)
declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  const value: any;
  export default value;
}
