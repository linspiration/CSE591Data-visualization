/**
 * Created by charles on 4/22/14.
 */
var dashboard7 = (function () {
    var chart;
    function createSummaryChart()
    {
        var margin = {top: 30, right: 50, bottom: 50, left: 130},
            width = 960 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var wordCountScale = d3.scale.sqrt()
            .range([0, 20]);

        var svg = d3.select("#gbody").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var pointColor = d3.scale.category20();

        var months = [1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,
            1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,
            1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,
            1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,
            2001,2002,2003,2004,2005,2006,2007,2008,2009,2010];

        var monthsIndex = 0;
        var CountryName = "";
        var changeIndex = 0;
        var id = 0;
        var buttonState = 1;
        d3.select("#gbutton").on("click",  function() {
            if(buttonState == 1)
            {
                if(changeIndex == months.length)
                {
                    changeIndex = 0;
                }
                buttonState = 0;
                id = window.setInterval(change,1400);
            }
            else
            {
                buttonState = 1;
                window.clearInterval(id);
            }
        });

        d3.csv("data/data.csv", function(data) {

            // Coerce the strings to numbers.
            data.forEach(function(d) {
                for(var i = 0; i<months.length; i++)
                {
                    d[months[i]+"x"] = +d[months[i]+"x"];
                    d[months[i]+"y"] = +d[months[i]+"y"];
                    d[months[i]+"g"] = +d[months[i]+"g"];
                }
            });

            // Compute the scales’ domains.
            x.domain(d3.extent(data, function(d) { return Math.max(d["2010x"],d["2009x"],d["2009x"],d["2008x"],d["2007x"],d["2006x"],d["2005x"],d["2004x"],d["2003x"],d["2002x"],d["2001x"]); })).nice();
            y.domain(d3.extent(data, function(d) { return d["1961y"]; })).nice();

            // Add the x-axis.
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"));

            // Add the y-axis.
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(y).orient("left"));

            //Add the Country Name
            svg.append('text')
                .attr({'id': 'countryLabel', 'x': width, 'y': height})
                .style({'font-size': '80px', 'font-weight': 'bold', 'fill': '#aaa'});

            //Add the X Label
            svg.append('text')
                .attr({'id':'xAxisLabel','x':width/3+margin.left,'y':height+30,'text-anchor': 'middle'})
                .text('GDP per capita (US$)');

            //Add the Y Label
            svg.append('text')
                .attr('transform', 'translate(-30, '+ height/2 +')rotate(-90)')
                .attr({'id': 'yLabel', 'text-anchor': 'middle'})
                .text('Urban population ratio');

            svg.select('#countryLabel')
                .attr({'x':width-(months[0]+"").length*45,'y':height})
                .text(months[0]+"")
                .transition()
                .duration(1500)
                .style('opacity',1);

            // Add the points!
            svg.selectAll(".point")
                .data(data)
                .enter().append('circle')
                .attr('class', 'point')
                .attr('cx',function(d){return x(d["1961x"])})
                .attr('cy',function(d){return y(d["1961y"])})
                .attr('r', function(d){return Math.pow(d["1961g"],1/4)/50;})
                //.attr("transform", function(d) { return "translate(" + x(d["2001x"]) + "," + y(d["2001y"]) + ")"; })
                .attr("fill",function(d,i){return pointColor(i);})
                .attr('stroke', 'rgba(0,0,0, .2)')
                .style('opacity', 0.5)
                .on("mouseover", function(d){
                    svg.select('#countryLabel')
                        .attr({'x':width-d["1961z"].length*45,'y':height})
                        .text(d["1961z"])
                        .transition()
                        .style('opacity',1);
                    d3.select(this).transition().duration(500).style('opacity',0.999);
                })
                .on("mouseout", function(d){
                    svg.select('#countryLabel')
                        .attr({'x':width-(months[0]+"").length*45,'y':height})
                        .text(months[monthsIndex]+"")
                        .transition()
                        .duration(1500)
                        .style('opacity',1)
                    d3.select(this).transition().duration(1000).style('opacity',0.5);
                })
                .on("click",function(d){
                    CountryName = d["1961z"];
                    d3.csv("data/hisdata.csv",function(data){
                        chart.selectAll('rect')
                            .data(data)
                            .transition()
                            .duration(500)
                            .ease('quad-out')
                            .attr('width',function(d,i){
                                return histogramX(d[CountryName]);
                            });
                    });
                });
        });

        $( "#slider" ).slider({min: 0,
            max: 49,
            value: 0,
            step: 1,
            slide: function(event, ui) {
                var tooltip = d3.select("#gbody").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                monthsIndex = ui.value;
                changeIndex = monthsIndex+1;
                var xindex = months[ui.value] + "x";
                var yindex = months[ui.value] + "y";
                var zindex = months[ui.value] + "z";
                var gindex = months[ui.value] + "g";
                svg.select('#countryLabel')
                    .attr({'x':width-(months[ui.value]+"").length*45,'y':height})
                    .text(months[ui.value]+"")
                    .transition()
                    .duration(1500)
                    .style('opacity',1);
                d3.csv("data/data.csv", function(data) {
                    svg.selectAll(".point")
                        .data(data)
                        .transition()
                        .duration(500)
                        .ease('quad-out')
                        .attr('cx',function(d){return x(d[xindex])})
                        .attr('cy',function(d){return y(d[yindex])})
                        .attr('r', function(d){return Math.pow(d[gindex],1/4)/50;})
                        .attr("fill", function(d,i){return pointColor(i);})
                        .attr('stroke', 'rgba(0,0,0, .2)')
                        .on("mouseover", function(d){
                            svg.select('#countryLabel')
                                .attr({'x':width-d[zindex].length*45,'y':height})
                                .text(d[zindex])
                                .transition()
                                .style('opacity',1);
                        })
                        .on("mouseout", function(d){
                            svg.select('#countryLabel')
                                .attr({'x':width-(months[ui.value]+"").length*45,'y':height})
                                .text(months[ui.value]+"")
                                .transition()
                                .duration(1500)
                                .style('opacity',1);
                        });
                });
                d3.select("#slidertext").text("Relationship of Population and GDP of"+" "+months[ui.value]);
            }
        });

        function change()
        {
            var xindex = months[changeIndex] + "x";
            var yindex = months[changeIndex] + "y";
            var zindex = months[changeIndex] + "z";
            var gindex = months[changeIndex] + "g";
            svg.select('#countryLabel')
                .attr({'x':width-(months[changeIndex]+"").length*45,'y':height})
                .text(months[changeIndex]+"")
                .transition()
                .duration(1500)
                .style('opacity',1);
            d3.csv("data/data.csv", function(data) {
                svg.selectAll(".point")
                    .data(data)
                    .transition()
                    .duration(500)
                    .ease('quad-out')
                    .attr('cx',function(d){return x(d[xindex])})
                    .attr('cy',function(d){return y(d[yindex])})
                    .attr('r', function(d){return Math.pow(d[gindex],1/4)/50;})
                    .on("mouseover", function(d){
                        svg.select('#countryLabel')
                            .attr({'x':width-d[zindex].length*45,'y':height})
                            .text(d[zindex])
                            .transition()
                            .style('opacity',1);
                    })
                    .on("mouseout", function(d){
                        svg.select('#countryLabel')
                            .attr({'x':width-(months[ui.value]+"").length*45,'y':height})
                            .text(months[ui.value]+"")
                            .transition()
                            .duration(1500)
                            .style('opacity',1);
                    });
            });
            monthsIndex = changeIndex;
            $( "#slider" ).slider({min: 0,
                max:  49,
                value: changeIndex,
                step: 1,
                slide: function(event, ui) {
                    var tooltip = d3.select("#gbody").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

                    monthsIndex = ui.value;
                    changeIndex = monthsIndex+1;
                    var xindex = months[ui.value] + "x";
                    var yindex = months[ui.value] + "y";
                    var zindex = months[ui.value] + "z";
                    var gindex = months[ui.value] + "g";
                    svg.select('#countryLabel')
                        .attr({'x':width-(months[ui.value]+"").length*45,'y':height})
                        .text(months[ui.value]+"")
                        .transition()
                        .duration(1500)
                        .style('opacity',1);
                    d3.csv("data/data.csv", function(data) {
                        svg.selectAll(".point")
                            .data(data)
                            .transition()
                            .duration(500)
                            .ease('quad-out')
                            .attr('cx',function(d){return x(d[xindex])})
                            .attr('cy',function(d){return y(d[yindex])})
                            .attr('r', function(d){return Math.pow(d[gindex],1/4)/50;})
                            .attr("fill", function(d,i){return pointColor(i);})
                            .attr('stroke', 'rgba(0,0,0, .2)')
                            .on("mouseover", function(d){
                                svg.select('#countryLabel')
                                    .attr({'x':width-d[zindex].length*45,'y':height})
                                    .text(d[zindex])
                                    .transition()
                                    .style('opacity',1);
                            })
                            .on("mouseout", function(d){
                                svg.select('#countryLabel')
                                    .attr({'x':width-(months[ui.value]+"").length*45,'y':height})
                                    .text(months[ui.value]+"")
                                    .transition()
                                    .duration(1500)
                                    .style('opacity',1);
                            });
                    });
                    d3.select("#slidertext").text("Relationship of Population and GDP of"+" "+months[ui.value]);
                }
            });
            d3.select("#slidertext").text("Relationship of Population and GDP of"+" "+months[changeIndex]);

            changeIndex = changeIndex + 1;
            if(changeIndex >= months.length)
            {
                window.clearInterval(id);
                buttonState = 1;
            }
        }
        var histogramData = Array(0,0,0,0,0);
        var histogramMargin  = {top:5, right:50,bottom:30,left:130},
            histogramWidth = 960 - histogramMargin.left-histogramMargin.right,
            histogramHeight = 200 - histogramMargin.top-histogramMargin.bottom;

        var rectColor = d3.scale.category10();

        var chart = d3.select('#gbody')
            .append('svg')
            .attr('width',histogramWidth + histogramMargin.left + histogramMargin.right)
            .attr('height',histogramHeight + histogramMargin.top + histogramMargin.bottom)
            .attr('transform','translate('+0+','+500+')')
            .append('g')
            .attr('transform','translate('+ 0 +','+ histogramMargin.top+')');

        var histogramX = d3.scale.linear()
            .domain([0, 100])
            .range([0, histogramWidth]);
        var histogramY = d3.scale.linear()
            .domain([0, 6])
            .range([0,histogramHeight]);
        var barWidth = histogramHeight/histogramData.length;

        var label = ["Trade(%GDP)","Agriculture(%GDP)","Manufacturing(%GDP)","Industry(%GDP)","Services(%GDP)"];
        var bar = chart.selectAll('g')
            .data(histogramData)
            .enter()
            .append('g')
            .attr('transform',function(d,i){
                return 'translate('+ histogramMargin.left +','+ i*barWidth + ')';
            })
            .append('rect')
            .attr('x',function(d){
                return 0;
            })
            .attr('width',function(d,i){
                return histogramX(d);
            })
            .attr('height',function(d){
                return barWidth*4/5;
            })
            .attr("fill",function(d,i){
                return rectColor(i);
            })
            .attr('opacity',0.7)
            .attr('stroke', 'rgba(0,0,0, .2)');
        var text = chart.selectAll();
        var histogramXAxis = d3.svg.axis()
            .scale(histogramX)
            .orient('bottom');
        var histogramYAxis = d3.svg.axis()
            .scale(histogramY)
            .orient('left')
            .ticks(5);
        chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+histogramMargin.left+',0)')
            .call(histogramXAxis);


        var title1 = chart.append("g")
            .attr("transform", 'translate('+ 10 +','+ 20 + ')');

        title1.append("text")
            .attr("class", "title")
            .text(label[0]);

        var title2 = chart.append("g")
            .attr("transform", 'translate('+ 10 +','+ 51 + ')');

        title2.append("text")
            .attr("class", "title")
            .text(label[1]);

        var title3 = chart.append("g")
            .attr("transform", 'translate('+ 10 +','+ 83 + ')');

        title3.append("text")
            .attr("class", "title")
            .text(label[2]);

        var title4 = chart.append("g")
            .attr("transform", 'translate('+ 10 +','+ 115 + ')');

        title4.append("text")
            .attr("class", "title")
            .text(label[3]);

        var title5 = chart.append("g")
            .attr("transform", 'translate('+ 10 +','+ 149 + ')');

        title5.append("text")
            .attr("class", "title")
            .text(label[4]);

    }
    function render() {
        var html =
            '<h1 align="center">Relationship of Population and GDP</h1>' +
                ' <div id="slider">' +
                '</div>' +
                '<p style="padding: 2px 130px 2px 400px" id="slidertext">Relationship of Population and GDP of 1961</p>'+
                '<button id="gbutton">Start/Stop</button>'+
                '<div id="gbody">' +
                '</div>'

        $("#content").html(html);

        chart = createSummaryChart();
    }
    return {
        render: render
    }

}());
