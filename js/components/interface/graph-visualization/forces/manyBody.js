import { binarytree } from "d3-binarytree";
import { quadtree } from "d3-quadtree";
import { octree } from "d3-octree";
import constant from "./constant.js";
import jiggle from "./jiggle.js";
import { x, y, z } from "./simulation.js";
// compute electric charge between particles
export default function () {
  var nodes,
    nDim,
    node,
    alpha,
    strength = constant(-30),
    strengths,
    distanceMin2 = 1,
    distanceMax2 = Infinity,
    theta2 = 0.81;

  function force (_) {
    var i,
      n = nodes.length,
      tree
            = (nDim === 1 ? binarytree(nodes, x)
              : (nDim === 2 ? quadtree(nodes, x, y)
                : (nDim === 3 ? octree(nodes, x, y, z)
                  : null
                ))).visitAfter(accumulate);

    for (alpha = _, i = 0; i < n; ++i) {
      node = nodes[i] 
      tree.visit(apply)
    }
  }

  function initialize () {
    if (!nodes) {
      return;
    }
    var i, n = nodes.length, node;
    strengths = new Array(n);
    for (i = 0; i < n; ++i) {
      node = nodes[i]
      strengths[node.index] = +strength(node, i, nodes)
    }
  }

  function accumulate (treeNode) {
    var strength = 0, q, c, weight = 0, x, y, z, i;
    var numChildren = treeNode.length;

    // For internal nodes, accumulate forces from children.
    if (numChildren) {
      for (x = y = z = i = 0; i < numChildren; ++i) {
        if ((q = treeNode[i]) && (c = Math.abs(q.value))) {
          strength += q.value
          weight += c
          x += c * (q.x || 0)
          y += c * (q.y || 0)
          z += c * (q.z || 0)
        }
      }
      strength *= Math.sqrt(4 / numChildren); // scale accumulated strength according to number of dimensions

      treeNode.x = x / weight;
      if (nDim > 1) {
        treeNode.y = y / weight 
      }
      if (nDim > 2) {
        treeNode.z = z / weight 
      }
    } else {
      // For leaf nodes, accumulate forces from coincident nodes.
      q = treeNode;
      q.x = q.data.x;
      if (nDim > 1) {
        q.y = q.data.y; 
      }
      if (nDim > 2) {
        q.z = q.data.z; 
      }
      do {
        strength += strengths[q.data.index];
      }
      // eslint-disable-next-line no-cond-assign
      while (q = q.next);
    }

    treeNode.value = strength;
  }

  function apply (treeNode, x1, arg1, arg2, arg3) {
    if (!treeNode.value) {
      return true;
    }
    
    if (node.defaultX) {
      return true;
    }
    var x2 = [arg1, arg2, arg3][nDim - 1];

    var x = treeNode.x - node.x,
      y = (nDim > 1 ? treeNode.y - node.y : 0),
      z = (nDim > 2 ? treeNode.z - node.z : 0),
      w = x2 - x1,
      l = x * x + y * y + z * z;

    /*
     * Apply the Barnes-Hut approximation if possible.
     * Limit forces for very close nodes; randomize direction if coincident.
     */
    if (w * w / theta2 < l) {
      if (l < distanceMax2) {
        if (x === 0) {
          x = jiggle()
          l += x * x
        }
        if (nDim > 1 && y === 0) {
          y = jiggle()
          l += y * y
        }
        if (nDim > 2 && z === 0) {
          z = jiggle()
          l += z * z
        }
        if (l < distanceMin2) {
          l = Math.sqrt(distanceMin2 * l);
        }
        node.vx += x * treeNode.value * alpha / l;
        if (nDim > 1) {
          node.vy += y * treeNode.value * alpha / l; 
        }
        if (nDim > 2) {
          node.vz += z * treeNode.value * alpha / l; 
        }
      }
      return true;
    } else if (treeNode.length || l >= distanceMax2) {
      // Otherwise, process points directly.
      return;
    }

    // Limit forces for very close nodes; randomize direction if coincident.
    if (treeNode.data !== node || treeNode.next) {
      if (x === 0) {
        x = jiggle()
        l += x * x
      }
      if (nDim > 1 && y === 0) {
        y = jiggle()
        l += y * y
      }
      if (nDim > 2 && z === 0) {
        z = jiggle()
        l += z * z
      }
      if (l < distanceMin2) {
        l = Math.sqrt(distanceMin2 * l);
      }
    }

    do {
      if (treeNode.data !== node) {
        w = strengths[treeNode.data.index] * alpha / l;
        node.vx += x * w;
        if (nDim > 1) {
          node.vy += y * w; 
        }
        if (nDim > 2) {
          node.vz += z * w; 
        }
      }
      // eslint-disable-next-line no-cond-assign
    } while (treeNode = treeNode.next);
  }

  force.initialize = function (initNodes, numDimensions) {
    nodes = initNodes;
    nDim = numDimensions;
    initialize();
  };

  force.strength = function (_) {
    return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
  };

  force.distanceMin = function (_) {
    return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
  };

  force.distanceMax = function (_) {
    return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
  };

  force.theta = function (_) {
    return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
  };

  return force;
}
