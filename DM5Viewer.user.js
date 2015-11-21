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
  var a = $('.view_bt .juh').eq(0);
  a.html('（共' + a.find('span').eq(1).html() + '頁）');
  $('.flr.lvzi').remove();
  $('.view_fy').remove();
  $('.view_bt .juh').eq(0).html($(this).find('span').eq(1));
  $('#showimage').html('');
  for(i=1; i<=DM5_IMAGE_COUNT; i++){
    $.ajax({
      url: "chapterfun.ashx",
      data: { cid: DM5_CID, page: i, key: $("#dm5_key").val(), language: 1, gtk: 6 },
      type: "POST",
      success: function (msg) {
        $('#showimage').append('<img src="' + eval(msg)[0] + '">');
      }
    })
  }
})();
