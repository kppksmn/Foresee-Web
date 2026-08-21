export interface FlatTreeRow<TNode> {
  node: TNode;
  /** Distance from a root node, starting at 0. */
  level: number;
}

/**
 * Flattens a tree into the rows a list renders.
 * `shouldDescend` keeps collapsed branches out of the result.
 */
export function flattenTree<TNode>(
  nodes: readonly TNode[],
  getChildren: (node: TNode) => readonly TNode[],
  shouldDescend?: (node: TNode, level: number) => boolean,
): FlatTreeRow<TNode>[] {
  const rows: FlatTreeRow<TNode>[] = [];

  function visit(currentNodes: readonly TNode[], level: number) {
    for (const node of currentNodes) {
      rows.push({ node, level });

      const children = getChildren(node);
      if (children.length > 0 && (shouldDescend?.(node, level) ?? true)) {
        visit(children, level + 1);
      }
    }
  }

  visit(nodes, 0);

  return rows;
}
