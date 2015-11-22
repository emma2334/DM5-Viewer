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
  var a = window.location
  if(a.pathname != DM5_CURL && (a.hash!='' || a.hash!='#ipg1' || a.hash!='#itop')) a.pathname = DM5_CURL;
  var init_num = Number($('#cp_image').attr('src').split('\/')[6].split('_')[0])-1;

  // modify display
  a = $('.view_bt .juh').eq(0);
  a.html('（共' + a.find('span').eq(1).html() + '頁）');
  $('.flr.lvzi').remove();
  $('.view_fy').remove();
  $('#showimage').html('');

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
  $('<nav id="navbar"><ul><li class="list" title="返回目錄"></li><li class="next" title="下一章"></li><li class="resize" title="自適應寬度"></li><li class="scroll" title="自動滾動"></li><li class="setting" title="設定"></li></ul>\
    </nav><div id="menu">\
      <div class="title">設定</div><div class="content"></div>\
      </div>').appendTo('body');
  // list
  $('#navbar .list').click(function(){
    window.location.href = $('#index_right .red_lj a')[0].href;
  });
  // next chapter
  $('#navbar .next').click(function(){
    $('#index_right a.redzia').length<2 ? alert('目前為最新章節') : window.location.href = $('#index_right a.redzia')[1].href;
  });
  // resize images
  $('#navbar .resize').click(function(){
    $('#showimage, #navbar .resize').toggleClass('minify');
  });
  // auto scrolling
  var intervalHandle;
  $('#navbar .scroll').click(function(){
    $('#navbar .scroll').toggleClass('stop');
    if($('#navbar .scroll').hasClass('stop')) intervalHandle = setInterval(function() { window.scrollBy(0, 1);}, 10);
    else clearInterval(intervalHandle);

  });
  // setting
  $('#navbar .setting').click(function(){
    $('#menu, body, #navbar').toggleClass('open');
  });
})();
