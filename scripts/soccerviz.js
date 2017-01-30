function createSoccerViz() {
    d3.csv("/data/worldcup.csv", function(data) {
        overallTeamViz(data);
        console.log("Running!");
    });

}

function overallTeamViz(incomingData) {
    d3.select("svg.mainsoccerviz")
    .append("g")
    .attr("id", "teamsG")
    .attr("transform", "translate(50,300)")
    .selectAll("g")
    .data(incomingData)
    .enter()
    .append("g")
    .attr("class", "overallG")
    .attr("transform",
        function(d,i) {
            return "translate(" + (i*50) + ", 0)";
        }
    );

    var teamG = d3.selectAll("g.overallG");

    teamG
        .append("circle").attr("r", 0)
        .transition()
        .delay(function(d,i) {return i * 100})
        .duration(500)
        .attr("r", 40)
        .transition()
        .duration(500)
        .attr("r", 20)
        .style("fill", "pink")
        .style("stroke", "black")
        .style("stroke-width", "1px");

    teamG
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", 30)
        .style("font-size", "10px")
        .text(function(d) {
            return d.team
        });

    //Build buttons based on data thats numerical - so we want all attributes except team nad region
    var dataKeys = d3.keys(incomingData[0]).filter(function(el) {
        return el !== "team" && el !== "region";
    });

    d3.select("#soccer-viz-controls").selectAll("button.teams")
        .data(dataKeys).enter()
        .append("button")
        .on("click", buttonClick)
        .html(function(d) {return d});

    function buttonClick(datapoint) {
        var maxValue = d3.max(incomingData, function(el) {
            return parseFloat(el[datapoint ]);
        });
        var tenColorScale = d3.scale.category10(
            ["UEFA", "CONMEBOL", "CAF",  "AFC"]);

        var radiusScale = d3.scale.linear().domain([0,maxValue]).range([2,20]);

        d3.selectAll("g.overallG")
            .select("circle")
            .transition().duration(1000)
            .style("fill", function(p) {
                return tenColorScale(p.region)
            })
            .attr("r", function(p) {
                return radiusScale(p[datapoint ])
            });
    }

    teamG.on("mouseover", highlightRegion);
    teamG.on("mouseout", unHighlight);

    function highlightRegion(d,i) {
        var teamColor = d3.rgb("pink");

        d3.select(this).select("text").classed("highlight", true).attr("y", 10).style("font-size", "20px");
        d3.selectAll("g.overallG").select("circle")
            .style("fill", function(p) {return p.region == d.region ?
            teamColor.darker(.75) : teamColor.brighter(.5)});
        this.parentElement.appendChild(this);

        //How to add images to circles on highlight
        // d3.selectAll("g.overallG").insert("image", "text")
        //     .attr("xlink:href", function(d) {
        //         return "images/" + d.team + ".png";
        //     })
        //     .attr("width", "45px").attr("height", "20px").attr("x", "-22")
        //     .attr("y", "-10");

        d3.selectAll("td.data").data(d3.values(d))
            .html(function(p) {
                return p;
            });
    }

    function unHighlight() {
        d3.selectAll("g.overallG").select("circle").attr("class", "").style("fill", "pink");
        d3.selectAll("g.overallG").select("text")
        .classed("highlight", false).attr("y", 30).style("font-size", "10px");
    }

    d3.text("templates/soccer-viz-modal.html", function(data) {
        d3.select("#soccer-viz").append("div").attr("id", "soccer-viz-modal").html(data);
    });

    d3.html("templates/graphics/soccerball.svg", loadSVG);

    function loadSVG(svgData) {
        d3.select(svgData).selectAll("path").each(function() {
            d3.select("svg").node().appendChild(this);
        });
        d3.selectAll("path").attr("transform", "translate(20,20)");
    }
}