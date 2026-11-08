/** Public interface of the dependency-free component supplied in the archive. */
export class ChromeSculpture extends HTMLElement {
  setTarget(x: number, y: number): void;
  reset(): void;
}
