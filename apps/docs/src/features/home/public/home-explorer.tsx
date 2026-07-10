import type { ReactNode } from "react";
import type { FileTreeNode } from "@/features/home/public/home-file-tree";
import { HomeFileTree } from "@/features/home/public/home-file-tree";
import { HomePanel } from "@/features/home/public/home-panel";

interface HomeExplorerProps {
  className?: string;
  footer?: ReactNode;
  nodes: FileTreeNode[];
  title: string;
}

export function HomeExplorer({
  footer,
  nodes,
  title,
  className = "",
}: HomeExplorerProps) {
  return (
    <HomePanel className={className} footer={footer} title={title}>
      <HomeFileTree nodes={nodes} />
    </HomePanel>
  );
}
