var name, tags, years, stars;
function showYear() {
  $('#yearList').empty();
  for (var i = 0, length = years.length; i < length; i++) {
    var str = '<div class="col-lg-3 col-md-6 text-center"><div class="service-box">';
    str += '<i class="fa fa-3x fa-play-circle wow bounceIn text-faded"></i>';
    str += '<h5><span>' + years[i].year + '</span>年共看了<span>' + years[i].count + '</span>部电影<br/>';
    str += '平均<span>' + Math.round(years[i].count / 365 * 1000) / 1000 + '</span>天看一部电影<br/>';
    str += '其中五星电影有<span>' + years[i].star + '</span>部</h5></div></div>';
    $('#yearList').append(str);
  }
}
function showStar(starcount) {
  $('#starList').empty();
  var str = '<div class="col-lg-12 col-md-12 text-center"><h5>一共打了<span>' + stars.length + '</span>部五星的电影</h5></div>';
  $('#starList').append(str);

  var length = Math.min(starcount + 10, stars.length);
  for (var i = starcount; i < length; i++) {
    str = '<div class="col-lg-4 col-sm-6"><a href="#" onclick="javascript:return false;" class="portfolio-box">';
    str += '<img src="' + stars[i].img + '" class="img-responsive"><div class="comment"><p>' + stars[i].comment + '</p></div>';
    str += '<div class="portfolio-box-caption"><div class="portfolio-box-caption-content"><div class="project-category">';
    str += stars[i].title + '</div><div class="project-name">' + stars[i].date + '</div></div></div></a></div>';
    $('#starList').append(str);
  }
  if (length == stars.length)
    length = 0;
  str = '<div onclick="showStar(' + length + ');" style="margin-top: 10px;text-align: center;" class="col-lg-2 col-lg-offset-5 col-md-2 col-md-offset-5">';
  str += '<i class="fa fa-2x fa-refresh wow bounceIn text-primary"></i></div>';
  $('#starList').append(str);
}
function showCloud() {
  var width = $('#wordcloud').width(), height = document.documentElement.clientHeight*.7;
  $('#wordcloud').empty();
  cloud.make({
    width: width,
    height: height,
    font: "微软雅黑",
    container: "#wordcloud",
    words: tags
  })

}
(function ($) {
  $('#nameSearch').click(function () {
    if ($('#nameInput').val() && $('#nameInput').val() != '') {
      console.log($('#nameInput').val());
      $.ajax({
        type: "get",
        url: "/name?name=" + encodeURIComponent($('#nameInput').val()),
        dataType: 'json',
        success: function (data) {
          years = data.years;
          stars = data.stars;
          tags = data.tags;
          if (years)
            showYear();
          if (stars)
            showStar(0);
          if(tags)
            showCloud();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(errorThrown);
        }
      });
    }
  });
})(jQuery);