// ==UserScript==
// @name         DM5 Viewer
// @version      0.1
// @description  Display all comic images at once.
// @author       Emma (emma2334)
// @match        http://www.dm5.com/m*
// @exclude      http://www.dm5.com/manhua-*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

(function(){
  // modify display
  var a = $('.view_bt .juh').eq(0);
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
        $('[data-page="' + Number(a.split('\/')[6].split('_')[0]) + '"]').attr('src', a);
      }
    })
  }

  // import css
  $('head').append('<link rel="stylesheet" href="https://cdn.rawgit.com/emma2334/DM5-Veiwer/master/css/style.css">');

  // navbar
  $('<nav id="navbar"><ul><li id="prev"></li><li id="list"></li><li id="next"></li><li id="resize"></li><li id="scroll"></li><li id="setting"></li></ul>\
    </nav><div id="menu">\
      <div class="title">設定</div><div class="content"></div>\
      </div>').appendTo('body');
  $('#setting').click(function(){
    $('#menu, body, #navbar').toggleClass('open');
  })
})();
