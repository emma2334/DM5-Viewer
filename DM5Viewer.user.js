// ==UserScript==
// @name         DM5 Viewer
// @version      0.6.1
// @description  Display all comic images at once.
// @author       Emma (emma2334)
// @match        http://www.dm5.com/m*
// @exclude      http://www.dm5.com/manhua-*
// @exclude      http://www.dm5.com/m*-end/
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

(function(){
  var a, b;
  // modify display
  a = $('.view_bt .juh').eq(0);
  a.html('（共' + a.find('span').eq(1).html() + '頁）');
  $('.flr.lvzi').remove();
  $('.view_fy').remove();
  $('#showimage').html('');
  var intro = $('.lan_kk2').eq(0);
  $('#index_mian').remove();

  // get images
  a=1;
  b = function(){
    $.ajax({
      url: "chapterfun.ashx",
      data: { cid: DM5_CID, page: a, key: $("#dm5_key").val(), language: 1, gtk: 6 },
      type: "POST",
      success: function (msg) {
        var img = eval(msg);
        for(i=0; i<img.length; i++){
          $('#showimage').append('<img src="' + img[i] + '" data-page="' + a + '">');
          a++
        }
        if(a<=DM5_IMAGE_COUNT) b();
      }
    })
  };
  b();

  // import css
  $('head').append('<link rel="stylesheet" href="https://cdn.rawgit.com/emma2334/DM5-Veiwer/master/css/style.css">');

  // create navbar
  $('<nav id="navbar"><ul><li class="list" title="返回目錄"></li><li class="next" title="下一章"></li><li class="resize" title="自適應寬度"></li><li class="scroll" title="自動滾動"></li><li class="setting" title="設定"></li></ul></nav>\
      <div id="menu">\
        <div class="title">設定</div><div class="content">\
          <div class="innr8">' + intro.find('.innr8').eq(0).html() + '</div>\
          <div class="page">跳到第 <input name="page" type="number" min="1" max="' + DM5_IMAGE_COUNT + '" style="width: 40px;">/' + DM5_IMAGE_COUNT + ' 頁 <button>Go</button></div><hr>\
          <div class="light">開燈：<input name="light" type="checkbox"></div>\
          <div class="resize">自適應寬度：<input name="resize" type="checkbox"></div>\
          <div class="resize">自動翻頁：<input name="next" type="checkbox"></div>\
          <div class="speed">速度：<input name="speed" type="number" value="1" min="1" style="width: 70px;"> <button>重設</button></div>\
        </div>\
      </div>').appendTo('body');
  if($.cookie("isLight")=='on') $('[name="light"]').attr('checked', true);
  if($.cookie("nautosize")!=null){
    $('.resize').addClass('minify');
    $('[name="resize"]').attr('checked', true);
    $('#showimage').addClass('minify');
  }
  if($.cookie("autoNext")!='false') $('[name="next"]').attr('checked', true);
  /* -------------
    navbar
  ------------- */
  // list
  $('#navbar .list').click(function(){
    window.location.href = intro.find('.red_lj a')[0].href;
  });
  // next chapter
  $('#navbar .next').click(function(){
    intro.find('a.redzia').length<2 ? alert('目前為最新章節') : window.location.href = intro.find('a.redzia')[1].href;
  });
  // resize images
  $('#navbar .resize, [name="resize"]').click(function(){
    $('#showimage, #navbar .resize').toggleClass('minify');
    if($('#showimage').hasClass('minify')){
      a=true;
      b=true;
    }else{
      a=null;
      b=false;
    }
    $.cookie("nautosize", a, { path: "/", domain: cookiedm });
    $('[name="resize"]').attr('checked', b);
  });
  // auto scrolling
  var intervalHandle;
  $('#navbar .scroll').click(function(){
    speed = $('[name="speed"]').val()
    $('#navbar .scroll').toggleClass('stop');
    autoScroll();
  });
  function autoScroll(){
    clearInterval(intervalHandle);
    if(Number($('[name="speed"]').val())<1){
      alert('速度最少要為1');
      $('[name="speed"]').val(1);
    }
    var speed = Number($('[name="speed"]').val());
    if($('#navbar .scroll').hasClass('stop')) intervalHandle = setInterval(function() { window.scrollBy(0, speed);}, 10);
  }
  // setting
  $('#navbar .setting').click(function(){
    $('#menu, body, #navbar').toggleClass('open');
  });

  /* -------------
    menu
  ------------- */
  // scroll to specific page
  $('[name="page"]').change(function(){
    changePage();
  });
  $('#menu .page button').click(function(){
    $('[name="speed"]').val(1);
    changePage();
  });
  function changePage(){
    a = $('[name="page"]').val();
    if(a<1 || a>DM5_IMAGE_COUNT){
      $('[name="page"]').val('');
      if(a!='') alert('超過頁數範圍了');
    }else $('html,body').animate({scrollTop: $('[data-page="' + a + '"]').offset().top}, 500);
  }
  // change background color
  $('#menu [name="light"]').click(function(){
    if($('[name="light"]').is(':checked')){
      $('body').addClass('bdcolor').removeClass('bdblackcolor');
      $.cookie("isLight", "on", { path: "/", domain: cookiedm });
    }else{
      $('body').removeClass('bdcolor').addClass('bdblackcolor');
      $.cookie("isLight", "off", { path: "/", domain: cookiedm });
    }
  });
  // auto change chapter
  var flag=0;
  $(window).scroll(function(){
    if(scrollY>$('.view_ts').last().offset().top-window.innerHeight && flag==0 && $.cookie("autoNext")!='false'){
      flag=1;
      intro.find('a.redzia').length<2 ? setTimeout(function(){alert('目前為最新章節')}, 500) : window.location.href = intro.find('a.redzia')[1].href;
    }
    if(scrollY<=$('.view_ts').last().offset().top-window.innerHeight) flag=0;
  });
  $('#menu [name="next"]').click(function(){
      $.cookie("autoNext", $('[name="next"]').is(':checked'), { path: "/", domain: cookiedm });
  });
  // auto scrolling
  $('[name="speed"]').change(function(){
    autoScroll();
  });
  $('#menu .speed button').click(function(){
    $('[name="speed"]').val(1);
    autoScroll();
  });
})();
