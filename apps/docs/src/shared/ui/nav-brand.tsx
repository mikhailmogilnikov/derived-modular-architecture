import { Layers } from "lucide-react";

export function NavBrand({ name }: { name: string }) {
  return (
    <>
      <Layers aria-hidden className="size-4 shrink-0" />
      {name}
    </>
  );
}
