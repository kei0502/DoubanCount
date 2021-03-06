var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();
var app_port = process.env.VCAP_APP_PORT || 3000;
var fs = require('fs');
app.use(express.static('public'));

app.get('/search', function (req, res) {
  if (req.query.name) {
    var name = req.query.name;
    fs.exists(name + '.json', function (exists) {
      if (exists) { //有历史文件
        fs.readFile(name + '.json', 'utf-8', function (err, data) {
          if (data && data != '') {
            var movies = JSON.parse(data);
            if (movies.movies && movies.movies.length > -1) {
              getMovies(name, null, res, movies.movies, movies.movies[0]);
            }
          }
          else
            getMovies(name, null, res, []);
        });
      }
      else
      //没有历史文件
        getMovies(name, null, res, []);
    });
  }
});

var server = app.listen(app_port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

function getMovies(username, url, res, history, lastMovie, movies) {
  if (lastMovie)
    console.log(lastMovie.title);
  var flag = false;
  movies = movies || [];
  if (url == null)
    url = 'http://movie.douban.com/people/' + username + '/collect?sort=time&start=0&mode=list';
  console.log(url);
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      //爬取列表显示的内容,包括电影名字,评价日期,评分,标签
      $('.list-view .item').each(function () {
        var title = $(this).find('.title').text().trim();
        if (title.indexOf(' ') > -1)
          title = title.substring(0, title.indexOf(' '));
        title = title.trim();
        var date = $(this).find('.date').text().trim();
        //历史文件中已经存在
        if (lastMovie && lastMovie.title && lastMovie.title == title && lastMovie.date == date) {
          flag = true;
          return false;//停止each
        }
        var rate = $(this).find('[class^="rating"]').attr('class');
        if (rate)
          rate = rate.substr(6, 1);
        var tag = $(this).find('.tags').text().replace('标签: ', '').split(' ');
        var comment = $(this).find('.comment').text().replace(/\s/g, "");
        var theMovie = {'title': title, 'year': date.substr(0, 4), 'date': date, 'rate': rate, 'tags': tag, 'comment': comment};
        movies.push(theMovie);
      });
      if (!flag) {
        var next = $('div.paginator span.next a');
        if (next.length != 0) {
          url = next.attr('href');
          getMovies(username, url, res, history, lastMovie, movies);
        }
        else {//没有历史文件
          countAll(res, username, movies, history);
        }
      }
      else { //有历史文件
        countAll(res, username, movies, history);
      }
    }
    else {
      res.end(JSON.stringify({'status': 0}));
    }
  });
}
function countAll(res, username, movies, history) {
  movies = movies.concat(history);
  var yearcount = {}, yearstar = {}, years = [], stars = [], tagcount = {}, tags = [];
  for (var i = 0; i < movies.length; i++) {
    //按评价年份统计
    var theYear = movies[i].year;
    if (yearcount[theYear])
      yearcount[theYear]++;
    else
      yearcount[theYear] = 1;
    if (movies[i].rate == 5) {
      if (yearstar[theYear])
        yearstar[theYear]++;
      else
        yearstar[theYear] = 1;
      //五星电影
      stars.push({'title': movies[i].title, 'date': movies[i].date, 'comment': movies[i].comment});
    }
    //按标签统计
    var tag = movies[i].tags;
    for (var j = 0, length = tag.length; j < length; j++) {
      var theTag = tag[j];
      if (theTag != '') {
        if (tagcount[theTag])
          tagcount[theTag]++;
        else
          tagcount[theTag] = 1;
      }
    }
  }
  for (var year in yearcount) {
    if (yearstar[year])
      years.push({'year': year, 'count': yearcount[year], 'star': yearstar[year]});
    else
      years.push({'year': year, 'count': yearcount[year], 'star': 0});
  }
  for (var tag in tagcount) {
    tags.push({'text': tag, 'size': tagcount[tag]});
  }
  fs.writeFile(username + '.json', JSON.stringify({'movies': movies}), function () {
    res.end(JSON.stringify({'status': 1, 'years': years, 'tags': tags, 'stars': stars}));
    return;
  });
}
