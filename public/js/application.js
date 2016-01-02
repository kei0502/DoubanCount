var name, tags, years, stars;
function showYear() {
  $('#yearList').empty();
  years.sort(function(a,b){return a.year<b.year;});
  for (var i = 0, length = years.length; i < length; i++) {
    var str = '<div class="col-lg-3 col-md-6 text-center"><div class="service-box">';
    str += '<i class="fa fa-3x fa-play-circle wow bounceIn text-faded"></i>';
    str += '<h5><span>' + years[i].year + '</span>年共看了<span>' + years[i].count + '</span>部电影<br/>';
    str += '平均<span>' + Math.round(365 / years[i].count * 1000) / 1000 + '</span>天看一部电影<br/>';
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
    str = '<div class="col-lg-3 col-md-6 col-sm-6 col-xs-6"><a href="#" onclick="javascript:return false;" class="portfolio-box text-center">';
    str += '<div class="star-title">'+stars[i].title+'</div><div class="star-date">'+stars[i].date+'</div>';
    str += '<div class="portfolio-box-caption"><div class="portfolio-box-caption-content">';
    str += stars[i].comment + '</div></div></a></div>';
    $('#starList').append(str);
  }
  if (length == stars.length)
    length = 0;
  $('#refresh').empty();
  str = '<div onclick="showStar(' + length + ');" style="margin-top: 10px;" class="text-center col-lg-12 col-md-12">';
  str += '<i class="fa fa-2x fa-refresh wow bounceIn text-primary"></i></div>';
  $('#refresh').append(str);
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
  $('.error').hide();
  $('.loading').hide();
  $('#nameSearch').click(function () {
    if ($('#nameInput').val() && $('#nameInput').val() != '') {
      $('.loading').css('top', ($(document).scrollTop() + ($(window).height()  - 30) / 2));
      $('.loading').css('left', ($(document).scrollLeft() + ($(window).width() - 150) / 2));
      $('.loading').show();
      $('#nameSearch').attr('disabled','disabled');
      $.ajax({
        type: "get",
        url: "/name?name=" + encodeURIComponent($('#nameInput').val()),
        dataType: 'json',
        success: function (data) {
          if(data.status==1) {
            $('.error').hide();
            $('.loading').hide();
            $('#nameSearch').removeAttr('disabled');
            years = data.years;
            stars = data.stars;
            tags = data.tags;
            if (years)
              showYear();
            if (stars)
              showStar(0);
            if (tags)
              showCloud();
          }
          else {
            $('.error p').html('该豆瓣域名找不到');
            $('.error').show();
            $('.loading').hide();
            $('#nameSearch').removeAttr('disabled');
            $('#yearList').empty();
            $('#starList').empty();
            $('#wordcloud').empty();
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          $('.error p').html('用户数据太庞大,还是本地跑吧');
          $('.loading').hide();
          $('#yearList').empty();
          $('#starList').empty();
          $('#wordcloud').empty();
          $('#nameSearch').attr('disabled','');
          console.log(errorThrown);
        }
      });
    }
  });
})(jQuery);