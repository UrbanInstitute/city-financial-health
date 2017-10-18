var DESKTOP_RADIUS = 4.6;
var DESKTOP_HOVER_RADIUS = 10;

function getActiveGroup(){
  return false;
}
function getActiveCity(){
  return false;
}
function isHome(){
  return true;
}
function IS_MOBILE(){
  return false;
}
function IS_PHONE(){
  return false;
}
function getGroupColor(group){
  var colors = [null,"#DB2B27","#73BFE2","#55B748","#EC008B","#1696D2","#12719E","#FDBF11","#9D9D9D", "#000000"]
  return colors[group]
}
function alphaSort(data){
  data.sort(function(a, b) {
    var nameA = a.city.toUpperCase(); // ignore upper and lowercase
    var nameB = b.city.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  });
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
        highlight(d, true, "hover", cities)
      })
      .on("click", function(d){
        highlight(d, true, "click", cities)
      })
      .on("mouseout", function(d){
        mouseout(cities)
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

function buildTooltip(cities){
  for(var i = 1; i < 10; i ++){
    var datum = cities.filter(function(o){ return o.group == i })[0]
    d3.select("#groupList")
      .append("div")
      .datum(datum)
      .attr("class", "groupListGroup groupListGroup_" + i)
      .text(groupNames[i])
      .on("mouseover", function(d){
        highlight(d, false, "hover", cities)
      })
      .on("mouseout", function(){
        mouseout(cities)
      })
      .on("click", function(d){
        highlight(d, false, "click", cities)
      })
    d3.select("#groupList")
      .append("div")
      .datum(datum)
      .attr("class", "groupListSpace groupListSpace_" + i)
      .on("mouseover", function(d){
        highlight(d, false, "hover", cities)
      })
      .on("mouseout", function(){
        mouseout(cities)
      })
      .on("click", function(d){
        highlight(d, false, "click", cities)
      })
  }
  var init = cities[0]

  highlight(init, false, "hover", cities)
}

function buildStateSelect(cities){
  alphaSort(cities)
  d3.select("#stateSelect")
    .selectAll("option")
    .data(cities)
    .enter()
    .append("option")
      .attr("value", function(d){ return d.slug})
      .text(function(d){ return d.city + ", " + d.state})
  $("#stateSelect" ).selectmenu({
    change: function(event, d){
      var slug = d.item.value
      var d = cities.filter(function(o){ return o.slug == slug })[0]
      highlight(d, true, "click", cities)
    }
  })
}

function highlight(datum, isCity, action, cities){
  var city = datum.slug
  var group = datum.group
  
/******** UPDATE MAP ************/
    d3.selectAll("circle")
      .transition()
      .attr("r", DESKTOP_RADIUS)
      .style("opacity",1)
    d3.selectAll(".cityText")
      .transition()
      .style("opacity", 0)

  if(action == "click"){
    if(isCity){ $("#stateSelect" ).val(city).selectmenu("refresh") }
    d3.selectAll(".clicked").classed("clicked", false)
    if(isCity){
      d3.select("circle.city_" + city)
        .classed("clicked", true)
    }else{
      d3.select(".groupListGroup_" + group)
        .classed("clicked", true)
    }
  }


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
      else if(isCity && d3.select(this).classed("city_" + city)){
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
/******** UPDATE TOOLTIP ************/
  if(isHome()){
    var d = datum;

    d3.selectAll(".groupListGroup")
      .classed("active", false)
      .style("border-left", "7px solid white")

    d3.select(".groupListGroup_" + d.group)
      .classed("active", true)
      .style("border-left", "7px solid " + getGroupColor(d.group))

    if(isCity){
      d3.select("#tooltipTitle").text(d.city + ", " + d.state)
      d3.select("#subtitleGroupName").text(groupNames[d.group])
      d3.select("#tooltipSubtitle").style("display", "block")
      d3.select("#tooltipViewMore").text("View city metrics")
    }else{
      d3.select("#tooltipTitle").text(groupNames[d.group])
      d3.select("#tooltipSubtitle").style("display", "none")
      d3.select("#tooltipViewMore").text("View metrics")
    }
    d3.select("#tooltipContainer")
      .style("border-left", "10px solid " + getGroupColor(d.group))
    var subset = cities.filter(function(o){ return o.group == d.group })
    alphaSort(subset)
    var cols;
    if(IS_PHONE()){ cols = 2}
    else if(IS_MOBILE()){ cols = 3}
    else{ cols = 4 }
    d3.selectAll("#tooltipCitiesList .col").remove()
    
    var n = Math.ceil(subset.length/cols)
    for(var i = 0; i < cols; i++){
      var col = d3.select("#tooltipCitiesList")
        .append("div")
        .attr("class", "col")
        .style("width", 100/cols + "%")
      for(var j = 0; j < n; j++){
        if(typeof(subset[i*n + j]) != "undefined"){
          col.append("div")
            .attr("class", "tooltipCity")
            .text(subset[i*n + j]["city"] + ", " + subset[i*n + j]["state"])
        }else{
          col.append("div")
            .attr("class", "tooltipCity")
            .text("a")
            .style("opacity",0)
        }
      }
    }
  }
}

function mouseout(cities){
    d3.selectAll("circle")
      .transition()
      .attr("r", DESKTOP_RADIUS)
      .style("opacity",1)
    d3.selectAll(".cityText")
      .transition()
      .style("opacity", 0)
    if(d3.selectAll("circle.clicked").nodes().length != 0){
      var d = d3.select("circle.clicked").datum()
      highlight(d, true, "click", cities)
    }
    else if(d3.selectAll(".groupListGroup.clicked").nodes().length != 0){
      var d = d3.select(".groupListGroup.clicked").datum()
      highlight(d, false, "click", cities)     
    }
}

function showCityMenu(cities){
  hideMenu();
  if(d3.select(".city.menu.popup").node() != null){
    return false;
  }
  alphaSort(cities)
  var menu = d3.select("body")
    .append("div")
    .attr("class", "city menu popup")
    .on("mouseleave", hideMenu)
  var container = menu.append("div")
    .attr("class", "colContainer")
  
  var columns = (IS_MOBILE()) ? 3 : 5;

  for(var i = 0; i < columns; i++){
    var col = container.append("div")
      .attr("class", "popupColumn popupColumn_" + (i+1))
    for(var j = i*(60/columns); j < (i+1)*60/columns; j++){
      col.append("div")
        .attr("class", "popupCity")
        .text(cities[j]["city"] + ", " + cities[j]["state"])
        // .attr("href")
    }
  }
}

function showGroupMenu(){
  hideMenu();
  if(d3.select(".group.menu.popup").node() != null){
    return false;
  }
  var menu = d3.select("body")
    .append("div")
    .attr("class", "group menu popup")
    .on("mouseleave", hideMenu)
  var container = menu.append("div")
    .attr("class", "colContainer")
  
  var columns = (IS_MOBILE()) ? 2 : 3;

  for(var r = 0; r < Math.ceil(9/columns); r++){
    var row = container.append("div")
      .attr("class", function(){
        var suffix;
        if(r == 0 ){ suffix = "first"}
        else if(r == Math.ceil(9/columns) - 1){ suffix = "last"}
        else{ suffix = (r+1) }
        return "popupRow popupRow_" + suffix
      })
    for(var i = 0; i<columns; i++){
      row.append("div")
        .attr("class", "popupGroup")
        .text(groupNames[r*columns+i+1])
        .style("border-left", "10px solid " + getGroupColor(r*columns+i+1))
    }
  }
}

function hideMenu(){
  d3.selectAll(".menu.popup").remove() 
}


d3.json("data/map.json", function(error, us) {
  d3.tsv("data/cities.tsv")
    .row(typeCities)
    .get(function(error, cities){

      buildTooltip(cities)
      buildStateSelect(cities)

      drawMap("homeMap", us, cities)
      
      d3.select(window)
        .on("resize", function(){
          drawMap("homeMap", us, cities)
        });

      d3.select(".menuTab.cities")
        .on("mouseover", function(){ showCityMenu(cities) })
        // .on("mouseout", hideMenu)
      d3.select(".menuTab.home")
        .on("mouseover", hideMenu)
      d3.select(".menuTab.groups")
        .on("mouseover", showGroupMenu)
  })
})

