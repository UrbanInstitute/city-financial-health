function drawSketch(citiesData, groupsData, nationalData){
	var VARS = ["credit_score","credit_score_nonWhite","credit_score_white","delinquint_debt","delinquint_debt_amount","mortgate_foreclosure","housing_cost_burdened","eitc","unbanked","no_health_insurance","low_income","unemployment_rate","labor_force_participation","gini","pop_change_00-15"]


	var height = 200
	var margins = {top: 30, bottom: 30, left: 30, right: 30}
	var graphHeight = height - margins.top - margins.bottom

	var yCreditScore = d3.scaleLinear().range([graphHeight,9]).domain([0,800])
	var yPercent = d3.scaleLinear().range([graphHeight,0]).domain([0,1])
	var yDebt = d3.scaleLinear().range([graphHeight,0]).domain([0,2500])
	var yForeclosure = d3.scaleLinear().range([graphHeight,0]).domain([0,.025])
	var ySmallPercent = d3.scaleLinear().range([graphHeight,0]).domain([0,.3])
	var yPop = d3.scaleLinear().range([graphHeight,0]).domain([0,.55])

	var legend = d3.select("#graphic")
		.append("div")
		.attr("id","legend")
	legend.append("div")
		.attr("class", "cityBar legendItem")
	legend.append("div")
		.text("City value")
	legend.append("div")
		.attr("class", "clusterBar legendItem")
	legend.append("div")
		.text("Cluster average")
	legend.append("div")
		.attr("class", "citiesBar legendItem")
	legend.append("div")
		.text("60 cities average")
	legend.append("div")
		.attr("class", "nationalBar legendItem")
	legend.append("div")
		.text("National average")
	
	var barWidth = 40

	var clusters = d3.select("#graphic")
		.selectAll(".clusterContainer")
		.data(groupsData)
		.enter()
		.append("div")
			.attr("class", "clusterContainer")
			.attr("id", function(d){
				return "clusterContainer-" +  d.group
			})
	clusters.append("div")
		.attr("class", "clusterName")
		.text(function(d){ return "Cluster " + d.group})
	var natlAvg = nationalData[1]
	var cityAvg = nationalData[0]
		
	clusters.each(function(cluster){
		// console.log(cluster, this)
		var clusterCities = citiesData.filter(function(o){ return o.group == cluster.group })
		var chartGroup = groupsData.filter(function(o){ return o.group == cluster.group})[0]
		for(var i = 0; i < VARS.length; i++){
			var metric = VARS[i]
			var graph = d3.select(this)
				.append("div")
			graph.append("div")
				.text(metric)
			var svg = graph.append("svg")
				.attr("class", "clusteredSVG")
				.attr("height", graphHeight)
				.attr("width", VARS.length * barWidth)
				.append("g")

			var scale;
			if(metric == "credit_score" || metric == "credit_score_white" || metric == "credit_score_nonWhite"){
				scale = yCreditScore
			}
			else if(metric == "delinquint_debt_amount"){
				scale = yDebt
			}
			else if(metric == "mortgate_foreclosure"){
				scale = yForeclosure
			}
			else if(metric == "unbanked" || metric == "no_health_insurance" || metric == "unemployment_rate"){
				scale = ySmallPercent
			}
			else if( metric == "pop_change_00-15"){
				scale = yPop
			}else{
				scale = yPercent
			}
			svg.append("rect")
				.attr("class", "nationalBar")
				.attr("x", 0)
				.attr("height", graphHeight - scale(+natlAvg[metric]) )
				.attr("width", barWidth * .8)
				.attr("y", scale(+natlAvg[metric]) )


		svg.append("rect")
				.attr("class", "citiesBar")
				.attr("x", barWidth)
				.attr("height", graphHeight - scale(+cityAvg[metric]) )
				.attr("width", barWidth * .8)
				.attr("y", scale(+cityAvg[metric]) )

		svg.append("rect")
				.attr("class", "clusterBar")
				.attr("x", barWidth * 2)
				.attr("height", graphHeight - scale(+chartGroup[metric]) )
				.attr("width", barWidth * .8)
				.attr("y", scale(+chartGroup[metric]) )



			svg.selectAll(".cityBar")
				.data(clusterCities)
				.enter()
				.append("rect")
				.attr("class", "cityBar")
				.attr("x", function(d, i){ return barWidth * (i+3) })
				.attr("height", function(d){ return graphHeight - scale(+d[metric]) })
				.attr("width", barWidth * .8)
				.attr("y", function(d){ return scale(+d[metric]) })



		}


	})





}

d3.csv("data/cities.csv", function(citiesData){
	d3.csv("data/groups.csv", function(groupsData){
		d3.csv("data/national.csv", function(nationalData){
			drawSketch(citiesData, groupsData, nationalData)
		})
	})
})