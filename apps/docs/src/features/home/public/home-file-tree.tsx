import { ChevronDown, ChevronRight, File, Folder } from "lucide-react";

export type TreeHighlight = "selected" | "bad" | "good" | "dim";
export type TreeGitStatus = "modified" | "added" | "deleted";

export interface FileTreeNode {
  children?: readonly FileTreeNode[];
  comment?: string;
  gitStatus?: TreeGitStatus;
  highlight?: TreeHighlight;
  kind: "folder" | "file";
  name: string;
  open?: boolean;
}

interface HomeFileTreeProps {
  className?: string;
  nodes: readonly FileTreeNode[];
}

const highlightClass: Record<TreeHighlight, string> = {
  bad: "bg-red-500/10 text-red-400",
  dim: "text-fd-muted-foreground/70",
  good: "landing-tone-success-badge",
  selected: "bg-fd-accent text-fd-accent-foreground",
};

const gitStatusNameClass: Record<TreeGitStatus, string> = {
  added: "landing-tone-success",
  deleted: "text-red-400/80 line-through",
  modified: "landing-tone-warning",
};

const gitStatusBadge: Record<TreeGitStatus, string> = {
  added: "A",
  deleted: "D",
  modified: "M",
};

function TreeNode({ depth, node }: { depth: number; node: FileTreeNode }) {
  const Icon = node.kind === "folder" ? Folder : File;
  const Chevron =
    node.kind === "folder" && node.open !== false ? ChevronDown : ChevronRight;
  const rowClass = node.highlight
    ? highlightClass[node.highlight]
    : "text-fd-foreground/90";

  return (
    <>
      <div
        className={`flex items-center gap-1.5 rounded-md py-0.5 pr-2 ${rowClass}`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        {node.kind === "folder" ? (
          <Chevron className="size-3 shrink-0 text-fd-muted-foreground" />
        ) : (
          <span className="size-3 shrink-0" />
        )}
        <Icon
          className={`size-3.5 shrink-0 ${
            node.kind === "folder"
              ? "text-fd-primary/80"
              : "text-fd-muted-foreground"
          }`}
        />
        <span
          className={`truncate ${
            node.gitStatus && !node.highlight
              ? gitStatusNameClass[node.gitStatus]
              : ""
          }`}
        >
          {node.name}
        </span>
        {node.gitStatus ? (
          <span
            className={`ml-auto shrink-0 pl-2 font-medium text-[10px] ${
              gitStatusNameClass[node.gitStatus]
            }`}
          >
            {gitStatusBadge[node.gitStatus]}
          </span>
        ) : null}
        {!node.gitStatus && node.comment ? (
          <span className="ml-auto truncate pl-2 text-[11px] text-fd-muted-foreground">
            {node.comment}
          </span>
        ) : null}
      </div>
      {node.children?.map((child) => (
        <TreeNode
          depth={depth + 1}
          key={`${node.name}/${child.name}`}
          node={child}
        />
      ))}
    </>
  );
}

export function HomeFileTree({ nodes, className = "" }: HomeFileTreeProps) {
  return (
    <div
      className={`space-y-0.5 font-mono text-[13px] leading-snug ${className}`}
    >
      {nodes.map((node) => (
        <TreeNode depth={0} key={node.name} node={node} />
      ))}
    </div>
  );
}
