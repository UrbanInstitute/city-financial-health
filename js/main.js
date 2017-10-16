var DESKTOP_RADIUS = 4.6;
var DESKTOP_HOVER_RADIUS = 10;


function getGroupColor(group){
  var colors = [null,"#DB2B27","#73BFE2","#55B748","#EC008B","#1696D2","#12719E","#FDBF11","#9D9D9D", "#000000"]
  return colors[group]
}
function drawMap(containerID, us, cities){

  var container = d3.select("#" + containerID)

  container.selectAll("svg").remove() 
  
  var w = container.node().getBoundingClientRect().width
  var h = w*.618

  var projection = d3.geoAlbersUsa()
    .scale(w*1.31)
    .translate([w/2, h/2]);

  var path = d3.geoPath()
    .projection(projection);

  var voronoi = d3.voronoi()
    .extent([[-1, -1], [w + 1, h + 1]]);

  var svg = container
    .append("svg")
      .style("width", w)
      .style("height", h)
        .append("g");

  svg.selectAll(".states")
    .data(topojson.object(us, us.objects.states).geometries)
    .enter()
    .append("path")
      .attr("class", "states")
      .attr("d", path);

  var dots = svg.append("g")
  dots.selectAll(".city")
    .data(cities)
    .enter()
    .append("circle")
      .attr("class", function(d){ return "city city_" + d.slug + " group_" + d.group  })
      .attr("cx", function(d){ return projection([d[0], d[1] ])[0]})
      .attr("cy", function(d){ return projection([d[0], d[1] ])[1]})
      .attr("r", function(d){ return DESKTOP_RADIUS })
      .attr("fill", function(d){ return getGroupColor(d.group)});

  dots.selectAll(".dummyText")
    .data(cities)
    .enter()
    .append("text")
      .attr("class", function(d){ return "dummyText city_" + d.slug + " group_" + d.group  })
      .attr("x", -1000)
      .attr("y", -1000)
      .text(function(d){ return d.city });


  dots.selectAll(".cityText")
    .data(cities)
    .enter()
    .append("text")
      .attr("class", function(d){ return "cityText city_" + d.slug + " group_" + d.group  })
      .attr("x", function(d){
        if(d.slug == "san-francisco-ca" || d.slug == "new-york-ny" || d.slug == "columbus-oh" || d.slug == "houston-tx" || d.slug == "savannah-ga" || d.slug == "san-jose-ca" || d.slug == "" || d.slug == "" || d.slug == ""){
          return projection([d[0], d[1] ])[0] - 15 
        }
        else if(d.slug == "san-antonio-tx" || d.slug == "indianapolis-in"){
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width + 15
        }
        else if(d.slug == "baton-rouge-la"){
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width - 9
        }
        else if(d.slug == "new-orleans-la"){
          return projection([d[0], d[1] ])[0] + 13 
        }else{
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width *.5  
        }
      })
      .attr("y", function(d){
        if(d.slug == "san-francisco-ca" || d.slug == "sacramento-ca" || d.slug == "lansing-mi" || d.slug == "indianapolis-in" || d.slug == "wilmington-de" || d.slug == "durham-nc" || d.slug == "philadelphia-pa" ||  d.slug == "birmingham-al" || d.slug == "columbia-sc" || d.slug == "jackson-ms"){
          return projection([d[0], d[1] ])[1] - 14;  
        }
        else if(d.slug == "new-orleans-la" || d.slug == "baton-rouge-la"){
          return projection([d[0], d[1] ])[1] + 5
        }else{
          return projection([d[0], d[1] ])[1] + 22;  
        }
      })
      .text(function(d){ return d.city });

  var cell = svg.selectAll(".cell")
    .data(cities)
    .enter().append("g")
      .attr("class", "cell")
      .on("mouseover", function(d){
        mouseover(d.slug, d.group)
      })
      .on("mouseout", function(d){
        mouseout()
      });

  cell.append("g")
    .append("path")
      .data(voronoi.polygons(cities.map(projection)))
      .attr("class", "cell-path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });

}

function typeCities(d){
  d[0] = +d.long;
  d[1] = +d.lat;
  d.group = +d.group;
  d.slug = d.slug;
  d.city = d.city;
  d.state = d.state;
  return d;
}

function mouseover(city, group){
  console.log(city, group)
  d3.selectAll("circle.group_" + group)
    .each(function(){
      this.parentNode.appendChild(this)
    })
    .transition()
    .attr("r", DESKTOP_HOVER_RADIUS)
    .style("opacity", function(){
      if(city == null){
        return 1;
      }
      else if(d3.select(this).classed("city_" + city)){
        return .5;
      }else{
        return 1;
      }
    })
  d3.selectAll(".cityText.group_" + group)
    .each(function(){
      this.parentNode.appendChild(this)
    })
    .transition()
    .style("opacity", 1)
}

function mouseout(){
  d3.selectAll("circle")
    .transition()
    .attr("r", DESKTOP_RADIUS)
    .style("opacity",1)
  d3.selectAll(".cityText")
    .transition()
    .style("opacity", 0)
}

d3.json("data/map.json", function(error, us) {
  d3.tsv("data/cities.tsv")
    .row(typeCities)
    .get(function(error, cities){
      drawMap("homeMap", us, cities)
      d3.select(window)
        .on("resize", function(){
          drawMap("homeMap", us, cities)
        });
  })
})

