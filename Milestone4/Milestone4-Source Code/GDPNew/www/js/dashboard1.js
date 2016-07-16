var dashboard1 = (function () {
    var chart;
    function createMap(){
        var color_domain = [0, 1980, 12510, 43880, 138890, 778880];
        var ext_color_domain = [-1, 0, 1980, 12510, 43880, 138890, 778880];
        var legend_labels = ["missing", "0~1980", "1980~12510", "12510~43880", "43880~138890", "138890~778880", "778880+ million $"];
        var color = d3.scale.threshold()
            .domain(color_domain)
            .range(["#FFCC00", "#FAE8E8", "#DCBABA", "#BF8B8B", "#A15D5D", "#842E2E", "#660000"]);
        var axis = d3.svg.axis().tickFormat(d3.format(" 0")).ticks(10).tickValues([1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010]);
        var year = "2010";
        d3.select(window).on("resize", throttle);

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 9])

            .on("zoom", move);


        var width = document.getElementById('Mapcontainer').offsetWidth;
        var height = width / 2.0;

        var topo, projection, path, svg, g;

        var graticule = d3.geo.graticule();

        var tooltip = d3.select("#Mapcontainer").append("div").attr("class", "tooltip hidden");

        setup(width, height);


        function setup(width, height) {
            projection = d3.geo.mercator()
                .translate([(width / 2), (height / 2)])
                .scale(width / 2 / Math.PI);

            path = d3.geo.path().projection(projection);

            svg = d3.select("#Mapcontainer").append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoom)
                .on("click", click)
                .append("g");

            g = svg.append("g");

            legend = svg.selectAll("g.legend")
                .data(ext_color_domain)
                .enter()
                .append("g")
                .attr("class", "legend");

            var ls_w = 20, ls_h = 20;

            legend.append("rect")
                .attr("x", 20)
                .attr("y", function (d, i) {
                    return height - (i * ls_h) - 2 * ls_h;
                })
                .attr("width", ls_w)
                .attr("height", ls_h)
                .style("fill", function (d, i) {
                    return color(d);
                })
                .style("opacity", 0.8);

            legend.append("text")
                .attr("x", 50)
                .attr("y", function (d, i) {
                    return height - (i * ls_h) - ls_h - 4;
                })
                .text(function (d, i) {
                    return legend_labels[i];
                });

        }

        d3.select('#slider').call(d3.slider().axis(axis).min(1965).max(2010).step(5).value(2010
            ).on("slide", function (evt, value) { //设定坐标、最大最小值、步长、初始滑块停留位置、触发事件
                d3.json("data/out" + value.toString() + ".json", function (error, world) {

                    var countries = topojson.feature(world, world.objects.countries).features;

                    topo = countries;
                    redraw(topo);

                });
            }));

        d3.json("data/out" + year + ".json", function (error, world) {

            var countries = topojson.feature(world, world.objects.countries).features;

            topo = countries;
            draw(topo);

        });
        function draw(topo) {
            svg.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", path);


            g.append("path")
                .datum({type: "LineString", coordinates: [
                    [-180, 0],
                    [-90, 0],
                    [0, 0],
                    [90, 0],
                    [180, 0]
                ]})
                .attr("class", "equator")
                .attr("d", path);


            var country = g.selectAll(".country").data(topo);

            country.enter().insert("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("id", function (d, i) {
                    return d.id;
                })
                .attr("title", function (d, i) {
                    return d.properties.name;
                })
                .style("fill", function (d, i) {
                    return d.properties.color;
                });

            //offsets for tooltips
            var offsetL = document.getElementById('Mapcontainer').offsetLeft + 20;
            var offsetT = document.getElementById('Mapcontainer').offsetTop + 10;

            //tooltips
            country
                .on("mousemove", function (d, i) {

                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });

                    tooltip.classed("hidden", false)
                        .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                        .html(d.properties.name + "<br/>" + " GDP(million $):" +
                            "" + d.properties.GDP);

                })
                .on("mouseout", function (d, i) {
                    tooltip.classed("hidden", true);
                });

        }


        function redraw() {
            width = document.getElementById('Mapcontainer').offsetWidth;
            height = width / 2.0;
            d3.select('svg').remove();
            setup(width, height);
            draw(topo);
        }
        function move() {

            var t = d3.event.translate;
            var s = d3.event.scale;
            zscale = s;
            var h = height / 4;


            t[0] = Math.min(
                (width / height) * (s - 1),
                Math.max(width * (1 - s), t[0])
            );

            t[1] = Math.min(
                h * (s - 1) + h * s,
                Math.max(height * (1 - s) - h * s, t[1])
            );

            zoom.translate(t);
            g.attr("transform", "translate(" + t + ")scale(" + s + ")");

            //adjust the country hover stroke width based on zoom level
            d3.selectAll(".country").style("stroke-width", 1.5 / s);

        }


        var throttleTimer;

        function throttle() {
            window.clearTimeout(throttleTimer);
            throttleTimer = window.setTimeout(function () {
                redraw();
            }, 200);
        }


//geo translation on mouse click in map
        function click() {
            var latlon = projection.invert(d3.mouse(this));
            console.log(latlon);
        }


//function to add points and text to the map (used in plotting capitals)
        function addpoint(lat, lon, text) {

            var gpoint = g.append("g").attr("class", "gpoint");
            var x = projection([lat, lon])[0];
            var y = projection([lat, lon])[1];

            gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("class", "point")
                .attr("r", 1.5);

            //conditional in case a point has no associated text
            if (text.length > 0) {

                gpoint.append("text")
                    .attr("x", x + 2)
                    .attr("y", y + 2)
                    .attr("class", "text")
                    .text(text);
            }

        }

    };

    function render() {
        var html =
            '<h1 align="center">World GDP Gross Map</h1>' +
                ' <div id="Mapcontainer">' +
                '</div>' +
                '<div id="slider">' +
                '</div>'

        $("#content").html(html);

        chart = createMap();
    }
    return {
        render: render
    }
}());