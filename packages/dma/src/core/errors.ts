export class DmaEnvironmentError extends Error {
  readonly code = "DMA_ENV" as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DmaEnvironmentError";
  }
}
