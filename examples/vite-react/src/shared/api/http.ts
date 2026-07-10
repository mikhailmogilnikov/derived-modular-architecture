export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const get = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `GET ${url} failed: ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
};
