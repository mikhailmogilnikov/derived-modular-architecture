export class DmaEnvironmentError extends Error {
  readonly code = "DMA_ENV" as const;

  constructor(message: string) {
    super(message);
    this.name = "DmaEnvironmentError";
  }
}
