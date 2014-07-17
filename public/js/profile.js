$(".user-imgs .thumbnails ul li").hover(
  function() {
    $( this ).removeClass('box-shadow');
    $( this ).append('<div class="like box-shadow"><a href="#" class=><i class="fa fa-heart"></i></button></div>');
    // $(".user-imgs .thumbnails img").css("margin-bottom", "0px");
  }, function() {
    $( ".like" ).remove();
  }
);

$(".user-imgs .thumbnails ul li a").click(
  function() {
    // alert("hello");
    $('#myModal').modal(show);
});
