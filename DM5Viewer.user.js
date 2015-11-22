// ==UserScript==
// @name         DM5 Viewer
// @version      0.5
// @description  Display all comic images at once.
// @author       Emma (emma2334)
// @match        http://www.dm5.com/m*
// @exclude      http://www.dm5.com/manhua-*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

(function(){
  // initial
  var a = window.location, b;
  if(a.pathname != DM5_CURL && (a.hash!='' || a.hash!='#ipg1' || a.hash!='#itop')) a.pathname = DM5_CURL;
  var init_num = Number($('#cp_image').attr('src').split('\/')[6].split('_')[0])-1;

  // modify display
  a = $('.view_bt .juh').eq(0);
  a.html('（共' + a.find('span').eq(1).html() + '頁）');
  $('.flr.lvzi').remove();
  $('.view_fy').remove();
  $('#showimage').html('');
  var intro = $('.lan_kk2').eq(0).find('.innr8').eq(0);
  $('#index_mian').remove();

  // get images
  for(i=1; i<=DM5_IMAGE_COUNT; i++){
    $('#showimage').append('<img src="" data-page="' + i + '">');
  }
  for(i=1; i<=DM5_IMAGE_COUNT; i++){
    $.ajax({
      url: "chapterfun.ashx",
      data: { cid: DM5_CID, page: i, key: $("#dm5_key").val(), language: 1, gtk: 6 },
      type: "POST",
      success: function (msg) {
        a = eval(msg)[0];
        $('[data-page="' + (Number(a.split('\/')[6].split('_')[0])-init_num) + '"]').attr('src', a);
      }
    })
  }

  // import css
  $('head').append('<link rel="stylesheet" href="https://cdn.rawgit.com/emma2334/DM5-Veiwer/master/css/style.css">');

  // navbar
  $('<nav id="navbar"><ul><li class="list" title="返回目錄"></li><li class="next" title="下一章"></li><li class="resize" title="自適應寬度"></li><li class="scroll" title="自動滾動"></li><li class="setting" title="設定"></li></ul></nav>\
      <div id="menu">\
        <div class="title">設定</div><div class="content">\
          <div class="innr8">' + intro.html() + '</div><hr>\
          <div class="light">開燈：<input name="light" type="checkbox"></div>\
          <div class="resize">自適應寬度：<input name="resize" type="checkbox"></div>\
          <div class="speed">速度：<input name="speed" type="number" value="1" min="1" style="width: 70px;"> <button>重設</button></div>\
        </div>\
      </div>').appendTo('body');
  if($.cookie("isLight")=='on') $('[name="light"]').attr('checked', true);
  if($.cookie("nautosize")!=null){
    $('.resize').addClass('minify');
    $('[name="resize"]').attr('checked', true);
    $('#showimage').addClass('minify');
  }
  // list
  $('#navbar .list').click(function(){
    window.location.href = $('#index_right .red_lj a')[0].href;
  });
  // next chapter
  $('#navbar .next').click(function(){
    $('#index_right a.redzia').length<2 ? alert('目前為最新章節') : window.location.href = $('#index_right a.redzia')[1].href;
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
  $('[name="speed"]').change(function(){
    autoScroll();
  });
  function autoScroll(){
    clearInterval(intervalHandle);
    var speed = Number($('[name="speed"]').val());
    if(speed<1) speed=1;
    if($('#navbar .scroll').hasClass('stop')) intervalHandle = setInterval(function() { window.scrollBy(0, speed);}, 10);
    else clearInterval(intervalHandle);
  }
  // setting
  $('#navbar .setting').click(function(){
    $('#menu, body, #navbar').toggleClass('open');
  });

  // menu
  $('#menu [name="light"]').click(function(){
    if($('[name="light"]').is(':checked')){
      $('body').addClass('bdcolor').removeClass('bdblackcolor');
      $.cookie("isLight", "on", { path: "/", domain: cookiedm });
    }else{
      $('body').removeClass('bdcolor').addClass('bdblackcolor');
      $.cookie("isLight", "off", { path: "/", domain: cookiedm });
    }
  });
  $('#menu .speed button').click(function(){
    $('[name="speed"]').val(1);
    autoScroll();
  });
})();
