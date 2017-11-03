var DESKTOP_RADIUS = 4.6;
var DESKTOP_HOVER_RADIUS = 10;


function getQueryString(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function getActiveGroup(){
  return false;
}
function getActiveCity(){
  return false;
}
function IS_1200(){
  if(PRINT){ return false }
  else { return d3.select("#breakpoint1200").style("display") == "block"; }
}
function IS_1000(){
  if(PRINT){ return false }
  else { return d3.select("#breakpoint1000").style("display") == "block"; }
}
function IS_900(){
  if(PRINT){ return false }
  else { return d3.select("#breakpoint900").style("display") == "block"; }
}
function IS_MOBILE(){
  if(PRINT){ return false }
  else { return d3.select("#isMobile").style("display") == "block"; }
}
function IS_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isPhone").style("display") == "block"; }
}
function IS_SMALL_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isSmallPhone").style("display") == "block"; }
}
function IS_VERY_SMALL_PHONE(){
  if(PRINT){ return false }
  else { return d3.select("#isVerySmallPhone").style("display") == "block"; }
}
function getGroupColor(group){
  var colors = [null,"#DB2B27","#73BFE2","#55B748","#EC008B","#1696D2","#12719E","#FDBF11","#9D9D9D", "#000000"]
  return colors[group]
}
function getPeerGroup(cities){
  if(PAGE == "home"){
    return false;
  }
  else if(PAGE == "group"){
    if(getQueryString("peergroup") == ''){ return 1 }
    else { return parseInt(getQueryString("peergroup")) }
  }else{
    if(getQueryString("city") == ''){ return 1 }
    else{
      var city = getQueryString("city")
      var d = cities.filter(function(o){ return o.slug == city})[0]
      return d.group
    }
  }
}
function getCity(cities){
  if(PAGE != "city"){
    return false;
  }else{
    var city;
    if(getQueryString("city") == ''){
      city = cities[0]["slug"]
    }else{
      city = getQueryString("city")
    }
    var d = cities.filter(function(o){ return o.slug == city })[0]
    // return [city, d.fullName, d.group]
    return d;
  }
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
  var w = container.node().getBoundingClientRect().width;
  var h = w*.618;

  var projection = d3.geoAlbersUsa()
    .scale(w*1.31)
    .translate([w/2, h/2]);

  var path = d3.geoPath()
    .projection(projection);

  var voronoi = d3.voronoi()
    .extent([[-1, -1], [w + 1, h + 1]]);

  var svg = container
    .append("svg")
      .style("width", w + "px")
      .style("height", h + "px")
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
      .attr("r", function(d){
        if(PAGE == "home"){ return DESKTOP_RADIUS }
        else{ return DESKTOP_HOVER_RADIUS }
      })
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
        var small = IS_1200() || PRINT;
        if(IS_1000() && !IS_900()){
          if(d.slug == "san-francisco-ca" || d.slug == "san-jose-ca" || d.slug == "oakland-ca" || d.slug == "sacramento-ca"){
            return projection([d[0], d[1] ])[0] + 5 
          }else{
            return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width *.5  
          }
        }
        else if(PRINT && (d.slug == "san-francisco-ca" || d.slug == "san-jose-ca" || d.slug == "oakland-ca" || d.slug == "sacramento-ca")){
          return projection([d[0], d[1] ])[0] + 2
        }
        else if(d.slug == "san-francisco-ca" || d.slug == "new-york-ny" || d.slug == "columbus-oh" || d.slug == "houston-tx" || d.slug == "savannah-ga" || d.slug == "san-jose-ca" || d.slug == "" || d.slug == "" || d.slug == ""){
          return projection([d[0], d[1] ])[0] - 15 
        }
        else if(d.slug == "san-antonio-tx" || d.slug == "indianapolis-in" || (small && d.slug == "milwaukee-wi") || (small && d.slug == "shreveport-la") || (small && d.slug == "des-moines-ia") || (small && d.slug == "kansas-city-mo")){
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width + 15
        }
        else if(d.slug == "baton-rouge-la"){
          var nudge = (small) ? 4 : 9;
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width - nudge
        }
        else if(d.slug == "new-orleans-la"){
          return projection([d[0], d[1] ])[0] + 13 
        }
        else{
          return projection([d[0], d[1] ])[0] - d3.select(".dummyText.city_" + d.slug).node().getBoundingClientRect().width *.5  
        }
      })
      .attr("y", function(d){
        var small = IS_1200() || PRINT;
        if(IS_1000() && !IS_900()){
          return projection([d[0], d[1] ])[1] + 22;    
        }
        else if(d.slug == "san-francisco-ca" || d.slug == "sacramento-ca" || d.slug == "lansing-mi" || d.slug == "indianapolis-in" || d.slug == "wilmington-de" || d.slug == "durham-nc" || d.slug == "philadelphia-pa" ||  d.slug == "birmingham-al" || d.slug == "columbia-sc" || d.slug == "jackson-ms" || (small && d.slug == "milwaukee-wi") || (small && d.slug == "buffalo-ny") || (small && d.slug == "rochester-ny") || (small && d.slug == "shreveport-la")){
          return projection([d[0], d[1] ])[1] - 14;  
        }
        else if(d.slug == "new-orleans-la" || d.slug == "baton-rouge-la"){
          return projection([d[0], d[1] ])[1] + 5
        }else{
          return projection([d[0], d[1] ])[1] + 22;    
        }
      })
      .text(function(d){ return d.city })
      .style("opacity", function(){
        if(PAGE == "home"){ return 0 }
        else{ return 1 }
      })

  var cell = svg.selectAll(".cell")
    .data(cities)
    .enter().append("g")
      .attr("class", "cell")
      .on("mouseover", function(d){
        highlight(d, true, "hover", cities)
      })
      .on("click", function(d){
        if(PAGE == "home"){
          highlight(d, true, "click", cities)
        }else{
          window.location.href = "city.html?city=" + d.slug;
        }
      })
      .on("mouseout", function(d){
        mouseout(cities)
      });

  cell.append("g")
    .append("path")
      .data(voronoi.polygons(cities.map(projection)))
      .attr("class", "cell-path")
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });

  clearSelected(cities)
  updateContentMargin()
}

function clearSelected(cities){
  d3.select("#stateSelect-button").classed("active", false)
  var init = cities.filter(function(o){ return o.group == 1 })[0]
  if(PAGE != "group") { highlight(init, false, "click", cities) }
  $("#stateSelect" ).val("default").selectmenu("refresh")
  if(IS_900()){
    $("#groupSelect" ).val("1").selectmenu("refresh")
  }
  d3.select("#clearSelection")
    .transition()
    .style("opacity",0)
}

function clean(val){
  if(val == '' || isNaN(+val)){ return null }
  else{ return +val }
}
function typeCities(d){
  d[0] = +d.long;
  d[1] = +d.lat;
  d.group = +d.group;
  d.slug = d.slug;
  d.city = d.city;
  d.state = d.state;
  d.fullName = d.city + ", " + d.state
  d["credit-overall"] = clean(d["credit-overall"]);
  d["credit-non-white"] = clean(d["credit-non-white"]);
  d["credit-white"] = clean(d["credit-white"]);
  d["debt-percent"] = clean(d["debt-percent"]);
  d["debt-amount"] = clean(d["debt-amount"]);
  d["foreclosure"] = clean(d["foreclosure"]);
  d["cost-burdened"] = clean(d["cost-burdened"]);
  d["eitc"] = clean(d["eitc"]);
  d["unbanked"] = clean(d["unbanked"]);
  d["health-insured"] = clean(d["health-insured"]);
  d["health-uninsured"] = clean(d["health-uninsured"]);
  d["low-income"] = clean(d["low-income"]);
  d["unemployment"] = clean(d["unemployment"]);
  d["labor-force-participation"] = clean(d["labor-force-participation"]);
  d["gini"] = clean(d["gini"]);
  d["pop-change"] = clean(d["pop-change"]);
  return d;
}
function typeGroups(d){
  d.group = +d.group;
  d["credit-overall"] = +d["credit-overall"];
  d["credit-non-white"] = +d["credit-non-white"];
  d["credit-white"] = +d["credit-white"];
  d["debt-percent"] = +d["debt-percent"];
  d["debt-amount"] = +d["debt-amount"];
  d["foreclosure"] = +d["foreclosure"];
  d["cost-burdened"] = +d["cost-burdened"];
  d["eitc"] = +d["eitc"];
  d["unbanked"] = +d["unbanked"];
  d["health-insured"] = +d["health-insured"];
  d["health-uninsured"] = +d["health-uninsured"];
  d["low-income"] = +d["low-income"];
  d["unemployment"] = +d["unemployment"];
  d["labor-force-participation"] = +d["labor-force-participation"];
  d["gini"] = +d["gini"];
  d["pop-change"] = +d["pop-change"];

  return d;
}

function updateContentMargin(){
  if(PRINT){
    return false;
  }
  else if(PAGE == "home"){
    var margin;
    if(IS_PHONE()){
      margin = 330 + d3.select("#tooltipContainer").node().getBoundingClientRect().height;
    }
    else if(IS_MOBILE()){
      margin = 270 + d3.select("#tooltipContainer").node().getBoundingClientRect().height;
    }
    else if(IS_900()){
      margin = 455 + d3.select("#homeMap").node().getBoundingClientRect().height;
    }
    else if(IS_1000() || IS_1200()){
      margin = 737;
    }else{
      margin = 925;
    }
    d3.select("#homeCopy")
      .style("margin-top", margin + "px")
  }
  else if(PAGE == "group"){
    var margin;
    if(IS_MOBILE()){
      margin = 90 +  d3.select("#groupCitiesListContainer").node().getBoundingClientRect().height;
    }
    else if(IS_900()){
      margin = 90 + d3.select("#groupMap").node().getBoundingClientRect().height + d3.select("#groupCitiesListContainer").node().getBoundingClientRect().height;
    }else{
      margin = 90 + d3.max([d3.select("#groupMap").node().getBoundingClientRect().height,d3.select("#groupCitiesListContainer").node().getBoundingClientRect().height]);
    }
    // else if(IS_1000() || IS_1200()){
    //   margin = 737;
    // }else{
    //   margin = 925;
    // }
    d3.select("#chartContainer")
      .style("margin-top", margin + "px")
  }
}

function buildGroupContent(groups, cities){
  d3.selectAll(".groupContent").remove()
/************** Build title **********/
  var group, city;
  if(PAGE == "group"){
    group = getPeerGroup(groups);
  }else{
    city = getCity(cities)  
    group = city.group
  }
  if(PRINT){
    var groupText = "Cities in this peer group:"
    for(var i = 0; i<groups.length; i++){
      groupText += " " + groups[i].fullName
      if(i == groups.length -1){ groupText += "."}
      else{ groupText += ";"}
    }
    d3.select("#printCityList")
      .text(groupText)
  }
  if(PAGE == "group"){
    d3.select("#groupTitle")
      .text(groupNames[group])
      .style("border-left", "10px solid " + getGroupColor(group))
  }else{
    d3.select("#cityTitle")
      .text(city.fullName)
    var subtitle = d3.select("#groupSubtitle")
    subtitle.append("div")
      .attr("id","groupSubtitleText")
      .attr("class", "groupContent")
      .html("is in the <a class = \"standard\" href = \"peergroup.html?peergroup=" + group + "\"><span>" + groupNames[group] + "</span></a> peer group")
    subtitle.append("div")
      .attr("class", "thinButton groupContent")
      .on("click", function(){ window.location.href = "peergroup.html?peergroup=" + group })
      .text("View peer group profile")
    subtitle
      .style("border-left", "10px solid " + getGroupColor(group))
  }

/************** Build highlights **********/
  var highlightUl = d3.select("#highlights").append("ul")
    .attr("id", "highlightUl")
    .attr("class", "groupContent")
  var highlights = groupHighlights[group]
  for(var i =0; i < highlights.length; i++){
    highlightUl.append("li")
      .attr("class","highlightLi groupContent")
      .html(highlights[i])
  }
/************** Build map city list **********/
  if(PAGE == "group" || PRINT ){
    if(IS_900()){
      var columns = (IS_SMALL_PHONE()) ? 2 : 3;
      var rows = Math.ceil(groups.length/columns)
      var start = 0;
      for(var i = 0; i < rows; i++){
        var rowDiv = d3.select("#groupCitiesList") 
          .append("div")
          .attr("class", "groupContent groupCityRow")
        for(var j = start; j < groups.length; j += (rows)){
          var innerDiv = rowDiv.append("div")
            .datum(groups[j])
            .attr("class", "groupCityContainer")
          innerDiv.append("a")
            .attr("id", function(d){ return "groupCity_" + d.slug})
            .attr("class", "standard groupCity")
            .text(function(d){ return d["fullName"] })
            .on("mouseover", function(d){
              d3.select("circle.city_" + d.slug).style("opacity",.5)
              d3.select(this).style("color","#353535")
            })
            .on("mouseout", function(d){
              d3.select("circle.city_" + d.slug).style("opacity",1)
              d3.select(this).style("color","#1696d2")
            })
            .on("click", function(d){
              window.location.href = "city.html?city=" + d.slug;
            })


        }
        start += 1; 
      }
      updateContentMargin()
    }else{
      var innerDiv = d3.select("#groupCitiesList")
        .selectAll(".groupCity")
        .data(groups)
        .enter()
        .append("div")
        .attr("id", function(d){ return "groupCity_" + d.slug})
        .attr("class", function(d,i){
          if(i%2 == 0){ return "groupCity groupContent even"}
          else{ return "groupCity groupContent odd"}
        })
        .text(function(d){ return d.fullName })
        .on("mouseover", function(d){
          d3.select("circle.city_" + d.slug).style("opacity",.5)
          d3.select(this).style("color","#353535")
        })
        .on("mouseout", function(d){
          d3.select("circle.city_" + d.slug).style("opacity",1)
          d3.select(this).style("color","#1696d2")
        })
        .on("click", function(d){
          window.location.href = "city.html?city=" + d.slug;
        })

        if(PRINT){
          var lilSvg = innerDiv.append("svg")
            .attr("class","lilSvg")
            .attr("width", "190")
            .attr("height", "35")
            .append("g")
          lilSvg
            .append("rect")
            .attr("fill",function(d,i){
              if(i%2 == 0){ return "#F5F5F5"}
              else{ return "#fff"}
            })
            .attr("width", "190")
            .attr("height", "35")
            .attr("x",0)
            .attr("y",0)
          lilSvg.append("text")
            .text(function(d){ return d.fullName })
            .attr("x",16)
            .attr("y",22)


        }
    }
  }
/************** Build approaches **********/
  d3.select("#approachesGroupName")
    .text(groupNames[group])
  var approachUl = d3.select("#approachesList").append("ul")
    .attr("class", "groupContent")
    .attr("id", "approachUl")
  var approaches = groupApproaches[group]
  for(var i =0; i < approaches.length; i++){
    approachUl.append("li")
      .attr("class","approachLi")
      .html(approaches[i])
  }

}
function buildBottomContent(groups, cities){
  d3.selectAll(".bottomContent").remove()

  var group, city;
  if(PAGE == "group"){
    group = getPeerGroup(groups);
  }else{
    city = getCity(cities)  
    group = city.group
    groups = cities.filter(function(o){ return o.group == group})
  }
  alphaSort(groups)
  d3.select("#bottomCitiesList")
    .selectAll(".bottomCity")
    .data(groups)
    .enter()
    .append("div")
    .attr("class","bottomCity bottomContent")
    .append("a")
    .text(function(d){ return d.fullName })
    .attr("href", function(d){ return "city.html?city=" + d.slug})
    .attr("class", "standard")

  var container = d3.select("#bottomGroupsList")

  var columns = (IS_SMALL_PHONE()) ? 1 : 2;

  for(var r = 0; r < Math.ceil(8/columns); r++){
    var row = container.append("div")
      .attr("class", function(){
        return "bottomContent bottomRow bottomRow_" + (r+1)
      })
  }
  var rowCount = 1;
  var counter = -1;
  for(var i = 1; i < 10; i++){
    if(i == group){ continue }
    counter += 1;
    if(counter == columns){ counter = 0; rowCount += 1 }
    d3.select(".bottomRow_" + rowCount)
        .append("a")
        .attr("class","inverted bottomContent")
        .attr("href", "peergroup.html?peergroup=" + (i))
        .append("div")
        .attr("class", "bottomGroup bottomContent")
        .text(groupNames[i])
        .style("border-left", "10px solid " + getGroupColor(i))

  }
}

function buildCharts(cities, groups){
  d3.selectAll(".chartContent").remove()

  var group, city;
  if(PAGE == "group"){
    group = getPeerGroup(groups);
  }else{
    city = getCity(cities)  
    group = city.group
  }
  var metrics = [["credit-overall","Median credit score",800,"int"],["credit-white","Credit score, white areas",800,"int"],["credit-non-white","Credit score, nonwhite areas",800,"int"],["debt-percent","Delinquent debt",.7,"percent0"],["debt-amount","Median delinquent debt",2400,"dollars"],["foreclosure","Home foreclosure",.025,"percent2"],["cost-burdened","Housing-cost burdened, low-income",.85,"percent0"],["unbanked","Unbanked, metro area",.18,"percent1"],["health-insured","Health insurance coverage",.91,"percent0"],["eitc","Received EITC, low-income",.55,"percent0"],["unemployment","Unemployment rate",.21,"percent1"],["labor-force-participation","Labor force participation rate",.76,"percent0"],["low-income","Below 200% of federal poverty level",.66,"percent0"],["pop-change","Population change, 2000&ndash;15",.53,"percent0"],["gini","Gini index of income inequality",.58,"gini"]]

  function format(val, formatter){
    if(formatter == "int"){ return d3.format(".0f")(val) }
    else if(formatter == "dollars"){ return d3.format("$,.0f")(val) }
    else if(formatter == "percent0"){ return d3.format(".0%")(val) }
    else if(formatter == "percent1"){ return d3.format(".1%")(val) }
    else if(formatter == "percent2"){ return d3.format(".2%")(val) }
    else if(formatter == "gini"){ return d3.format(".2f")(val) }
  }

  if(PAGE == "group"){
    var datum = null;
    for(var i = 0; i < metrics.length; i++){
      buildChart(metrics[i], datum)  
    }
    d3.select("#printButton")
      .on("click", function(){ window.open("print_peergroup.html?peergroup=" + group) })
      .text("Print")
  }else{
    for(var i = 0; i < metrics.length; i++){
      buildChart(metrics[i], city)  
    }
    d3.select("#printButton")
      .on("click", function(){ window.open("print_city.html?city=" + city.slug) })
      .text("Print")
  }
        // <div id = "printButton" class = "thicButton">Print</div>
      // <div id = "dataButton" class = "thicButton"><a href = "data/download/financial-health-of-residents-data.xlsx">Download data</a></div>

  function buildChart(metric, datum){
    var metricVar = metric[0]
    var metricName = metric[1]
    var yMax = metric[2]
    var yMin;
    var formatter = metric[3]

    var container = d3.select("#charts")
      .append("div")
      .attr("class", "smallChartContainer chartContent")
    var W = (PRINT) ? 130 : 160;
    var H = (PRINT) ? 130 : 160;
    var svg = container.append("svg")
      .attr("width",W)
      .attr("height",H)


    var margin = {top: 60, right: 0, bottom: 10, left: 0},
    width = W - margin.left - margin.right,
    height = H - margin.top - margin.bottom;

    var data;

    if(datum == null){
      var activeGroup = groups.filter(function(o){ return o.group == group })[0]
      var national = groups.filter(function(o){ return o.group == 99 })[0]
      activeGroup.category = "group"
      national.category = "national"
      data = [activeGroup,national]
    }else{
      d3.selectAll("#chartKey .city").style("display", "inline-block")
      d3.select(".keyLabel.city").text(city.fullName)
      d3.select("#chartContainer").classed("city", true)
      var activeGroup = groups.filter(function(o){ return o.group == group })[0]
      var national = groups.filter(function(o){ return o.group == 99 })[0]
      activeGroup.category = "group"
      national.category = "national"
      city.category = "city"
      data = [city, activeGroup,national]
    }

    var noDataCheck = (datum == null) ? activeGroup : datum;
    container.append("div")
      .datum(noDataCheck)
      .attr("class","metricName chartContent")
      .html(function(d){
        if(d[metricVar] == null){
          d3.select("#noDataNote").style("display","block")
          return metricName + "<sup>a</sup>"
        }else{
          return metricName
        }
      })

    if(metricVar == "pop-change"){
      var cityPc = (datum == null) ? 0 : city["pop-change"];
      if(cityPc < 0 || activeGroup["pop-change"] < 0){
        yMin = -.35;
        yMax = .53;
      }else{
        yMax = .88;
        yMin =  0;
      }
    }else{
      yMin = 0;
    }

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.3),
    y = d3.scaleLinear().rangeRound([height, 0]);


    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.category; }));
    y.domain([yMin, yMax]);



    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", function(d){ return "bar " + d.category})
        .attr("x", function(d) { return x(d.category); })
        .attr("y", function(d) {
          if(d[metricVar] < 0){ return y(0)}
          else{ return y(d[metricVar]) ;}
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return Math.abs(y(d[metricVar]) - y(0)); })

    g.selectAll(".barLabelHide")
      .data(data)
      .enter().append("text")
        .attr("class", function(d){ return "barLabelHide " + d.category})
        .attr("x", -500)
        .attr("y", -500)
        .text(function(d){ return format(d[metricVar], formatter)})

    g.selectAll(".barLabel")
      .data(data)
      .enter().append("text")
        .attr("class", function(d){ return "barLabel " + d.category})
        .attr("x", function(d) {
          // var nudge = (datum == null) ? 8 : 0;
          var bw = g.select(".barLabelHide." + d.category).node().getBoundingClientRect().width
          var nudge = .5*(x.bandwidth() - bw)
          return x(d.category) + nudge;
        })
        .attr("y", function(d) {
          if(d[metricVar] < 0){ return y(0) + Math.abs(y(d[metricVar]) - y(0)) + 15;}
          else{ return y(d[metricVar]) - 5; }
        })
        .text(function(d){
          if(d[metricVar] == null){
            return ''
          }else{
            return format(d[metricVar], formatter)
          }
        })

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + y(0) + ")")
      .call(d3.axisBottom(x).tickSize(0));
  }
}

function buildTooltip(cities){
  d3.selectAll("#groupList .groupListGroup").remove()
  d3.selectAll("#groupList .groupListSpace").remove()
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
        mouseout(cities, true)
      })
      .on("click", function(d){
        $("#stateSelect" ).val("default").selectmenu("refresh")
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
        mouseout(cities, true)
      })
      .on("click", function(d){
        highlight(d, false, "click", cities)
      })
  }

}

function buildStateSelect(cities){
  d3.selectAll("#stateSelect option.state").remove()
  d3.selectAll("#groupSelect option.group").remove()

  d3.select("#clearSelection")
    .on("click", function(){
      clearSelected(cities)
    })

  alphaSort(cities)
  d3.select("#stateSelect")
    .selectAll("option.state")
    .data(cities)
    .enter()
    .append("option")
      .attr("class", "state")
      .attr("value", function(d){ return d.slug})
      .text(function(d){ return d.fullName })
  $("#stateSelect" ).selectmenu({
    change: function(event, d){
      var slug = d.item.value
      if(slug == "default"){
        clearSelected(cities)
      }else{
        var d = cities.filter(function(o){ return o.slug == slug })[0]
        highlight(d, true, "click", cities)
      }
    },
    open: function(event, d){
      d3.select("#stateSelect-button").classed("active", true)
    },
    select: function(event, d){
      if(d.item.value == "default"){
        d3.select("#stateSelect-button").classed("active", false) 
      }
    }
  })
  if(IS_900()){
    d3.select("#groupSelect")
      .selectAll("option.group")
      .data(groupNames.filter(function(d){ return d != null}))
      .enter()
      .append("option")
        .attr("class", "group")
        .attr("value", function(d,i ){ return i+1})
        .text(function(d,i){ return d})
     $("#groupSelect" ).selectmenu({
      change: function(event, d){
        var group = d.item.value
        var d = cities.filter(function(o){ return o.group == group })[0]
        highlight(d, false, "click", cities)
        $("#stateSelect" ).val("default").selectmenu("refresh")
      }
    })
    d3.select("#groupSelect-button").classed("active", true)
  }

}

function highlight(datum, isCity, action, cities, isGroupList){
  var city, group;
  if(typeof(datum) == "undefined"){
    city = getCity(cities)
    group = getPeerGroup(cities)
  }else{
    city = datum.slug
    group = datum.group
  }

  if(PAGE == "city"){
    return false
  }
/******** UPDATE HOME MAP ************/
    d3.selectAll("circle")
      .transition()
      .attr("r", DESKTOP_RADIUS)
      .style("opacity",1)
    d3.selectAll(".cityText")
      .transition()
      .style("opacity", 0)

  if(action == "click"){
    var op = (isGroupList == true) ? 0 : 1;
    d3.select("#clearSelection")
      .transition()
      .style("opacity",op)

    if(isCity){
      $("#stateSelect" ).val(city).selectmenu("refresh")
      d3.select("#stateSelect-button").classed("active", true)
    }
    if(IS_900()){
      $("#groupSelect" ).val(group).selectmenu("refresh")
    }
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
  if(IS_900()){
    d3.selectAll(".cityText.group_" + group)
      .each(function(){
        this.parentNode.appendChild(this)
      })
      .transition()
      .style("opacity", 1)
  }
  else if(IS_1000()){
    if(isCity){
      d3.selectAll(".cityText.city_" + city)
        .each(function(){
          this.parentNode.appendChild(this)
        })
        .transition()
        .style("opacity", 1)
    }
  }else{
    d3.selectAll(".cityText.group_" + group)
      .each(function(){
        this.parentNode.appendChild(this)
      })
      .transition()
      .style("opacity", 1)
  }
/******** UPDATE TOOLTIP HOME ************/
  if(PAGE == "home"){
    var d = datum;

    d3.selectAll(".groupListGroup")
      .classed("active", false)
      .style("border-left", "7px solid white")

    d3.select(".groupListGroup_" + d.group)
      .classed("active", true)
      .style("border-left", "7px solid " + getGroupColor(d.group))

    if(isCity){
      d3.select("#tooltipTitle").text(d.fullName)
      d3.select("#subtitleGroupName a")
        .attr("href", "peergroup.html?peergroup=" + d.group)
        .text(groupNames[d.group])
      d3.select("#subtitleViewMore a")
        .attr("href", "peergroup.html?peergroup=" + d.group)
      d3.select("#tooltipSubtitle").style("display", "block")
      d3.select("#tooltipViewMore")
        .on("click", function(){ window.location.href = "city.html?city=" + d.slug })
        .text("View city profile")
    }else{
      d3.select("#tooltipTitle").text(groupNames[d.group])
      d3.select("#tooltipSubtitle").style("display", "none")
      d3.select("#tooltipViewMore")
        .on("click", function(){ window.location.href = "peergroup.html?peergroup=" + d.group })
        .text("View peer group profile")
    }
    if(! IS_MOBILE()){
      d3.select("#tooltipContainer")
        .style("border-left", "10px solid " + getGroupColor(d.group))
      d3.select("#tooltipTitle")
        .style("border-bottom", "none")
    }else{
      d3.select("#tooltipContainer")
        .style("border-left", "none")
      d3.select("#tooltipTitle")
        .style("border-bottom", "10px solid " + getGroupColor(d.group))
    }
    var subset = cities.filter(function(o){ return o.group == d.group })
    alphaSort(subset)
    var cols;
    if(IS_PHONE()){ cols = 2}
    else if(IS_MOBILE()){ cols = 3}
    else if(IS_1000()){ cols = 5}
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
            .datum(subset[i*n + j])
            .attr("class", "tooltipCity")
            .on("mouseover", function(d){
              if(IS_1000()){
                d3.selectAll(".cityText.city_" + d.slug)
                  .each(function(){
                    this.parentNode.appendChild(this)
                  })
                  .transition()
                  .style("opacity", 1)
              }
              d3.select("circle.city_" + d.slug)
                .transition()
                .style("opacity",.5)
            })
            .on("mouseout", function(d){
              if(IS_1000()){
                d3.selectAll(".cityText")
                  .transition()
                  .style("opacity", 0)
              }
              d3.select("circle.city_" + d.slug)
                .transition()
                .style("opacity",function(){
                  if(d3.select(this).classed("clicked")){
                    return .5;
                  }else{
                    return 1;
                  }
                })
            })
            .append("a")
            .attr("class", function(){
              if(subset[i*n + j]["slug"] == city && isCity){
                return "inverted"
              }else{ 
                return "standard"
              }
            })
            .attr("href", "city.html?city=" + subset[i*n + j]["slug"] )
            .text(subset[i*n + j]["fullName"])
        }else{
          col.append("div")
            .attr("class", "tooltipCity")
            .text("a")
            .style("color","transparent")
        }
      }
    }
  }else{
/******** UPDATE TOOLTIP GROUP ************/
    d3.select("#groupCity_" + city)
      .style("color", "#353535")
  }
    updateContentMargin()

}

function mouseout(cities, isGroupList){
    if(PAGE == "home"){
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
        var gl = (d.group == 1) ? true: false;
        highlight(d, false, "click", cities, gl)     
      }else{
        var d = cities.filter(function(o){ return o.group == 1 })[0]
        highlight(d, false, "click", cities, isGroupList)   
      }
    }
    else if(PAGE == "group"){
      d3.selectAll(".groupCity")
        .style("color", "#1696d2")
      d3.selectAll("circle")
        .transition()
        .style("opacity",1)
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
  if(! IS_PHONE()){
    menu.on("mouseleave", hideMenu)
  }
  var container = menu.append("div")
    .attr("class", "colContainer")
  
  var columns;
  if(IS_VERY_SMALL_PHONE()){
    columns = 2;
  }
  else if(IS_1200()){
    columns = 3;
  }else{
    columns = 5;
  }

  for(var i = 0; i < columns; i++){
    var col = container.append("div")
      .attr("class", "popupColumn popupColumn_" + (i+1))
    for(var j = i*(60/columns); j < (i+1)*60/columns; j++){
      col.append("div")
        .append("a")
        .attr("href", "city.html?city=" + cities[j]["slug"])
        .attr("class", "popupCity inverted")
        .text(cities[j]["fullName"])
        
    }
  }
  if(IS_SMALL_PHONE()){
    menu.append("div")
      .attr("id", "menuClose")
      .html("&#xd7;")
      .on("click", function(){
          d3.event.stopPropagation();
          hideMenu()
      })
    menu.append("div")
      .attr("id", "menuBack")
      .html("Back")
      .on("click", function(){
          d3.event.stopPropagation();
          hideOneMenu(cities)
      })
    menu.append("div")
      .attr("id", "menuMobileTitle")
      .html("Cities")
  }
}

function showGroupMenu(cities){
  hideMenu();
  if(d3.select(".group.menu.popup").node() != null){
    return false;
  }
  var menu = d3.select("body")
    .append("div")
    .attr("class", "group menu popup")
    if(! IS_PHONE()){
      menu.on("mouseleave", hideMenu)
    }
    var container = menu.append("div")
    .attr("class", "colContainer")
  
  var columns = (IS_1200()) ? 2 : 3;

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
      row
        .append("a")
        .attr("class", "inverted")
        .attr("href", "peergroup.html?peergroup=" + (r*columns+i+1))
        .append("div")
        .attr("class", "popupGroup")
        .text(groupNames[r*columns+i+1])
        .style("border-left", "10px solid " + getGroupColor(r*columns+i+1))
        
    }
  }
  if(IS_SMALL_PHONE()){
    menu.append("div")
      .attr("id", "menuClose")
      .html("&#xd7;")
      .on("click", function(){
          d3.event.stopPropagation();
          hideMenu()
      })
    menu.append("div")
      .attr("id", "menuBack")
      .html("Back")
      .on("click", function(){
          d3.event.stopPropagation();
          hideOneMenu(cities)
      })
    menu.append("div")
      .attr("id", "menuMobileTitle")
      .html("Peer groups")
  }
}
function showMobileMenu(cities){
    hideMenu();
  if(d3.select(".mobile.menu.popup").node() != null){
    return false;
  }
  var menu = d3.select("body")
    .append("div")
    .attr("class", "mobile menu popup")
  if(! IS_PHONE()){
    menu.on("mouseleave", hideMenu)
  }

  var container = menu.append("div")
    .attr("class", "colContainer")
  
  container.append("a")
    .attr("href", "index.html")
    .append("div")
    .attr("class", "mobileMenuRow home")
    .text("Home")

  container.append("div")
    .attr("class","mobileMenuRow cities")
    .text("Cities")
    .on("click", function(){ showCityMenu(cities) })

  container.append("div")
    .attr("class","mobileMenuRow groups")
    .text("Peer groups")
    .on("click", function(){ showGroupMenu(cities) })

  menu.append("div")
    .attr("id", "menuClose")
    .html("&#xd7;")
    .on("click", function(){
        d3.event.stopPropagation();
        hideMenu()
    })

}

function hideMenu(){
  d3.selectAll(".menu.popup").remove();  
}

function hideOneMenu(cities){
 d3.selectAll(".menu.popup").remove();
 showMobileMenu(cities);
}


function buildPage(us, cities, groups){
    updateContentMargin();
    if(PAGE == "home"){
      buildTooltip(cities)
      buildStateSelect(cities)
      if(! IS_MOBILE()){
        drawMap("homeMap", us, cities)
      }else{
        d3.select("#homeMap svg").remove()
        clearSelected(cities)
      }
    }else{
      var group = cities.filter(function(o){ return o.group == getPeerGroup(cities) })
      alphaSort(group)
      buildGroupContent(group, cities)
      if(PRINT == false){ buildBottomContent(group, cities) }
      buildCharts(cities, groups)
      if(PAGE == "group" && PRINT == false){
        if( !IS_MOBILE()){
          drawMap("groupMap", us, group)
        }else{
          d3.select("#groupMap svg").remove()
        }
      }
      else if(PRINT == true){    
        drawMap("printMap", us, group)    
      }
    }
}

d3.json("data/map.json", function(error, us) {
  d3.tsv("data/cities.tsv")
    .row(typeCities)
    .get(function(error, cities){
      d3.csv("data/groups.csv")
        .row(typeGroups)
        .get(function(error, groups){
          buildPage(us, cities, groups)
          d3.select(window)
            .on("resize", function(){
              if(PRINT){
                return false;
              }else{
                buildPage(us, cities, groups)
              }
            });

          var eventType = (IS_PHONE()) ? "click" : "mouseover"
          d3.select(".menuTab.cities")
            .on(eventType, function(){
              showCityMenu(cities)
            })
          if(! IS_PHONE()){
            d3.select(".menuTab.home")
              .on("mouseover", hideMenu)
          }
          d3.select(".menuTab.groups")
            .on(eventType, function(){
              showGroupMenu(cities)
            })
          d3.select(".menuTab.menu")
            .on("click", function(){
              showMobileMenu(cities)
            })
    })
  })
})

