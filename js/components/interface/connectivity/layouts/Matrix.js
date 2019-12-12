import * as d3 from "d3";

export class Matrix {
  constructor (connectivity) {
    this.connectivity = connectivity;
  }
  
  draw () {
    const margin = { top: 45, right: 10, bottom: 10, left: 15 };
    const legendWidth = 120;

    const matrixDim = (this.connectivity.innerHeight < (this.connectivity.innerWidth - legendWidth))
      ? (this.connectivity.innerHeight) : (this.connectivity.innerWidth - legendWidth);

    const x = d3.scaleBand().range([0, matrixDim - margin.top]);
    // Opacity
    const z = d3.scaleLinear().domain([0, 4]).clamp(true);
    // Colors
    const c = d3.scaleOrdinal(d3.schemeCategory10);

    const labelTop = margin.top - 25;
    const defaultTooltipText = "Hover the squares to see the connections.";
    const tooltip = this.connectivity.svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + labelTop + ")")
      .append("text")
      .attr('class', 'connectionlabel')
      .text(defaultTooltipText);

    const container = this.connectivity.svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // todo: Continue from here

    // let matrix = [];
    // let nodes = this.connectivity.dataset.nodes;
    // const root = this.connectivity.dataset.root;
    // const n = nodes.length;
    //
    // // Compute index per node.
    // nodes.forEach(function (node, i) {
    //   node.pre_count = 0;
    //   node.post_count = 0;
    //   matrix[i] = d3.range(n).map(function (j) {
    //     return { x: j, y: i, z: 0 };
    //   });
    // });
    //
    // // Convert links to matrix; count pre / post conns.
    // this.connectivity.dataset.links.forEach(function (link) {
    //   /*
    //    * TODO: think about zero weight lines
    //    * matrix[link.source][link.target].z = link.weight ? link.type : 0;
    //    */
    //   matrix[link.source][link.target].z = link.type;
    //   nodes[link.source].pre_count += 1;
    //   nodes[link.target].post_count += 1;
    // });
    //
    // /*
    //  *Sorting matrix entries.
    //  *TODO: runtime specified sorting criteria
    //  */
    // const sortOptions = {
    //   'id': 'By entity name',
    //   'pre_count': 'By # pre',
    //   'post_count': 'By # post'
    // };
    // //  Precompute the orders.
    // const orders = {
    //   id: d3.range(n).sort(function (a, b) {
    //     return d3.ascending(nodes[a].id, nodes[b].id);
    //   }),
    //   pre_count: d3.range(n).sort(function (a, b) {
    //     return nodes[b].pre_count - nodes[a].pre_count;
    //   }),
    //   post_count: d3.range(n).sort(function (a, b) {
    //     return nodes[b].post_count - nodes[a].post_count;
    //   }),
    //   // community: d3.range(n).sort(function(a, b) { return nodes[b].community - nodes[a].community; }),
    // };
    // // Default sort order.
    // x.domain(orders.id);
    //
    // const rect = container
    //   .append("rect")
    //   .attr("class", "background")
    //   .attr("width", matrixDim - margin.left - 30)
    //   .attr("height", matrixDim - margin.top);
    //
    // /*
    //  * we store the 'conn' key in case we want to
    //  * eg. conditionally colour the indicator if there
    //  * are actually connections in that row/column
    //  */
    // const pre = nodes.map(function (x, i) {
    //   return {
    //     id: x.id, conn: matrix[i].filter(function (d) {
    //       return d.z;
    //     }).length > 0
    //   }
    // });
    // const matrixT = matrix[0].map(function (col, i) {
    //   return matrix.map(function (row) {
    //     return row[i];
    //   })
    // });
    // const post = nodes.map(function (x, i) {
    //   return {
    //     id: x.id, conn: matrixT[i].filter(function (d) {
    //       return d.z;
    //     }).length > 0
    //   }
    // });
    //
    // const popNameFromId = function (id) {
    //   return eval(GEPPETTO.ModelFactory.getAllPotentialInstancesEndingWith(id)[0]).getParent().getName();
    // };
    //
    // const mouseoverCell = function (msg) {
    //   d3.select(this.parentNode.appendChild(this)).transition().duration(100).style('stroke-opacity', 1).style('stroke', 'white').style('stroke-width', 2);
    //   d3.select("body").style('cursor', 'pointer');
    //   return tooltip.transition().duration(100).text(msg);
    // };
    //
    // const mouseoutCell = function () {
    //   d3.select(this).transition().duration(100).style('stroke-opacity', 0).style('stroke', 'white');
    //   d3.select("body").style('cursor', 'default');
    //   return tooltip.text(defaultTooltipText);
    // };
    //
    // const popIndicator = function (pos, colormap, w, h) {
    //   return function (d, i) {
    //     d3.select(this).selectAll(".cell")
    //       .data(d)
    //       .enter().append("rect")
    //       .attr("class", "cell")
    //       .attr(pos, function (d, i) {
    //         return x(i);
    //       })
    //       .attr("width", w)
    //       .attr("height", h)
    //       .attr("title", function (d) {
    //         return d.id;
    //       })
    //       .style("fill", function (d) {
    //         return colormap(popNameFromId(d.id));
    //       })
    //       .style("stroke", function (d) {
    //         return colormap(popNameFromId(d.id));
    //       })
    //       .on("mouseover", function (d) {
    //         $.proxy(mouseoverCell, this)(popNameFromId(d.id))
    //       })
    //       .on("mouseout", $.proxy(mouseoutCell))
    //   };
    // };
    //
    // const colormap = this.connectivity.nodeColormap.range ? this.connectivity.nodeColormap : d3.scaleOrdinal(d3.schemeCategory20);
    // const postMargin = parseInt(rect.attr("width")) / pre.length;
    // const preMargin = parseInt(rect.attr("height")) / post.length;
    //
    // const postPop = container.selectAll(".postPop")
    //   .data([post])
    //   .enter()
    //   .append("g")
    //   .attr("class", "postPop")
    //   .attr("transform", "translate(0,-10)")
    //   .each(popIndicator("x", colormap, postMargin, 5));
    // const prePop = container.selectAll(".prePop")
    //   .data([pre])
    //   .enter()
    //   .append("g")
    //   .attr("class", "prePop")
    //   .attr("transform", "translate(-10,0)")
    //   .each(popIndicator("y", colormap, 5, preMargin));
    //
    // const row = container.selectAll(".row")
    //   .data(matrix)
    //   .enter().append("g")
    //   .attr("class", "row")
    //   .attr("transform", function (d, i) {
    //     return "translate(0," + x(i) + ")";
    //   })
    //   .each(row);
    //
    // row.append("line")
    //   .attr("x2", this.connectivity.innerWidth);
    //
    // const column = container.selectAll(".column")
    //   .data(matrix)
    //   .enter().append("g")
    //   .attr("class", "column")
    //   .attr("transform", function (d, i) {
    //     return "translate(" + x(i) + ")rotate(-90)";
    //   });
    //
    // column.append("line")
    //   .attr("x1", -this.connectivity.innerWidth);
    //
    // this.connectivity.createLegend('legend', colormap, { x: matrixDim, y: 0 });
    //
    // // Sorting matrix entries by criteria specified via combobox
    // const orderContainer = this.connectivity.appendTo(this.connectivity.connectivityContainer,
    //   this.connectivity.createElement('div', {
    //     id: this.connectivity.id + '-ordering',
    //     style: 'width:' + legendWidth + 'px;left:' + (matrixDim + this.connectivity.widgetMargin) + 'px;top:' + (matrixDim - 32) + 'px;',
    //     class: 'connectivity-ordering'
    //   }));
    //
    // const orderCombo = this.connectivity.selectElement('select');
    // sortOptions.forEach((k, v) => function (k, v) {
    //   this.connectivity.appendTo(orderCombo, this.connectivity.createElement('option', { value: k, text: v }))
    // });
    //
    // const m = this.connectivity.append(orderContainer, this.connectivity.createElement('span', {
    //   id: 'matrix-sorter',
    //   class: 'connectivity-ordering-label',
    //   text: 'Order by:'
    // }));
    //
    // this.connectivity.append(orderCombo, m)
    
  }
}
