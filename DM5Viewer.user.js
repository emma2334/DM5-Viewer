// ==UserScript==
// @name         DM5 Viewer
// @version      1.0.4
// @description  Display all comic images at once.
// @author       Emma (emma2334)
// @match        *://www.dm5.com/m*
// @exclude      *://www.dm5.com/manhua-*
// @exclude      *://www.dm5.com/m*-end/
// @match        *://tel.1kkk.com/ch*
// @match        *://tel.1kkk.com/ep*
// @match        *://tel.1kkk.com/other*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

(function(){
  // modify display
  $('.view-comment, .view-paging, .sub-manga').hide();
  $('.yddiv').remove();
  $('#showimage').html('').css('min-height', '100vh');
  $('<style>\
      #showimage.resize img { max-width: 90vw; }\
      #showimage img { margin-bottom: 25px; }\
      .rightToolBar a.text { display: flex; align-items:center; justify-content:center; line-height: 1; }\
      .rightToolBar .text label:hover { cursor: pointer;}\
      #autoNext { position: absolute; visibility: hidden; }\
      #autoNext + label { color: #808080; }\
      #autoNext:checked + label { color: #ffffff; }\
      .white #autoNext:checked + label { color: #212121; }\
    </style>').appendTo('head');

  // get images
  var count=1;
  var getImg = function(){
    $.ajax({
      url: 'chapterfun.ashx',
      data: { cid: DM5_CID, page: count, key:  $("#dm5_key").val(), language: 1, gtk: 6, _cid: DM5_CID, _mid: DM5_MID, _dt: DM5_VIEWSIGN_DT, _sign: DM5_VIEWSIGN },
      type: 'GET',
      success: function (msg) {
        var img = eval(msg);
        for(var i=0; i<img.length; i++){
          $('#showimage').append('<img src="' + img[i] + '" data-page="' + count + '"><br>');
          count++;
        }
        if(count<=DM5_IMAGE_COUNT) getImg();
      }
    });
  };
  getImg();


  // resize image
  $('.rightToolBar a.logo_3').hasClass('active') ? $('#showimage').addClass('resize') : $('#showimage').removeClass('resize');

  $('.rightToolBar a.logo_3').click(function(){
    $(this).hasClass('active') ? $('#showimage').addClass('resize') : $('#showimage').removeClass('resize');
  });

  // auto scroll
  var scroll = false, intervalHandle;
  $(document).keydown(function(e){
    if(e.which==32) e.preventDefault();
  }).keyup(function(e){
    if(e.which==32){
      scroll = scroll ? false : true;
      scroll ? intervalHandle = setInterval(function() { window.scrollBy(0, 1);}, 10) : clearInterval(intervalHandle);
    };
  });

  // change chapter
  $('<a class="text">\
      <div class="tip" id="">換章</div>\
      <input type="checkbox" id="autoNext"><label for="autoNext">ᴀᴜᴛᴏ ɴᴇxᴛ</label>\
    </a>').appendTo('.rightToolBar');
  $('#autoNext')[0].checked = $.cookie("autoNext")!='false' ? true : false;

  var flag=0, next = $('.rightToolBar a.logo_2').eq(0).attr('href');
  $(window).scroll(function(){
    if(scrollY>$('footer .container').last().offset().top-window.innerHeight){
      if(scroll){
        scroll = false
        clearInterval(intervalHandle);
      }
      if(flag==0 && $.cookie("autoNext")!='false'){
        flag=1;
        next ? window.location.href = next : setTimeout(function(){alert('目前為最新章節')}, 500);
      }
    }
    if(scrollY<=$('footer .container').last().offset().top-window.innerHeight) flag=0;
  });

  $('#autoNext').change(function(){
    $.cookie("autoNext", this.checked, { path: "/", domain: cookiedm });
  });
})();