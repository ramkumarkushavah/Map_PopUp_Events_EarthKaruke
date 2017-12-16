import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import * as ol from 'openlayers';
declare let $, ContextMenu, geojsonvt, jsPDF, d3;
@Component({
  selector: 'app-earthquake',
  templateUrl: './earthquake.component.html',
  styleUrls: ['./earthquake.component.css']
})
export class EarthquakeComponent {

  constructor(private sanitizer: DomSanitizer){}
  public resJsonResponse = new Array();
  public downloadJsonHref;

  ngOnInit() {
  }

  generateDownloadJsonUri(featurename, coor) {
    
                var geojsonFeature = {
                  "type": "Feature",
                  "properties": {
                      "name": featurename
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": coor
                  }
              };
              this.resJsonResponse.push(geojsonFeature);
          }
  onDownload()
  {
    var theJSON = JSON.stringify(this.resJsonResponse);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
  }







  ngAfterViewInit() {




    var styleCache = {};
    var styleFunction = function(feature) {
      // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
      // standards-violating <magnitude> tag in each Placemark.  We extract it from
      // the Placemark's name instead.
      var name = feature.get('name');
      var magnitude = parseFloat(name.substr(2));
      var radius = 5 + 20 * (magnitude - 5);
      var style = styleCache[radius];
      if (!style) {
        style = new ol.style.Style({
          image: new ol.style.Circle({
            radius: radius,
            fill: new ol.style.Fill({
              color: 'rgba(255, 153, 0, 0.4)'
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(255, 204, 0, 0.2)',
              width: 1
            })
          })
        });
        styleCache[radius] = style;
      }
      return style;
    };

    var earthquakevector = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: 'https://openlayers.org/en/v4.6.4/examples/data/kml/2012_Earthquakes_Mag5.kml',
        format: new ol.format.KML({
          extractStyles: false
        })
      }),
      style: styleFunction
    });

    var raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });













    







    var raster = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    var format = new ol.format.WKT();
    var feature = format.readFeature(
        'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
            '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
            '-39.1552734375, 10.689697265625 -25.0927734375))');
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    var vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [feature]
      })
    });

    





















    var map = new ol.Map({
      layers: [raster, earthquakevector, vector],
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });























    var dims = {
      a0: [1189, 841],
      a1: [841, 594],
      a2: [594, 420],
      a3: [420, 297],
      a4: [297, 210],
      a5: [210, 148]
    };

    var loading = 0;
    var loaded = 0;

    var exportButton = <HTMLButtonElement>document.getElementById('export-pdf');

    exportButton.addEventListener('click', function() {

      exportButton.disabled = true;
      document.body.style.cursor = 'progress';

      var format = (<HTMLInputElement>document.getElementById('format')).value;
      var resolution = parseFloat((<HTMLInputElement>document.getElementById('resolution')).value);
      var dim = dims[format];
      var width = Math.round(dim[0] * resolution / 25.4);
      var height = Math.round(dim[1] * resolution / 25.4);
      var size = /** @type {ol.Size} */ (map.getSize());
      var extent = map.getView().calculateExtent(size);

      var source = raster.getSource();

      var tileLoadStart = function() {
        ++loading;
      };

      var tileLoadEnd = function() {
        ++loaded;
        if (loading === loaded) {
          var canvas = this;
          window.setTimeout(function() {
            loading = 0;
            loaded = 0;
            var data = canvas.toDataURL('image/png');
            var pdf = new jsPDF('landscape', undefined, format);
            pdf.addImage(data, 'JPEG', 0, 0, dim[0], dim[1]);
            pdf.save('map.pdf');
            source.un('tileloadstart', tileLoadStart);
            source.un('tileloadend', tileLoadEnd, canvas);
            source.un('tileloaderror', tileLoadEnd, canvas);
            map.setSize(size);
            map.getView().fit(extent);
            map.renderSync();
            exportButton.disabled = false;
            document.body.style.cursor = 'auto';
          }, 100);
        }
      };

      map.once('postcompose', function(event) {
        source.on('tileloadstart', tileLoadStart);
        source.on('tileloadend', tileLoadEnd, event.context.canvas);
        source.on('tileloaderror', tileLoadEnd, event.context.canvas);
      });

      map.setSize([width, height]);
      map.getView().fit(extent);
      map.renderSync();

    }, false);























    var info = $('#info');
    info.tooltip({
      animation: false,
      trigger: 'manual'
    });

    var displayFeatureInfo = (pixel, evt?, coor?) => {
      info.css({
        left: pixel[0] + 'px',
        top: (pixel[1] - 15) + 'px'
      });
      var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
       
        return feature;

      });
      if (feature) {
        info.tooltip('hide')
            .attr('data-original-title', evt ? feature.get('name') + ", "+ evt.coordinate : feature.get('name'))
            .tooltip('fixTitle')
            .tooltip('show');


        
          if(evt.type == "dblclick")
          {   
            info.tooltip('hide');
            $('.ui.modal')
            .modal({
              inverted: true
            }).css({
              'margin' : '10px',
              'position' : 'fixed',
              'top' : '0',
              'bottom' : '0',
              'left' : '0',
              'right' : '0',
              'width' : 'auto',
              'height' : '500px'
          })
            .modal('show')
            // .modal({
            //   selector: {
            //     close: '.close.icon'
            //   }
            // });
            $('.custom.letters').text(feature.get('name')+" and \n"+coor);
            return feature.get('name');

          }

      } else {
        info.tooltip('hide');
      }
      
    };

    map.on('pointermove', function(evt) {
      if (evt.dragging) {
        info.tooltip('hide');
        return;
      }
      displayFeatureInfo(map.getEventPixel(evt.originalEvent),evt.originalEvent);
    });

    map.on('click', function(evt) {
      displayFeatureInfo(evt.pixel, evt);
      console.log("click");


      
    
    });

    map.on('dblclick', (evt) => {
      var coor = evt.coordinate;
      var featurename = displayFeatureInfo(evt.pixel, evt , coor);
  
    this.generateDownloadJsonUri(featurename, coor);
    this.chartd3method();
    });



    //context menu

    var contextmenu_items = [
      {
          text: 'Click to open popup',
          classname: 'bold',
          icon: '../../assets/details-popup.png',
          callback: popup
      },

      '-' // this is a separator
  ];

  function popup(obj)
  {
    displayFeatureInfo(obj.pixels, obj.originalEvent, obj.coordinate);
  }


    var contextmenu1 = new ContextMenu({
      width: 180,
      items: contextmenu_items
    });
    map.addControl(contextmenu1);



    
  }




  chartd3method()
  {
    function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
      var legendWidth  = 200,
          legendHeight = 100;
    
      // clipping to make sure nothing appears behind legend
      svg.append('clipPath')
        .attr('id', 'axes-clip')
        .append('polygon')
          .attr('points', (-margin.left)                 + ',' + (-margin.top)                 + ' ' +
                          (chartWidth - legendWidth - 1) + ',' + (-margin.top)                 + ' ' +
                          (chartWidth - legendWidth - 1) + ',' + legendHeight                  + ' ' +
                          (chartWidth + margin.right)    + ',' + legendHeight                  + ' ' +
                          (chartWidth + margin.right)    + ',' + (chartHeight + margin.bottom) + ' ' +
                          (-margin.left)                 + ',' + (chartHeight + margin.bottom));
    
      var axes = svg.append('g')
        .attr('clip-path', 'url(#axes-clip)');
    
      axes.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + chartHeight + ')')
        .call(xAxis);
    
      axes.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Time (s)');
    
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');
    
      legend.append('rect')
        .attr('class', 'legend-bg')
        .attr('width',  legendWidth)
        .attr('height', legendHeight);
    
      legend.append('rect')
        .attr('class', 'outer')
        .attr('width',  75)
        .attr('height', 20)
        .attr('x', 10)
        .attr('y', 10);
    
      legend.append('text')
        .attr('x', 115)
        .attr('y', 25)
        .text('5% - 95%');
    
      legend.append('rect')
        .attr('class', 'inner')
        .attr('width',  75)
        .attr('height', 20)
        .attr('x', 10)
        .attr('y', 40);
    
      legend.append('text')
        .attr('x', 115)
        .attr('y', 55)
        .text('25% - 75%');
    
      legend.append('path')
        .attr('class', 'median-line')
        .attr('d', 'M10,80L85,80');
    
      legend.append('text')
        .attr('x', 115)
        .attr('y', 85)
        .text('Median');
    }
    
    function drawPaths (svg, data, x, y) {
      var upperOuterArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct95); })
        .y1(function (d) { return y(d.pct75); });
    
      var upperInnerArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct75); })
        .y1(function (d) { return y(d.pct50); });
    
      var medianLine = d3.svg.line()
        .interpolate('basis')
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.pct50); });
    
      var lowerInnerArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct50); })
        .y1(function (d) { return y(d.pct25); });
    
      var lowerOuterArea = d3.svg.area()
        .interpolate('basis')
        .x (function (d) { return x(d.date) || 1; })
        .y0(function (d) { return y(d.pct25); })
        .y1(function (d) { return y(d.pct05); });
    
      svg.datum(data);
    
      svg.append('path')
        .attr('class', 'area upper outer')
        .attr('d', upperOuterArea)
        .attr('clip-path', 'url(#rect-clip)');
    
      svg.append('path')
        .attr('class', 'area lower outer')
        .attr('d', lowerOuterArea)
        .attr('clip-path', 'url(#rect-clip)');
    
      svg.append('path')
        .attr('class', 'area upper inner')
        .attr('d', upperInnerArea)
        .attr('clip-path', 'url(#rect-clip)');
    
      svg.append('path')
        .attr('class', 'area lower inner')
        .attr('d', lowerInnerArea)
        .attr('clip-path', 'url(#rect-clip)');
    
      svg.append('path')
        .attr('class', 'median-line')
        .attr('d', medianLine)
        .attr('clip-path', 'url(#rect-clip)');
    }
    
    function addMarker (marker, svg, chartHeight, x) {
      var radius = 32,
          xPos = x(marker.date) - radius - 3,
          yPosStart = chartHeight - radius - 3,
          yPosEnd = (marker.type === 'Client' ? 80 : 160) + radius - 3;
    
      var markerG = svg.append('g')
        .attr('class', 'marker '+marker.type.toLowerCase())
        .attr('transform', 'translate(' + xPos + ', ' + yPosStart + ')')
        .attr('opacity', 0);
    
      markerG.transition()
        .duration(1000)
        .attr('transform', 'translate(' + xPos + ', ' + yPosEnd + ')')
        .attr('opacity', 1);
    
      markerG.append('path')
        .attr('d', 'M' + radius + ',' + (chartHeight-yPosStart) + 'L' + radius + ',' + (chartHeight-yPosStart))
        .transition()
          .duration(1000)
          .attr('d', 'M' + radius + ',' + (chartHeight-yPosEnd) + 'L' + radius + ',' + (radius*2));
    
      markerG.append('circle')
        .attr('class', 'marker-bg')
        .attr('cx', radius)
        .attr('cy', radius)
        .attr('r', radius);
    
      markerG.append('text')
        .attr('x', radius)
        .attr('y', radius*0.9)
        .text(marker.type);
    
      markerG.append('text')
        .attr('x', radius)
        .attr('y', radius*1.5)
        .text(marker.version);
    }
    
    function startTransitions (svg, chartWidth, chartHeight, rectClip, markers, x) {
      rectClip.transition()
        .duration(1000*markers.length)
        .attr('width', chartWidth);
    
      markers.forEach(function (marker, i) {
        setTimeout(function () {
          addMarker(marker, svg, chartHeight, x);
        }, 1000 + 500*i);
      });
    }
    
    function makeChart (data, markers) {
      var svgWidth  = 960 * 65/100,
          svgHeight = 500 * 65/100,
          margin = { top: 20, right: 20, bottom: 40, left: 40 },
          chartWidth  = svgWidth  - margin.left - margin.right,
          chartHeight = svgHeight - margin.top  - margin.bottom;
    
      var x = d3.time.scale().range([0, chartWidth])
                .domain(d3.extent(data, function (d) { return d.date; })),
          y = d3.scale.linear().range([chartHeight, 0])
                .domain([0, d3.max(data, function (d) { return d.pct95; })]);
    
      var xAxis = d3.svg.axis().scale(x).orient('bottom')
                    .innerTickSize(-chartHeight).outerTickSize(0).tickPadding(10),
          yAxis = d3.svg.axis().scale(y).orient('left')
                    .innerTickSize(-chartWidth).outerTickSize(0).tickPadding(10);
    
      var svg = d3.select('.chartArea').append('svg')
        .attr('width',  svgWidth)
        .attr('height', svgHeight)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
      // clipping to start chart hidden and slide it in later
      var rectClip = svg.append('clipPath')
        .attr('id', 'rect-clip')
        .append('rect')
          .attr('width', 0)
          .attr('height', chartHeight);
    
      addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
      drawPaths(svg, data, x, y);
      startTransitions(svg, chartWidth, chartHeight, rectClip, markers, x);
    }
    
    var parseDate  = d3.time.format('%Y-%m-%d').parse;
    d3.json('http://127.0.0.1:8887/data.json', function (error, rawData) {
      if (error) {
        console.error(error);
        return;
      }
    
      var data = rawData.map(function (d) {
        return {
          date:  parseDate(d.date),
          pct05: d.pct05 / 1000,
          pct25: d.pct25 / 1000,
          pct50: d.pct50 / 1000,
          pct75: d.pct75 / 1000,
          pct95: d.pct95 / 1000
        };
      });
    
      d3.json('http://127.0.0.1:8887/markers.json', function (error, markerData) {
        if (error) {
          console.error(error);
          return;
        }
    
        var markers = markerData.map(function (marker) {
          return {
            date: parseDate(marker.date),
            type: marker.type,
            version: marker.version
          };
        });
    
        makeChart(data, markers);
      });
    });
  }


}
