$('.flr.lvzi').remove();
$('.view_fy').remove();
$('#showimage').html('');
for(i=1; i<=DM5_IMAGE_COUNT; i++){
  $.ajax({
    url: "chapterfun.ashx",
    data: { cid: DM5_CID, page: i, key: $("#dm5_key").val(), language: 1, gtk: 6 },
    type: "POST",
    success: function (msg) {
      eval(msg);
        $('#showimage').append('<img src="' + d[0] + '">');
    }
  })
}
