export type InitActionKind = "created" | "skipped" | "appended" | "warned";

export interface InitAction {
  action: InitActionKind;
  note?: string;
  path: string;
}
