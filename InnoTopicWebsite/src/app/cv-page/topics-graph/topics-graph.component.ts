import {Component, effect, Input, OnDestroy, OnInit, ViewEncapsulation,} from '@angular/core';
import {recolorSvg} from '@innotopic/topics-ui';
import {onThemeStateChange, themeState} from '@innotopic/theme-ui';
import {topics} from '../../TopicFriendsShared3/topics-core/topics-data';
import {nodeConnections, nodeLinks, preset, sizes, strengths} from "./topics-graph.data";
import {GraphConnections, GraphNode, GraphNodeId, LinkByIds} from "./topics-graph.types";
import {ActivatedRoute} from "@angular/router";
import {color as d3Color} from 'd3-color';
import {drag as d3Drag} from 'd3-drag';
import {forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation} from 'd3-force';
import {event as d3Event, select} from 'd3-selection';
import {zoom as d3Zoom} from 'd3-zoom';
import {FeatureFlagsService} from '../../shared/feature-flags/feature-flags.service';

@Component({
  standalone: true,
  selector: 'app-topics-graph',
  templateUrl: './topics-graph.component.html',
  styleUrls: ['./topics-graph.component.sass'],
  encapsulation: ViewEncapsulation.None,
})
export class TopicsGraphComponent implements OnInit, OnDestroy {

  @Input() connections: GraphConnections = {...nodeConnections};

  public d3Nodes: any[] = [];
  private d3Links: LinkByIds[] = [...nodeLinks];

  /** True once the graph has rendered once, so the flag effect below doesn't fire before there's anything to rebuild. */
  private graphInitialized = false;
  private recolorRequestId = 0;
  private recolorTimer?: ReturnType<typeof setTimeout>;
  private readonly stopThemeSubscriptions = [
    onThemeStateChange('ion_color_primary', () => this.refreshRecoloredIcons()),
    onThemeStateChange('ion_color_secondary', () => this.refreshRecoloredIcons()),
    onThemeStateChange('icon_color_mode', () => this.refreshRecoloredIcons()),
    onThemeStateChange('icon_contrast', () => this.refreshRecoloredIcons()),
    onThemeStateChange('icon_brightness', () => this.refreshRecoloredIcons()),
  ];

  // idea: new/expanding-to topics could be with effect e.g. static noise or fading in-out, e.g. qwik, turbopack; while old, permanently faded
  // TODO: try d3.forceRadial(radius[, x][, y])

  constructor(
    private activatedRoute: ActivatedRoute,
    protected flagsService: FeatureFlagsService,
  ) {
    // Rebuild the (already-fetched) graph whenever the "contain nodes" feature flag is toggled from the popover.
    effect(() => {
      this.flagsService.graphContainer();
      if (this.graphInitialized) {
        this.initD3Graph();
      }
    });
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParams['container']) { // e.g. container=1 - Jay and Samyak this is better than Boolean()
      this.flagsService.graphContainer.set(true);
    }
    // console.log('generateNodes', this.d3Nodes)
    this.generateNodes(this.connections)
    // console.log('d3Nodes', this.d3Nodes)
    this.generateLinks(this.connections)
    this.fetchIcons() // this inits graph when finished
  }

  private refreshRecoloredIcons() {
    if (!this.graphInitialized) return;
    clearTimeout(this.recolorTimer);
    // A slider dispatches an input event for every thumb position. Submit only the settled value
    // so graph-wide conversion does not enqueue a complete stale pass for every one of them.
    this.recolorTimer = setTimeout(() => void this.fetchIcons(), 120);
  }

  private async fetchIcons() {
    const requestId = ++this.recolorRequestId;
    const topicNodes = this.d3Nodes.map(d3Node => {
      let topicId = d3Node.id;
      const topic = (topics as any)[topicId]
      if (!topic) {
        console.error('No topic for graph node id:', topicId)
      }
      return topic
    })

    const recoloredIcons = await Promise.all(topicNodes.map(async (topic: any) => {
      if (!topic?.logo) return undefined;
      return recolorSvg(topic.logo, {
        primaryColor: themeState.ion_color_primary,
        colorMode: themeState.icon_color_mode,
        secondaryColor: themeState.ion_color_secondary,
        contrast: themeState.icon_contrast,
        brightness: themeState.icon_brightness,
        primaryContrast: themeState.icon_contrast,
      });
    }));

    // Slider input can queue another recoloring batch before this one finishes. Render only the
    // latest palette, so an older worker response cannot flash back into the graph.
    if (requestId !== this.recolorRequestId) return;

    recoloredIcons.forEach((text, i) => {
      const topic = topicNodes[i];
      const d3Node = this.d3Nodes.find(n => n.id === topic?.name);
      if (d3Node && text) {
        d3Node.body = text.trim().substring(text.indexOf('<svg'));
      }
    });
    this.initD3Graph();
    this.graphInitialized = true;

  }

  ngOnDestroy() {
    clearTimeout(this.recolorTimer);
    this.stopThemeSubscriptions.forEach(unsubscribe => unsubscribe());
  }

  private initD3Graph() {

    const self = this;
    const svgRootElement: any = select("#topics-graph-d3"),
      width = +svgRootElement.attr("width"),
      height = +svgRootElement.attr("height");

    svgRootElement.selectAll('*').remove(); // remove all previous elements before rendering graph

    const svg = svgRootElement.append("g"); /* actually a <g>, to fix transform not working in <svg> on chrome:
        http://stackoverflow.com/questions/27283610/d3-workaround-for-svg-transform-in-chrome */

    // svgRootElement.call(zoom1.transform, d3.zoomIdentity
    //   .translate(150, 100)
    //   .scale(2))
    // svg.call(d3.zoom().transform, d3.zoomIdentity.translate(1050, 50)
    //   .scale(130.5));
    // const zoom = d3.zoom()
    //   .scaleExtent([0.5, 5])
    //   .on("zoom", function() {
    //     svg.attr("transform", d3.event.transform);
    //   });
    // svg.call(zoom.transform, d3.zoomIdentity.scale(1)); // This sets the initial zoom level to 1

    if (preset.allowZoom) {
      const wheelZoomSpeed = 10;
      const zoom = d3Zoom<any, any>()
        .wheelDelta(function () {
          const event = d3Event;
          const deltaModeScale = event.deltaMode ? 120 : 1;

          return -event.deltaY * deltaModeScale / 500 * wheelZoomSpeed;
        })
        .filter(function () {
          const event = d3Event;

          if (!event) {
            return true;
          }

          if (event.type === 'wheel') {
            return event.ctrlKey || event.metaKey;
          }

          return event.type !== 'dblclick' && !event.button;
        })
        .on("zoom", function () {
        // https://www.geeksforgeeks.org/d3-js-transform-scale-function/
        // console.log('transform d3.event.transform', d3.event.transform)
        svg.attr("transform", d3Event.transform) // TODO: I could hack the default zoom level here??
        // svg.attr("transform", {k: 0.6087830093314941, x: 176.23706425069088, y: 116.76122945091723})
        // svg.attr("transform", d3.transform({k: 0.6087830093314941, x: 176.23706425069088, y: 116.76122945091723}))
      });

      svgRootElement.call(zoom);
      svgRootElement.on("dblclick.zoom", null);
    }

    // var color = d3.scaleOrdinal(d3.schemeCategory20);
    // const color = d3.rgb(230, 230, 230, 128);
    // const color = d3.rgb(80, 80, 80)// .copy({opacity: 0.5});
    const color = d3Color(`rgba(80, 80, 80, 0.5)`) // .copy({opacity: 0.5});

    /* Base Example: Force-Directed Graph: https://bl.ocks.org/mbostock/4062045 */
    const simulation: any = forceSimulation<any>();
      if(this.flagsService.graphContainer()) {
        simulation.nodes(this.d3Nodes)
          .force("link", forceLink<any, any>().id(function(d: any) { return d.id; })
            .strength(function(d: any) {
              return preset.forceLinkStrength * (d.strengthMul ?? 1)
            })
          )
          .force("charge", forceManyBody<any>().strength(function(d: GraphNode) {
            const size = d.sizeMult ?? sizes.medium;
            return size**1.5 * preset.forceManyBodyStrength / 1
          }))
          .force("center", forceCenter(width / 2, height / 2))
          .force("collide", forceCollide<any>().radius(function(d: any) {
            return d.sizeMult ? d.sizeMult * 30 : 30; // Adjust the radius as needed
          }));
      } else {
      // .force("gravity", 3)
      // .velocityDecay(3)
      simulation.force("link", forceLink<any, any>().id(function(d: any) { return d.id; })
        .strength(function(d: any) {
          if (d.strengthMul) {
            // console.log('d.strengthMul', d.strengthMul)
          }
          // return preset.forceLinkStrength;
          // return 1 / Math.min(count(link.source), count(link.target));
          return preset.forceLinkStrength * (d.strengthMul ?? 1)
        }))
        .force("charge", forceManyBody<any>().strength(function(d: GraphNode) {
          const size = d.sizeMult ?? sizes.medium;
          // return preset.forceManyBodyStrength
          // return size**5 * preset.forceManyBodyStrength / 3
          // return size**10 * preset.forceManyBodyStrength / 100 // this was kinda working
          return size ** 1.5 * preset.forceManyBodyStrength / 1 // this was kinda working
          // return size * 1000000
        }))
        .force("center", forceCenter(width / 2, height / 2));
        // simulation.force("charge", function() {
        ////        return (d.sizeMult ? d.sizeMult : 1) * 100 }
        //            return -1000000;
        //        })
      }

    const nodes = {};
    const nodesKeys = Object.keys(nodes);
    const nodesArray = nodesKeys.map(function(v) { return (nodes as any)[v]; });

    // initial xy: https://observablehq.com/@d3/force-layout-phyllotaxis

    const graph = {
      nodes: this.d3Nodes,
      links: this.d3Links
    };

    // const allLinksGroup = svg.append("g")
    //   .attr("class", "links")
    //   .selectAll("line")
    //   .data(graph.links)
    //   .enter().append("line")
    //   .attr("stroke-width", function(d: any) {
    //     return 5; // Math.sqrt(d.thick == null ? 10 : d.thick );
    //   });

    const allNodesGroup = svg.append("g") /* Group that contains all nodes */
      .attr("class", "nodes")
      .selectAll(".node")
      .data(graph.nodes)
      .enter();

    const perNodeMainGroup = allNodesGroup.append("g") /* top-level group of a node which will include the circle and icon */
      .attr("class", "node");

    allNodesGroup.selectAll(".techCircleOverlay")
      .data(graph.nodes)

    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links)
      .distance(function(link: any) {
        //        return link.graph === 0 ? height/2 : height/4;
        const multip = link.distance == null ? 0.7 : link.distance;
        return multip * 70;
      });

    const defaultRadius = 23;
    let isDragging = false;

    const radiusFunc = function(d: any) {
      return d.sizeMult ? d.sizeMult * defaultRadius : defaultRadius
    };

    const radiusFuncRect = function(d: any) {
      return radiusFunc(d) * 2;
    }
    const nodeCircle = perNodeMainGroup.append("circle")
      .attr("class", function(d: any) {
        return d.id + '_background' + ' circleBg' + ' techCircle' // FIXME: check, it was not returning value
      } )
      .attr("r", radiusFunc )
      .attr("id2", function(d: any) { return d.id } )
      .attr("id", function(d: any) { return d.id } )
      .attr("fill", function(d: any) { return color });

    const foreignObjectW = 100; // foreign object width
    const foreignObjectH = 50;
    const defaultSize = 30;

    perNodeMainGroup.append("g").html(function(d: any) {
      const bodyText = d.body || "";
      const size = d.sizeMult ? d.sizeMult * defaultSize
        : defaultSize;

      if (bodyText.trim().endsWith("</svg>")) {
        const htmlContent = '<svg '
          + 'width=\"'  + size + 'px\" '
          + 'height=\"' + size + 'px\" '
          + 'x="' + (-size / 2) + '" '
          + 'y="' + (-size / 2) + '" '
          + bodyText /* also contains </svg> */;
        return htmlContent;
      } else {
        return "";
      }
    });

    perNodeMainGroup.append("foreignObject")
      .attr("style", "pointer-events:none;")
      .attr("width", foreignObjectW)
      .attr("height", foreignObjectH)
      .attr("height", foreignObjectH)
      .attr("x", -foreignObjectW / 2)
      .attr("y", -foreignObjectH / 2)
      .style("font", "9px 'Helvetica Neue'")
      .html(function(d: any) {
        if ( d.body ) {
          return ""; // has icon: no need for text
        }
        const bodyText = d.html || d.id;
        return "<div style='display: table;" +
          "text-align:center;" +
          "height:100%; width:100%'>" +
          "<p style='display: table-cell; " +
          "vertical-align: middle'>" +
          bodyText + "</p></div>";
      });

    function unHighlightHover(d?: any) {
      document.querySelectorAll('.techCircleHover').forEach((element) => {
        element.classList.remove("techCircleHover");
      });
    }

    /* need to set the overlay's position separately in root,
       because of jerky movement issue with drag&drop and "translate(...)" transform
    */
    const nodeCircleOverlay = allNodesGroup
      .append("rect")
      //        .attr("r", radiusFunc)
      .attr("width", radiusFuncRect)
      .attr("height", radiusFuncRect)
      .attr("rx", radiusFunc)
      .attr("ry", radiusFunc)
      //        .attr("x", 0)
      //        .attr("x", -defaultRadius)
      //        .attr("y", 0)
      //        .attr("y", -defaultRadius)
      .classed("techCircleOverlay", true);

    nodeCircleOverlay
      .on("mouseover", function (this: any, d: any) {
        if (!isDragging) {
          // $('tech').hover(function() {
          document.getElementById(d.id)?.classList.add("techCircleHover");
          // $("[id2='"+ d.id + "']").css('background-color','rgba(0, 0, 0, 0.6)');
          Array.from(document.getElementsByClassName(d.id + '_background')).forEach((element) => {
            (element as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
          });
          select(this).classed("techCircleHover", true); // "#fff8ee00"
        }
      })
      .on("mouseout", function (this: any, d: any) {
        if (!isDragging) { /* While dragging, the highlight shall stay */
          unHighlightHover.call(this, d);
        }
      });

    nodeCircleOverlay.call(
      d3Drag<any, any>()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    );

    const titleFunc = function(d: any) { return d.id; };
    nodeCircle.append("title")
      .text(titleFunc);
    nodeCircleOverlay.append("title")
      .text(titleFunc);

    // Extra slack beyond each circle's own radius when clamping to the SVG bounds, so the
    // stroke/anti-aliasing at the very edge of a node doesn't get visually cut off by the viewBox.
    const boundaryPadding = 4;

    function ticked() {
      // allLinksGroup
      //   .attr("x1", function(d: any) { return d.source.x; })
      //   .attr("y1", function(d: any) { return d.source.y; })
      //   .attr("x2", function(d: any) { return d.target.x; })
      //   .attr("y2", function(d: any) { return d.target.y; });
      if(self.flagsService.graphContainer()) {
        perNodeMainGroup
          .attr("cx", function(d: any) { return d.x = Math.max(radiusFunc(d) + boundaryPadding, Math.min(width - radiusFunc(d) - boundaryPadding, d.x)); })
          .attr("cy", function(d: any) { return d.y = Math.max(radiusFunc(d) + boundaryPadding, Math.min(height - radiusFunc(d) - boundaryPadding, d.y)); });
      } else {
        perNodeMainGroup
          .attr("x", function(d: any) { return (d.x - radiusFunc(d) ); })
          .attr("y", function(d: any) { return (d.y - radiusFunc(d) ); });
      }
      nodeCircleOverlay /* need to set position separately, because of issue with drag&drop and "translate(...)" transform */
        .attr("x", function(d: any) { return (d.fx || d.x) - radiusFunc(d); })
        .attr("y", function(d: any) { return (d.fy || d.y) - radiusFunc(d); });
      perNodeMainGroup.attr("transform", function(d: any) {
        // return "translate(" + (d.x + radiusFunc(d) / 2) + "," + (d.y + radiusFunc(d) / 2) + ")";
        return "translate(" + (d.x) + "," + (d.y) + ")";
      });
    }

    function dragStarted(d: any) {
      isDragging = true;
      if (!d3Event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      isDragging = true; // just in case...
      d.fx = d3Event.x;
      d.fy = d3Event.y;
    }

    function dragEnded(d: any) {
      isDragging = false;
      unHighlightHover()

      if (!d3Event.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }

  }

  private generateNodes(connections: GraphConnections) {
    const nodes = []
    nodes.push(... Object.keys(connections).map(key => {
      const child = (connections as any)[key]
      const childConnections = child.connections
      if ( childConnections ) {
        this.generateNodes(childConnections)
      }
      return {
        id: key,
        ... child /* TODO keep in mind that I might be mixing connection and note attrs here; so maybe smth like: 'connection: xyz' */,
      }
    }))
    this.d3Nodes.push(...nodes)
  }

  private generateLinks(connections: GraphConnections) {
    Object.keys(connections).map(sourceId => {
      const child = (connections as any)[sourceId]
      const childConnections = child.connections
      if ( childConnections ) {
        this.generateLinks(childConnections)
      }
      const nestedConnections = (connections as any)[sourceId].connections || {}
      const links: LinkByIds[] = Object.keys(nestedConnections).map(
        key => {
          const d3Link: LinkByIds = {
            source: sourceId as GraphNodeId,
            target: key as GraphNodeId,
            strengthMul: nestedConnections[key].strengthMul,
          }
          return d3Link
        }
      );
      this.d3Links.push(
        ...links
      )
    })
    // console.log(`links`, this.d3Links)
  }
}
