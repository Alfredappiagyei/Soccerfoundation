$(document).ready(function () {
  // Navbar
  $(".navbar-toggler").click(function () {
    if ($(".navbar-collapse").hasClass("show")) {
      $(this).html("&#9776;");
    } else {
      $(this).html("&times;");
    }
  });
  //

  // Video Button
  $(".header-video-btn").click(function () {
    let alt = $(this).children("img").attr("alt");
    if (alt == "Play") {
      $(".header-bg-video").get(0).play();
      $(this).children("img").attr("alt", "Resume");
      $(this).children("img").attr("src", "assets/images/resume-btn.svg");
    } else {
      $(".header-bg-video").get(0).pause();
      $(this).children("img").attr("alt", "Play");
      $(this).children("img").attr("src", "assets/images/play-btn.svg");
    }
  });

  // Modal
  $(".modal").on("shown.bs.modal", function (e) {
    $("body").css({
      paddingRight: "0",
    });
  });
  //
});
