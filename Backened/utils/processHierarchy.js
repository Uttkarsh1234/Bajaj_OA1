function processHierarchy(data) {

  const invalid_entries = [];

  const duplicate_edges = [];

  const graph = {};

  const reverseGraph = {};

  const allNodes = new Set();

  const childNodes = new Set();

  const seenEdges = new Set();

  const duplicateRecorded = new Set();

  const childParentMap = {};



  // ---------------- PARSE INPUT ----------------

  for (let edge of data) {

    edge = edge.trim();



    if (edge === "") {

      invalid_entries.push(edge);

      continue;

    }



    const regex = /^[A-Z]->[A-Z]$/;



    if (!regex.test(edge)) {

      invalid_entries.push(edge);

      continue;

    }



    const [parent, child] = edge.split("->");



    // self loop

    if (parent === child) {

      invalid_entries.push(edge);

      continue;

    }



    // duplicate

    if (seenEdges.has(edge)) {



      if (!duplicateRecorded.has(edge)) {

        duplicate_edges.push(edge);

        duplicateRecorded.add(edge);

      }



      continue;

    }



    seenEdges.add(edge);



    // multi-parent

    if (childParentMap[child]) {

      continue;

    }



    childParentMap[child] = parent;



    // initialize



    if (!graph[parent])

      graph[parent] = [];



    if (!graph[child])

      graph[child] = [];



    if (!reverseGraph[parent])

      reverseGraph[parent] = [];



    if (!reverseGraph[child])

      reverseGraph[child] = [];



    graph[parent].push(child);



    reverseGraph[child].push(parent);



    allNodes.add(parent);

    allNodes.add(child);



    childNodes.add(child);

  }



  // ---------- FIND COMPONENTS ----------



  const visited = new Set();

  const groups = [];



  function dfsComponent(node, component) {



    visited.add(node);



    component.add(node);



    // children



    for (let child of graph[node]) {



      if (!visited.has(child)) {



        dfsComponent(child, component);

      }

    }



    // parents



    for (let parent of reverseGraph[node]) {



      if (!visited.has(parent)) {



        dfsComponent(parent, component);

      }

    }

  }



  for (let node of allNodes) {



    if (!visited.has(node)) {



      const component = new Set();



      dfsComponent(node, component);



      groups.push(component);

    }

  }



  // ---------- PROCESS GROUPS ----------



  const hierarchies = [];



  let total_trees = 0;

  let total_cycles = 0;



  let largest_depth = 0;

  let largest_tree_root = "";



  for (let component of groups) {



    const nodes = [...component];



    // root



    let roots = nodes.filter(

      node => !childNodes.has(node)

    );



    let root;



    if (roots.length > 0) {

      root = roots.sort()[0];

    }

    else {

      root = nodes.sort()[0];

    }



    // ---------- cycle detection ----------



    let hasCycle = false;



    const cycleVisited = new Set();

    const recursionStack = new Set();



    function detectCycle(node) {



      cycleVisited.add(node);



      recursionStack.add(node);



      for (let child of graph[node]) {



        if (!component.has(child))

          continue;



        if (!cycleVisited.has(child)) {



          if (detectCycle(child))

            return true;

        }



        else if (

          recursionStack.has(child)

        ) {



          return true;

        }

      }



      recursionStack.delete(node);



      return false;

    }



    for (let node of component) {



      if (

        !cycleVisited.has(node)

      ) {



        if (detectCycle(node)) {



          hasCycle = true;

          break;

        }

      }

    }



    // ---------- cyclic group ----------



    if (hasCycle) {



      total_cycles++;



      hierarchies.push({

        root,



        tree: {},



        has_cycle: true

      });



      continue;

    }



    // ---------- build tree ----------



    function buildTree(node) {



      let tree = {};



      for (

        let child of graph[node]

      ) {



        tree[child] = buildTree(child);

      }



      return tree;

    }



    // ---------- depth ----------



    function getDepth(node) {



      if (

        graph[node].length === 0

      ) {



        return 1;

      }



      let maxDepth = 0;



      for (

        let child of graph[node]

      ) {



        maxDepth = Math.max(

          maxDepth,

          getDepth(child)

        );

      }



      return maxDepth + 1;

    }



    const depth = getDepth(root);



    total_trees++;



    if (

      depth > largest_depth ||

      (

        depth === largest_depth &&

        root < largest_tree_root

      )

    ) {



      largest_depth = depth;



      largest_tree_root = root;

    }



    hierarchies.push({



      root,



      tree: {

        [root]: buildTree(root)

      },



      depth

    });

  }



  return {



    hierarchies,



    invalid_entries,



    duplicate_edges,



    summary: {



      total_trees,



      total_cycles,



      largest_tree_root

    }

  };

}

module.exports = processHierarchy;