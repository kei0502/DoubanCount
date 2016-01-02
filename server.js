var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();
var app_port = process.env.VCAP_APP_PORT || 3000;
app.use(express.static('public'));
app.get('/name', function (req, res) {
  if(name&&name==req.query.name) {
    res.end(JSON.stringify({'status':1,'years': years, 'tags': tags, 'stars': stars}));
    return;
  }
  else{
    name=req.query.name;
    yearcount={},yearstar={},years=[],tags=[],stars=[];
    getMovies(req.query.name, res);
  }
});

var server = app.listen(app_port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

var url = 'http://movie.douban.com/people/{name}/collect?sort=time&start=0&mode=list';
var name,yearcount={},yearstar={},years=[],stars=[],tagcount={},tags=[];
//var movies=[];
function getMovies(username,res) {
  if(username)
    url='http://movie.douban.com/people/'+username+'/collect?sort=time&start=0&mode=list';
  console.log(url);
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      //爬取列表显示的内容,包括电影名字,评价日期,评分,标签
      $('.list-view .item').each(function () {
        var title=$(this).find('.title').text().trim();
        if(title.indexOf(' ')>-1)
          title=title.substring(0,title.indexOf(' '));
        title=title.trim();
        var date=$(this).find('.date').text().trim();
        var rate=$(this).find('[class^="rating"]').attr('class');
        if(rate)
          rate=rate.substr(6,1);
        var tag=$(this).find('.tags').text().replace('标签: ','').split(' ');
        //var img=$(this).find('.pic img').attr('src');
        var comment=$(this).find('.comment').text();
        //console.log(title+' '+date+' '+rate+' '+tag);
        //按评价年份统计
        var theYear=date.substr(0,4);
        if(yearcount[theYear])
          yearcount[theYear]++;
        else
          yearcount[theYear]=1;
        if(rate==5) {
          if (yearstar[theYear])
            yearstar[theYear]++;
          else
            yearstar[theYear] = 1;
        }
        //按标签统计
        for(var i= 0,length=tag.length;i<length;i++){
          var theTag=tag[i];
          if(theTag!='') {
            if(tagcount[theTag])
              tagcount[theTag]++;
            else
              tagcount[theTag]=1;
          }
        }
        //五星电影
        if(rate==5)
          stars.push({'title':title,'date':date,'comment':comment});
        //movies.push({'title':title,'date':date,'rate':rate,'tags':tag});
      });
      var next=$('div.paginator span.next a');
      if (next.length != 0) {
        url=next.attr('href');
        getMovies(null,res);
      }
      else {
        for(var year in yearcount){
          if(yearstar[year])
            years.push({'year':year,'count':yearcount[year],'star':yearstar[year]});
          else
            years.push({'year':year,'count':yearcount[year],'star':0});
        }
        for(var tag in tagcount){
          tags.push({'text':tag,'size':tagcount[tag]});
        }
        res.end(JSON.stringify({'status':1,'years':years,'tags':tags,'stars':stars}));
      }
    }
    else{
      res.end(JSON.stringify({'status':0}));
    }
  });
}
//getMovies('afra-zhou');