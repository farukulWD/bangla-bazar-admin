import type { CategoryNode } from "@/store/api/category/types";

export type FlatCategory = {
  node: CategoryNode;
  depth: number;
};

export const flattenTree = (
  tree: CategoryNode[],
  depth = 0,
): FlatCategory[] =>
  tree.flatMap((node) => [
    { node, depth },
    ...flattenTree(node.children, depth + 1),
  ]);

export const findPath = (
  tree: CategoryNode[],
  id: string,
): CategoryNode[] => {
  for (const node of tree) {
    if (node._id === id) return [node];
    const path = findPath(node.children, id);
    if (path.length) return [node, ...path];
  }
  return [];
};

export const collectBranchIds = (
  tree: CategoryNode[],
  rootIds: Iterable<string>,
): Set<string> => {
  const roots = new Set(rootIds);
  const collected = new Set<string>();

  const walk = (nodes: CategoryNode[], inside: boolean) => {
    nodes.forEach((node) => {
      const included = inside || roots.has(node._id);
      if (included) collected.add(node._id);
      walk(node.children, included);
    });
  };

  walk(tree, false);
  return collected;
};

export const countDescendants = (node: CategoryNode): number =>
  node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);
