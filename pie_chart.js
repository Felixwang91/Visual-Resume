function pie_chart(source, type, tag)
{
  if(tag == undefined) { tag = null; }
  
  // Changed height from 150 to 180 to add title on top
  var width = 150,
  height = 180,
  radius = Math.min(width, height) / 2;
  var legend_height = 0,
      cube_width = 23,
      cube_height = 15,
      horizontal_offset = 33;
  
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // Begin draw pie chart for GitHub data ==>
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  if(type === "gh")
  {
    height = 200; // override height
    // Function to format a number as a percent
    var per = d3.format(".0%");
    var per_long = d3.format(".2%");
    
    var repoArray = new Array();
    var otherRepoArray = new Array();
  
    var sliceColor = d3.scale.ordinal()
      //.range(["#F47A20","#A76E44","#893E07","#FCAB6F"]);
      .range(["#00CC00","#008500","#34D0BA","#00685A"]);
      
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(20);
  
    var pie = d3.layout.pie()
      .value(function(d,i)
        {
          return d.total;        
        })
      .sort(null)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);
  
    d3.json(source, function(error, data)
    {
      var fullPie = 0;
      var tileID = "gh_" + data.id + "_tile";
      var svg = d3.select("#repos_" + tileID).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
      svg.append("text")
        .text("Contributions by Repository")
        .attr("y",-85)
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .style('text-decoration', 'underline');
        
      svg.append("text")
        .text("by language")
        .attr("y",-73)
        .attr('x', -10)
        .style("text-anchor", "end")
        .style('font-size', '9px')
        .on("mouseout",function()
          {
            d3.select("body").style("cursor","default");
            d3.select(this).style("font-weight","normal");  
          })
        .on("mouseover",function()
          {
            d3.select("body").style("cursor","pointer");
            d3.select(this).style("font-weight","bold");  
          })
          .on("click",function()
          {
              show_languages();
          });
      svg.append("text")
        .text("|")
        .attr("y",-73)
        .attr('x', 0)
        .style("text-anchor", "middle")
        .style('font-size', '9px');
      svg.append("text")
        .text("by repository")
        .attr("y",-73)
        .attr('x', 10)
        .style("text-anchor", "start")
        .style('font-size', '9px')
        .style('font-weight', 'bold');
        
      _.keys(data.repos).forEach(function(d,i)
        {
          var fullname = d.split("/");
          var owner = fullname[0];
          var reponame = fullname[1];
          var forks = data.repos[d].forks;
          var watchers = data.repos[d].watchers;
          var isFork = data.repos[d].isFork;
          var temp_language = data.repos[d].language != null ? data.repos[d].language : 'info not available';
          
          var tempTotal = toInt(data.repos[d].commitCount) + toInt(data.repos[d].commentCount) + toInt(data.repos[d].issueCount);
          
          repoArray[i] = {
            owner: owner,
            repo: reponame,
            language: temp_language,
            total: tempTotal,
            forks: forks,
            watchers: watchers,
            isFork: isFork
          };
          
          otherRepoArray[i] = {
            owner: owner,
            repo: reponame,
            language: temp_language,
            total: tempTotal,
            forks: forks,
            watchers: watchers,
            isFork: isFork
          };
          
          fullPie += tempTotal;
        });
      // Sort array of tag objects by their contribution scores from highest to lowest
      otherRepoArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      if(otherRepoArray.length > 3)
      {
        otherRepoArray = otherRepoArray.slice(3);
      }
  
      repoArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      var otherTotal = 0;
      
      if(repoArray.length > 3)
        { 
          otherTotal = repoArray[3].total;
          for(var i = 4; i < repoArray.length; i++)
          {
            repoArray[3].total += repoArray[i].total;
            otherTotal += repoArray[i].total;
          }
        
          repoArray[3].repo = "other";
          var deleteNum = repoArray.length - 3;
          repoArray.splice(4,deleteNum);
        }
  
      var g = svg.selectAll(".arc")
        .data(pie(repoArray))
        .enter().append("g")
          .attr("class", "arc");
      
      g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i)
          {
            return repoArray[i].repo != 'other' ? sliceColor(repoArray[i].owner + '/' + repoArray[i].repo) : sliceColor(repoArray[i].repo);
          })
        .style("opacity", "1")
        .attr("id",function(d)
          {
            return (tileID + "_pie_" + d.data.repo);
          })
        .attr("title",function(d)
          {
            //$(this).tipsy({gravity: 's', html: true, hoverable: false});
            if(d.data.repo != "other")
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: false});
              var percentage = per_long(d.data.total/fullPie);
              var temp_title = "<table><tr><td class='left'>" + d.data.owner + '/' + d.data.repo + ":</td><td>" + percentage + "</td></tr><tr><td class='left'>language: </td><td>" + d.data.language + "</td></tr><tr><td class='left'>watchers: </td><td>" + d.data.watchers + "</td></tr></table>";
              return temp_title;
            }
            else
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: true});
              var content = "Other Repos:</br></br><table>";
              var other_count = otherRepoArray.length;
              if(other_count > 7)
              {
                for(var i = 0; i < 7; i++)
                {
                  if(otherRepoArray[i].total > 0)
                  {
                    var repofull = otherRepoArray[i].owner + '-' + otherRepoArray[i].repo;
                    var percentage = per_long(otherRepoArray[i].total/fullPie);
                    content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"gh_repo\",\"" + repofull + "\",null,\"" + tileID + "\");'>" + otherRepoArray[i].owner + '/' + otherRepoArray[i].repo + "</a>:</td><td>" + percentage + "</td></tr>");
                  }
                  else
                  {
                    var repofull = otherRepoArray[i].owner + '-' + otherRepoArray[i].repo;
                    var percentage = per_long(otherRepoArray[i].total/fullPie);
                    content += ("<tr class='empty_repo'><td class='left'>" + otherRepoArray[i].owner + '/' + otherRepoArray[i].repo + ":</td><td>" + percentage + "</td></tr>");
                  }
                }
                content += "</table>";
              }
              else
              {
                for(var i = 0; i < otherRepoArray.length; i++)
                {
                  if(otherRepoArray[i].total > 0)
                  {
                    var repofull = otherRepoArray[i].owner + '-' + otherRepoArray[i].repo;
                    var percentage = per_long(otherRepoArray[i].total/fullPie);
                    content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"gh_repo\",\"" + repofull + "\",null,\"" + tileID + "\");'>" + otherRepoArray[i].owner + '/' + otherRepoArray[i].repo + "</a>:</td><td>" + percentage + "</td></tr>");
                  }
                  else
                  {
                    var repofull = otherRepoArray[i].owner + '-' + otherRepoArray[i].repo;
                    var percentage = per_long(otherRepoArray[i].total/fullPie);
                    content += ("<tr class='empty_repo'><td class='left'>" + otherRepoArray[i].owner + '/' + otherRepoArray[i].repo + ":</td><td>" + percentage + "</td></tr>");
                  }
                }
                content += "</table>";
              }
              return content;
            }
          })
        .on("click",function(d)
          {
            if(d.data.repo != "other")
            {
              var repofull = d.data.owner + '-' + d.data.repo;
              //var repofull = d.data.owner + '/' + d.data.repo;
              //String(repofull);
              click(repofull, "gh_repo", tileID);
            }
            else
            {
              tile(source, "gh_otherRepos", null, otherRepoArray, tileID);
            }
          })
        .on("mouseover",function(d)
          { 
            d3.select(this).style("opacity",".6");
            
            var tempID = set_strip(d.data.repo);
            var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#aaa';
            }
          })
        .on("mouseout",function(d)
          {
            d3.select(this).style("opacity","1");
            
            var tempID = set_strip(d.data.repo);
            var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#fff';
            }
          });      
        
  // ===== BEGIN pie chart labeling ===== //
        var pie_legend = svg.selectAll(".pie_legend")
          .data(sliceColor.domain().slice())
        .enter().append("g")
          .attr("class", "pie_legend")
          .attr("transform", function(d, i)
            {
              if(i < 2)
              {
                var vert_offset = i * 15 + i * 5 + 5;
                var horiz_offset = -60;
                return "translate(" + horiz_offset + "," + vert_offset + ")";
              }
              else
              {
                var vert_offset = (i - 2) * 15 + (i - 2) * 5 + 5;
                var horiz_offset = 20;
                return "translate(" + horiz_offset + "," + vert_offset + ")";  
              }
            });
    
      pie_legend.append("rect")
        .attr("x",horizontal_offset)
        .attr("y",legend_height)
        .attr("width", cube_width)
        .attr("height", cube_height)
        .style("fill", function(d,i)
          {
            return sliceColor(d);
          })
        .style("opacity", "1");
    
      pie_legend.append("text")
        .attr("x", horizontal_offset - 3)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d)
          {
            // If the tag/language title is too long, we'll need to shorten it
            var tmp = get_strip(d);
            if(tmp.length > 6)
            {
              return tmp.substr(0,6) + ".."
            }
            return tmp;
          })
        .attr("title",function(d)
          {
            $(this).tipsy({gravity: 's', html: true, hoverable: false});
            return d;
          })
        .on('click', function(d)
            {
              if(d != 'other')
              {
                var temp_total = toInt(data.repos[d].commitCount) + toInt(data.repos[d].issueCount) + toInt(data.repos[d].commentCount);
                if(temp_total > 0){ tile(source, 'gh_repo', set_strip(d), null, tileID); }
              }
              else
              {
                tile(source, "gh_otherRepos", null, otherRepoArray, tileID);
              }
            });
      
      pie_legend.append("text")
        .attr("x", horizontal_offset + cube_width/2)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .attr("fill","white")
        .style("text-anchor", "middle")
        .text(function(d,i)
          {
            var value = repoArray[i].total / fullPie;
            return per(value);
          });
  // ===== END pie chart labeling ===== //
        
    });
    language_pie(source);
  }
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // End draw pie chart for GitHub data <==
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  //
  //
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // Begin draw pie chart for GitHub repo tile data ==>
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  else if(type === "gh_repo")
  {
    // Function to format a number as a percent
    var per = d3.format(".0%");
    var per_long = d3.format(".2%");
    
    var repoArray = new Array();
    var otherRepoArray = new Array();
  
    var sliceColor = d3.scale.ordinal()
      //.range(["#F47A20","#A76E44","#893E07","#FCAB6F"]);
      .range(["#4a036f","#af66d5","#7309aa"]);
      sliceColor.domain(["commits","comments","issues"]);
      
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(20);
  
    var pie = d3.layout.pie()
      .value(function(d,i)
        {
          return d.total;        
        })
      .sort(null)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);
  
    d3.json(source, function(error, data)
    {
      // Some finangling to get the 'tag' to the correct format as a string
      String(tag);
      var tmp = tag.replace("-","/");
      tmp = get_strip(tmp);
      
      var fullPie = 0;
      var tileID = "gh_" + data.id + "_" + set_strip(tag) + "_tile";
      var svg = d3.select("#pieChart_" + tileID).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
      svg.append("text")
        .text("Percentage Contributions")
        .attr("y",-75)
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .style('text-decoration', 'underline')
        .attr("title",function(d)
          {
            $(this).tipsy({gravity: 's', html: true, hoverable: false});
            return "Percentage contributions in " + tmp;
          });
  
      var collaborators = data.repos[tmp].collaborators;
      var contributors = data.repos[tmp].contributors;  
      
      var temp_index = 0;
      _.keys(data.repos).forEach(function(d,i)
        {
          if(d == tmp)
          {
            
            
            
              
              
              var tempTotal = toInt(data.repos[d].commitCount) + toInt(data.repos[d].commentCount) + toInt(data.repos[d].issueCount);
              
              repoArray[0] = {
                activity: "commits",
                total: toInt(data.repos[d].commitCount)
              };
              
              repoArray[1] = {
                activity: "issues",
                total: toInt(data.repos[d].issueCount)
              };

              repoArray[2] = {
                activity: "comments",
                total: toInt(data.repos[d].commentCount)
              };
              fullPie = tempTotal;
            
              temp_index++;
            //console.log("total activities in "+tmp+": "+tempTotal);
          }
        });
      if(temp_index < 1)
      {
        d3.select("#pieChart_" + tileID).append("div")
          .attr("class", "pie_replacement")
          .append("text")
          //.html("We are currently unable to find any of " + data.name + "'s repositories that are related to <b>" + tmp + "</b>.");
          .html("<p>No related repositories found at this time.</p>")
          .style('text-align', 'center');
      }
      else
      {
        // Sort array of tag objects by their contribution scores from highest to lowest
        otherRepoArray.sort(function(a,b)
          {
            return b.total - a.total;
          });
        if(otherRepoArray.length > 3)
        {
          otherRepoArray = otherRepoArray.slice(3);
        }
    
        repoArray.sort(function(a,b)
          {
            return b.total - a.total;
          });
        var otherTotal = 0;
        
        if(repoArray.length > 3)
          { 
            otherTotal = repoArray[3].total;
            for(var i = 4; i < repoArray.length; i++)
            {
              repoArray[3].total += repoArray[i].total;
              otherTotal += repoArray[i].total;
            }
          
            repoArray[3].repo = "other";
            var deleteNum = repoArray.length - 3;
            repoArray.splice(4,deleteNum);
          }
    
        var g = svg.selectAll(".arc")
          .data(pie(repoArray))
          .enter().append("g")
            .attr("class", "arc");
        
        g.append("path")
          .attr("d", arc)
          .style("fill", function(d,i)
            {
              return sliceColor(repoArray[i].activity);
            })
          .style("opacity", "1")
          .attr("id",function(d)
            {
              return (tileID + "_pie_" + d.data.activity);
            })
          .attr("title",function(d)
            {
              //$(this).tipsy({gravity: 's', html: true, hoverable: false});
              
                $(this).tipsy({gravity: 's', html: true, hoverable: false});
                var percentage = per_long(d.data.total/fullPie);
                var temp_title = "<table><tr><td class='left'>" + d.data.activity + ":</td><td>" + percentage + "</td></tr><tr><td class='left'>Amount: </td><td>" + d.data.total + "</td></tr></table>";
                return temp_title;
              
              
            })
          .on("click",function(d)
            {
              var tabn="";
              var othertab1="";
              var othertab2="";
              var activityn=d.data.activity;
              if(d.data.activity=="commits"){
                tabn="tabs_commit_";
                othertab1="tabs_issue_";
                othertab2="tabs_comment_";
              }
              if(d.data.activity=="comments"){
                tabn="tabs_comment_";
                othertab1="tabs_issue_";
                othertab2="tabs_commit_";
              }
              if(d.data.activity=="issues"){
                tabn="tabs_issue_";
                othertab1="tabs_commit_";
                othertab2="tabs_comment_";
              }
              var tabs = document.getElementsByTagName("a");
            for(var x=0; x<tabs.length; x++) {
              name = tabs[x].getAttribute("name");
              if (name == 'tab') {
                if (tabs[x].id == tabn+tileID) {
                  tabs[x].className = "active";
                  
                  d3.select("#grouped_"+tileID).selectAll('svg').remove();
                  d3.select("#stacked_"+tileID).selectAll('svg').remove();
                  d3.select("#legend_"+tileID).selectAll('svg').remove();
                  
                  global_data.forEach(function(d)
                              {
                                  var temp_data = d[0];
                                  var temp_tileID = d[1];
                                  if(global_date_range!=null){
                                    
                                    var cf = crossfilter(temp_data);
                                    set_date_range(temp_data);
                                    var cf = cf.dimension(function(d) { return d.fullDate; });
                                    var temp_data = cf.filterRange([global_date_range[0],global_date_range[1]]).top(Infinity);
                                  
 
                                      if(temp_tileID==tileID){
                                        legend(tileID, "bar", "gh",activityn);
                                        redraw(temp_data, tileID, "stacked",activityn);
                                        redraw(temp_data, tileID, "grouped",activityn);
                                  } 
                                  }
                                  else{
                                    if(temp_tileID==tileID){
                                    empty_graph(tileID, "stacked", "gh");
                                    empty_graph(tileID, "grouped", "gh");
                              }
                                  }  
                              });
                            
                } else if(tabs[x].id == othertab1+tileID || tabs[x].id == othertab2+tileID){
                  tabs[x].className = "";
                }
              }
            }   

            })
          .on("mouseover",function(d)
            { 
              d3.select(this).style("opacity",".6");
              /*
              var tempID = set_strip(d.data.repo);
              var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
              var tempEl = document.getElementById(tempTileID);
              
              if(tempEl != null)
              {
                tempEl.style.backgroundColor='#aaa';
              }*/
            })
          .on("mouseout",function(d)
            {
              d3.select(this).style("opacity","1");
              /*
              var tempID = set_strip(d.data.repo);
              var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
              var tempEl = document.getElementById(tempTileID);
              
              if(tempEl != null)
              {
                tempEl.style.backgroundColor='#fff';
              }*/
            });      
          
        // ===== BEGIN pie chart labeling ===== //
          var pie_legend = svg.selectAll(".pie_legend")
            .data(sliceColor.domain().slice())
          .enter().append("g")
            .attr("class", "pie_legend")
            .attr("transform", function(d, i)
              {
                if(i < 2)
                {
                  var vert_offset = i * 15 + i * 5 + 5;
                  var horiz_offset = -60;
                  return "translate(" + horiz_offset + "," + vert_offset + ")";
                }
                else
                {
                  var vert_offset = (i - 2) * 15 + (i - 2) * 5 + 5;
                  var horiz_offset = 20;
                  return "translate(" + horiz_offset + "," + vert_offset + ")";  
                }
              });
      
        pie_legend.append("rect")
          .attr("x",horizontal_offset)
          .attr("y",legend_height)
          .attr("width", cube_width)
          .attr("height", cube_height)
          .style("fill", function(d,i)
            {
              return sliceColor(repoArray[i].activity);
            })
          .style("opacity", "1");
      
        pie_legend.append("text")
          .attr("x", horizontal_offset - 3)
          .attr("y", cube_height/2 + legend_height)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d,i)
            {
              // If the tag/language title is too long, we'll need to shorten it
              var tmp = get_strip(repoArray[i].activity);
            if(tmp.length > 7)
            {
              return tmp.substr(0,7) + "."
            }
            return tmp;
            })
          .attr("title",function(d)
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: false});
              return d;
            })
          .on('click', function(d)
            {/*
              if(d != 'other')
              {
                var temp_total = toInt(data.repos[d].commitCount) + toInt(data.repos[d].issueCount) + toInt(data.repos[d].commentCount);
                if(temp_total > 0){ tile(source, 'gh_repo', set_strip(d), null, tileID); }
              }
              else
              {
                tile(source, "gh_otherRepos", null, otherRepoArray, tileID);
              }*/
            });
        
        pie_legend.append("text")
          .attr("x", horizontal_offset + cube_width/2)
          .attr("y", cube_height/2 + legend_height)
          .attr("dy", ".35em")
          .attr("fill","white")
          .style("text-anchor", "middle")
          .text(function(d,i)
            {
              var value = repoArray[i].total / fullPie;
              
              return per(value);
            });
        // ===== END pie chart labeling ===== //
      }  
    });
  }
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // End draw pie chart for GitHub repo tile data <==
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  //
  //
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // Begin draw pie chart for all user's stackoverflow data ==>
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  else if(type === "so_all")
  {
    // Function to format a number as a percent
    var per = d3.format(".0%");
    var per_long = d3.format(".2%");
    
    var tagArray = new Array();
    var otherTagArray = new Array();
  
    var sliceColor = d3.scale.ordinal()
      .range(["#F47A20","#A76E44","#893E07","#FCAB6F"]);
      
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(20);
  
    var pie = d3.layout.pie()
      .value(function(d,i)
        {
          return d.total;        
        })
      .sort(null)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);
  
    d3.json(source, function(error, data)
    {
      var fullPie = 0;
      var tileID = "so_" + data.id + "_tile";
      var tipID = tileID + "_tip"
      var svg = d3.select("#pieChart_" + tileID).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
      svg.append("text")
        .text("Contributions by Tag")
        .attr("y",-75)
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .style('text-decoration', 'underline');
      
      if(data.tags != null)
      {
        _.keys(data.tags).forEach(function(d,i)
          {
            var totalContribution = toInt(data.tags[d].answerCount) + toInt(data.tags[d].questionCount) + toInt(data.tags[d].commentCount);
            tagArray[i] = {tag:d,total:totalContribution};
            fullPie += totalContribution;
            otherTagArray[i] = {tag:d,total:totalContribution};
          });

        // Sort array of tag objects by their contribution scores from highest to lowest
        otherTagArray.sort(function(a,b)
          {
            return b.total - a.total;
          });
        if(otherTagArray.length > 3)
        {
          otherTagArray = otherTagArray.slice(3);
        }
    
        tagArray.sort(function(a,b)
          {
            return b.total - a.total;
          });
        var otherTotal = 0;
        
        if(tagArray.length > 3)
          { 
            otherTotal = tagArray[3].total;
            for(var i = 4; i < tagArray.length; i++)
            {
              tagArray[3].total += tagArray[i].total;
              otherTotal += tagArray[i].total;
            }
          
            tagArray[3].tag = "other";
            var deleteNum = tagArray.length - 3;
            tagArray.splice(4,deleteNum);
          }
    
        var g = svg.selectAll(".arc")
          .data(pie(tagArray))
          .enter().append("g")
            .attr("class", "arc");
        
        g.append("path")
          .attr("d", arc)
          .style("fill", function(d,i)
            {
              return sliceColor(tagArray[i].tag);
            })
          .style("opacity", "1")
          .attr("id",function(d)
            {
              return (tileID + "_pie_" + d.data.tag);
            })
          .attr("title",function(d)
            {
              //$(this).tipsy({gravity: 's', html: true, hoverable: true});
              if(d.data.tag != "other")
              {
                $(this).tipsy({gravity: 's', html: true, hoverable: false});
                var percentage = per_long(d.data.total/fullPie);
                //var temp_link = "<a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(d.data.tag) + "\");'>"
                //var temp_title = "<table><tr><td>" + temp_link + d.data.tag + ":</a></td><td>" + temp_link + percentage + "</a></td></tr></table>";
                var temp_title = "<table><tr><td>" + d.data.tag + ":</td><td>" + percentage + "</td></tr></table>";
                return temp_title;
              }
              else
              {
                $(this).tipsy({gravity: 's', html: true, hoverable: true});
                //
                var content = "Other Tags:</br></br><table>";
                var other_count = otherTagArray.length;
                if(other_count > 7)
                {
                  for(var i = 0; i < 7; i++)
                  {
                    var percentage = per_long(otherTagArray[i].total/fullPie);
                    content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(otherTagArray[i].tag) + "\",null,\"" + tileID + "\");'>" + otherTagArray[i].tag + ":</a></td><td class='right'>" + percentage + "</td></tr>");
                  }
                  content += "</table>";
                }
                else
                {
                  for(var i = 0; i < otherTagArray.length; i++)
                  {
                    var percentage = per_long(otherTagArray[i].total/fullPie);
                    content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(otherTagArray[i].tag) + "\",null,\"" + tileID + "\");'>" + otherTagArray[i].tag + ":</a></td><td class='right'>" + percentage + "</td></tr>");
                  }
                  content += "</table>";
                }
                return content;
                //
              }
            })
          .on("click",function(d)
            {
              if(d.data.tag != "other")
              {
                click(d.data.tag, "so_tag", tileID);
              }
              else
              {
                tile(source, "so_otherTags", null, otherTagArray, tileID);
              }
            })
          .on("mouseover",function(d)
            { 
              d3.select(this).style("opacity",".6");
              
              var tempID = set_strip(d.data.tag);
              var tempTileID = "so_" + data.id + "_" + tempID + "_tile";
              var tempEl = document.getElementById(tempTileID);
              
              if(tempEl != null)
              {
                tempEl.style.backgroundColor='#aaa';
              }
            })
          .on("mouseout",function(d)
            {
              d3.select(this).style("opacity","1");
              var temp = '#' + tipID;
              $(temp).hide();
              
              var tempID = set_strip(d.data.tag);
              var tempTileID = "so_" + data.id + "_" + tempID + "_tile";
              var tempEl = document.getElementById(tempTileID);
              
              if(tempEl != null)
              {
                tempEl.style.backgroundColor='#fff';
              }
            });      
          
    // ===== BEGIN pie chart labeling ===== //
          var pie_legend = svg.selectAll(".pie_legend")
            .data(sliceColor.domain().slice())
          .enter().append("g")
            .attr("class", "pie_legend")
            .attr("transform", function(d, i)
              {
                if(i < 2)
                {
                  var vert_offset = i * 15 + i * 5 + 5;
                  var horiz_offset = -60;
                  return "translate(" + horiz_offset + "," + vert_offset + ")";
                }
                else
                {
                  var vert_offset = (i - 2) * 15 + (i - 2) * 5 + 5;
                  var horiz_offset = 20;
                  return "translate(" + horiz_offset + "," + vert_offset + ")";  
                }
              });
      
        pie_legend.append("rect")
          .attr("x",horizontal_offset)
          .attr("y",legend_height)
          .attr("width", cube_width)
          .attr("height", cube_height)
          .style("fill", function(d,i)
            {
              return sliceColor(d);
            })
          .style("opacity", "1");
      
        pie_legend.append("text")
          .attr("x", horizontal_offset - 3)
          .attr("y", cube_height/2 + legend_height)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d)
            {
              // If the tag/language title is too long, we'll need to shorten it
              var tmp = get_strip(d);
              if(tmp.length > 6)
              {
                return tmp.substr(0,6) + ".."
              }
              return tmp;
            })
          .attr("title",function(d)
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: false});
              return d;
            })
          .on('click', function(d)
            {
              if(d != 'other')
              {
                click(get_strip(d), "so_tag", tileID);
              }
              else
              {
                tile(source, "so_otherTags", null, otherTagArray, tileID);
              }
            });
        
        pie_legend.append("text")
          .attr("x", horizontal_offset + cube_width/2)
          .attr("y", cube_height/2 + legend_height)
          .attr("dy", ".35em")
          .attr("fill","white")
          .style("text-anchor", "middle")
          .text(function(d,i)
            {
              var value = tagArray[i].total / fullPie;
              return per(value);
            });
    // ===== END pie chart labeling ===== //
      }
      else
      {
        svg.append("text")
          .text("None")
          .attr("y",0)
          .style("text-anchor", "middle")
          .style('font-size', '10px');
      }
    });
  }
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // End draw pie chart for all user's stackoverflow data <==
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  //
  //
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // Begin draw pie chart for user's stackoverflow tag-specific data ==>
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  else if(type === "so_tag" && tag != null)
  {
    tag = get_strip(tag); // Just in case the tag had to be "set" in order to be passed as a parameter to the funciton
  
    // Function to format a number as a percent
    var per = d3.format(".0%");
    var per_long = d3.format(".2%");
    
    var tagArray = new Array();
    var otherTagArray = new Array();
  
    var sliceColor = d3.scale.ordinal()
      .range(["#F47A20","#A76E44","#893E07","#FCAB6F"]);
      
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(20);
  
    var pie = d3.layout.pie()
      .value(function(d,i)
        {
          return d.total;        
        })
      .sort(null)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);
  
    d3.json(source, function(error, data)
    {
      var fullPie = 0;
      var tagID = set_strip(tag);
      tileID = "so_" + data.id + "_" + tagID + "_tile";
      var tipID = tileID + "_tip"
      var svg = d3.select("#pieChart_" + tileID).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
          
      svg.append("text")
        .text("Related Tags")
        .attr("y",-75)
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .style('text-decoration', 'underline')
        .attr("title",function(d)
          {
            $(this).tipsy({gravity: 's', html: true, hoverable: false});
            return "Tags that share are most often tagged with " + tag;
          });
        
      _.keys(data.tags[tag].relatedTags).forEach(function(d,i)
        {
          var value = data.tags[tag].relatedTags[d];
          fullPie += value;
          tagArray[i] = {tag:d,total:value};
          
          otherTagArray[i] = {tag:d,total:value};
        });
      // Sort array of tag objects by their contribution scores from highest to lowest
      otherTagArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      if(otherTagArray.length > 3)
      {
        otherTagArray = otherTagArray.slice(3);
      }
  
      tagArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      var otherTotal = 0;
        
      if(tagArray.length > 3)
        { 
          otherTotal = tagArray[3].total;
          for(var i = 4; i < tagArray.length; i++)
          {
            tagArray[3].total += tagArray[i].total;
            otherTotal += tagArray[i].total;
          }
        
          tagArray[3].tag = "other";
          var deleteNum = tagArray.length - 3;
          tagArray.splice(4,deleteNum);
        }
  
      var g = svg.selectAll(".arc")
        .data(pie(tagArray))
        .enter().append("g")
          .attr("class", "arc");
      
      g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i)
          {
            return sliceColor(tagArray[i].tag);
          })
        .style("opacity", "1")
        .attr("id",function(d)
          {
            return (tileID + "_pie_" + set_strip(d.data.tag));
          })
        .attr("title",function(d)
          {
            //$(this).tipsy({gravity: 's', html: true, hoverable: true});
            if(d.data.tag != "other")
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: false});
              var percentage = per_long(d.data.total/fullPie);
              //var temp_link = "<a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(d.data.tag) + "\");'>"
              //var temp_title = "<table><tr><td>" + temp_link + d.data.tag + ":</a></td><td>" + temp_link + percentage + "</a></td></tr></table>";
              var temp_title = "<table><tr><td>" + d.data.tag + ":</td><td>" + percentage + "</td></tr></table>";
              return temp_title;
            }
            else
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: true});
              //
              var content = "Other Tags:</br></br><table>";
              var other_count = otherTagArray.length;
              if(other_count > 7)
              {
                for(var i = 0; i < 7; i++)
                {
                  var percentage = per_long(otherTagArray[i].total/fullPie);
                  content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(otherTagArray[i].tag) + "\",null,\"" + tileID + "\");'>" + otherTagArray[i].tag + ":</a></td><td class='right'>" + percentage + "</td></tr>");
                }
                content += "</table>";
              }
              else
              {
                for(var i = 0; i < otherTagArray.length; i++)
                {
                  var percentage = per_long(otherTagArray[i].total/fullPie);
                  content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"so_tag\",\"" + set_strip(otherTagArray[i].tag) + "\",null,\"" + tileID + "\");'>" + otherTagArray[i].tag + ":</a></td><td class='right'>" + percentage + "</td></tr>");
                }
                content += "</table>";
              }
              return content;
              //
            }
          })
        .on("click",function(d)
          {
            if(d.data.tag != "other")
            {
              click(d.data.tag, "so_tag", tileID);
            }
            else
            {
              tile(source, "so_otherTags", null, otherTagArray, tileID);
            }
          })
        .on("mouseover",function(d)
          { 
            d3.select(this).style("opacity",".6");
            
            var tempID = set_strip(d.data.tag);
            var tempTileID = "so_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#aaa';
            }
          })
        .on("mouseout",function(d)
          {
            d3.select(this).style("opacity","1");
            
            var tempID = set_strip(d.data.tag);
            var tempTileID = "so_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#fff';
            }
          });      
        
  // ===== BEGIN pie chart labeling ===== //
        var pie_legend = svg.selectAll(".pie_legend")
          .data(sliceColor.domain().slice())
        .enter().append("g")
          .attr("class", "pie_legend")
          .attr("transform", function(d, i)
            {
              if(i < 2)
              {
                var vert_offset = i * 15 + i * 5 + 5;
                var horiz_offset = -60;
                return "translate(" + horiz_offset + "," + vert_offset + ")";
              }
              else
              {
                var vert_offset = (i - 2) * 15 + (i - 2) * 5 + 5;
                var horiz_offset = 20;
                return "translate(" + horiz_offset + "," + vert_offset + ")";  
              }
            });
    
      pie_legend.append("rect")
        .attr("x",horizontal_offset)
        .attr("y",legend_height)
        .attr("width", cube_width)
        .attr("height", cube_height)
        .style("fill", function(d,i)
          {
            return sliceColor(d);
          })
        .style("opacity", "1");
    
      pie_legend.append("text")
        .attr("x", horizontal_offset - 3)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d)
          {
            // If the tag/language title is too long, we'll need to shorten it
            var tmp = get_strip(d);
            if(tmp.length > 6)
            {
              return tmp.substr(0,6) + ".."
            }
            return tmp;
          })
        .attr("title",function(d)
          {
            $(this).tipsy({gravity: 's', html: true, hoverable: false});
            return d;
          })
        .on('click', function(d)
          {
            if(d != 'other')
            {
              click(get_strip(d), "so_tag", tileID);
            }
            else
            {
              tile(source, "so_otherTags", null, otherTagArray, tileID);
            }
          });
      
      pie_legend.append("text")
        .attr("x", horizontal_offset + cube_width/2)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .attr("fill","white")
        .style("text-anchor", "middle")
        .text(function(d,i)
          {
            var value = tagArray[i].total / fullPie;
            return per(value);
          });
  // ===== END pie chart labeling ===== //
        
    });
  }
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // End draw pie chart for user's stackoverflow tag-specific data <==
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  
  else { alert("Unknown data type parameter passed to pie_chart(): " + type); }
  
  function click(tag, type, id)
  {
    tile(source, type, tag, null, id);
  }
}



function language_pie(source)
{
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // Begin draw pie chart for GitHub languages ==>
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
    
  var width = 150,
  height = 200,
  radius = Math.min(width, height) / 2;
  var legend_height = 0,
      cube_width = 23,
      cube_height = 15,
      horizontal_offset = 33;
      
    // Function to format a number as a percent
    var per = d3.format(".0%");
    var per_long = d3.format(".2%");
    
    var repoArray = new Array();
    var otherRepoArray = new Array();
  
    var sliceColor = d3.scale.ordinal()
      //.range(["#F47A20","#A76E44","#893E07","#FCAB6F"]);
      .range(["#00CC00","#008500","#34D0BA","#00685A"]);
      
    var languageArray = new Array();
    var temp_languageArray = new Array();
    var otherLangArray = new Array();
      
    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(20);
  
    var pie = d3.layout.pie()
      .value(function(d,i)
        {
          return d.total;        
        })
      .sort(null)
      .startAngle(-Math.PI/2)
      .endAngle(Math.PI/2);
  
    d3.json(source, function(error, data)
    {
      var fullPie = 0;
      var tileID = "gh_" + data.id + "_tile";
      var svg = d3.select("#languages_" + tileID).append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
      svg.append("text")
        .text("Contributions by Language")
        .attr("y",-85)
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .style('text-decoration', 'underline');
      
      svg.append("text")
        .text("by language")
        .attr("y",-73)
        .attr('x', -10)
        .style("text-anchor", "end")
        .style('font-size', '9px')
        .style('font-weight', 'bold');
        
      svg.append("text")
        .text("|")
        .attr("y",-73)
        .attr('x', 0)
        .style("text-anchor", "middle")
        .style('font-size', '9px');
      svg.append("text")
        .text("by repository")
        .attr("y",-73)
        .attr('x', 10)
        .style("text-anchor", "start")
        .style('font-size', '9px')
        .on("mouseout",function()
          {
            d3.select("body").style("cursor","default");
            d3.select(this).style("font-weight","normal");  
          })
        .on("mouseover",function()
          {
            d3.select("body").style("cursor","pointer");
            d3.select(this).style("font-weight","bold");  
          })
          .on("click",function()
          {
              show_repos();
          });
        
      _.keys(data.repos).forEach(function(d,i)
        {
          var temp_total = toInt(data.repos[d].commitCount) + toInt(data.repos[d].commentCount) + toInt(data.repos[d].issueCount);
          var temp_language = data.repos[d].language != undefined ? data.repos[d].language : 'unknown';
          String(temp_language);
          if(temp_languageArray[temp_language] == null)
          {
            temp_languageArray[temp_language] = {language:temp_language, total:temp_total};
          }
          else
          {
            temp_languageArray[temp_language].total += temp_total;
          }
          fullPie += temp_total;
        });
      
      _.keys(temp_languageArray).forEach(function(d,i)
        {
          languageArray[i] = temp_languageArray[d];
        });
      otherLangArray = languageArray;
      /*
      _.keys(data.languages).forEach(function(d,i)
        {
          languageArray[i] = {language:d,total:data.languages[d]};
          otherLangArray[i] = {language:d,total:data.languages[d]};
          fullPie += data.languages[d];
        });
      */
      
      // Sort array of tag objects by their contribution scores from highest to lowest
      otherLangArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      if(otherLangArray.length > 3)
      {
        otherLangArray = otherLangArray.slice(3);
      }
  
      languageArray.sort(function(a,b)
        {
          return b.total - a.total;
        });
      var otherTotal = 0;
      
      if(languageArray.length > 3)
        { 
          otherTotal = languageArray[3].total;
          for(var i = 4; i < languageArray.length; i++)
          {
            languageArray[3].total += languageArray[i].total;
            otherTotal += languageArray[i].total;
          }
        
          languageArray[3].language = "other";
          var deleteNum = languageArray.length - 3;
          languageArray.splice(4,deleteNum);
        }
  
      var g = svg.selectAll(".arc")
        .data(pie(languageArray))
        .enter().append("g")
          .attr("class", "arc");
      
      g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i)
          {
            return sliceColor(languageArray[i].language);
          })
        .style("opacity", "1")
        .attr("id",function(d)
          {
            return (tileID + "_pie_" + d.data.language);
          })
        .attr("title",function(d)
          {
            //$(this).tipsy({gravity: 's', html: true, hoverable: false});
            if(d.data.language != "other")
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: false});
              var percentage = per_long(d.data.total/fullPie);
              var temp_title = "<table><tr><td>" + d.data.language + ":</td><td>" + percentage + "</td></tr></table>";
              return temp_title;
            }
            else
            {
              $(this).tipsy({gravity: 's', html: true, hoverable: true});
              var content = "Other Languages:</br></br><table>";
              var other_count = otherLangArray.length;
              if(other_count > 7)
              {
                for(var i = 0; i < 7; i++)
                {
                  var percentage = per_long(otherLangArray[i].total/fullPie);
                  content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"gh_languages\",\"" + set_strip(otherLangArray[i].language) + "\",null,\"" + tileID + "\");'>" + otherLangArray[i].language + ":</a></td></tr>");
                }
                content += "</table>";
              }
              else
              {
                for(var i = 0; i < otherLangArray.length; i++)
                {
                  var percentage = per_long(otherLangArray[i].total/fullPie);
                  content += ("<tr><td class='left'><a class='dark_background' href='javascript:tile(\"" + source + "\",\"gh_languages\",\"" + set_strip(otherLangArray[i].language) + "\",null,\"" + tileID + "\");'>" + otherLangArray[i].language + ":</a></td></tr>");
                }
                content += "</table>";
              }
              return content;
            }
          })
        .on("click",function(d)
          {
            if(d.data.language != "other")
            {
              click(d.data.language, "gh_languages", tileID);
            }
            else
            {
              tile(source, "gh_otherLanguages", null, otherLangArray, tileID);
            }
          })
        .on("mouseover",function(d)
          { 
            d3.select(this).style("opacity",".6");
            
            var tempID = set_strip(d.data.language);
            var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#aaa';
            }
          })
        .on("mouseout",function(d)
          {
            d3.select(this).style("opacity","1");
            
            var tempID = set_strip(d.data.language);
            var tempTileID = "gh_" + data.id + "_" + tempID + "_tile";
            var tempEl = document.getElementById(tempTileID);
            
            if(tempEl != null)
            {
              tempEl.style.backgroundColor='#fff';
            }
          });      
        
  // ===== BEGIN pie chart labeling ===== //
        var pie_legend = svg.selectAll(".pie_legend")
          .data(sliceColor.domain().slice())
        .enter().append("g")
          .attr("class", "pie_legend")
          .attr("transform", function(d, i)
            {
              if(i < 2)
              {
                var vert_offset = i * 15 + i * 5 + 5;
                var horiz_offset = -60;
                return "translate(" + horiz_offset + "," + vert_offset + ")";
              }
              else
              {
                var vert_offset = (i - 2) * 15 + (i - 2) * 5 + 5;
                var horiz_offset = 20;
                return "translate(" + horiz_offset + "," + vert_offset + ")";  
              }
            });
    
      pie_legend.append("rect")
        .attr("x",horizontal_offset)
        .attr("y",legend_height)
        .attr("width", cube_width)
        .attr("height", cube_height)
        .style("fill", function(d,i)
          {
            return sliceColor(d);
          })
        .style("opacity", "1");
    
      pie_legend.append("text")
        .attr("x", horizontal_offset - 3)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d)
          {
            // If the tag/language title is too long, we'll need to shorten it
            var tmp = get_strip(d);
            if(tmp.length > 6)
            {
              return tmp.substr(0,6) + ".."
            }
            return tmp;
          })
        .attr("title",function(d)
          {
            $(this).tipsy({gravity: 's', html: true, hoverable: false});
            return d;
          })
        .on('click', function(d)
          {
            if(d != 'other')
            {
              click(get_strip(d), "gh_languages", tileID);
            }
            else
            {
              tile(source, "gh_otherLanguages", null, otherLangArray, tileID);
            }
          });
      
      pie_legend.append("text")
        .attr("x", horizontal_offset + cube_width/2)
        .attr("y", cube_height/2 + legend_height)
        .attr("dy", ".35em")
        .attr("fill","white")
        .style("text-anchor", "middle")
        .text(function(d,i)
          {
            var value = languageArray[i].total / fullPie;
            return per(value);
          });
  // ===== END pie chart labeling ===== //
        
    });
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  // End draw pie chart for GitHub languages <==
  // ===== ===== ===== ===== ===== ===== ===== ===== ===== //
  function click(language, type, id)
  {
    tile(source, type, language, null, id);
  }
}