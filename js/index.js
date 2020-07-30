
 $(document).ready(function(){
    lightbox.option({
      'fadeDuration': 300,
      'imageFadeDuration': 300
    });


    $('.js--scroll-to-about').click(function() {
        $('html, body').animate({scrollTop: $('.about').offset().top}, 1000)
    });

    $('.js--scroll-to-gallery').click(function() {
        $('html, body').animate({scrollTop: $('.gallerysection').offset().top}, 1000)
    });

    
    $('.js--scroll-to-contacts').click(function() {
        $('html, body').animate({scrollTop: $('.contacts').offset().top}, 1000)
    });

    $('.js--scroll-to-sponsors').click(function() {
        $('html, body').animate({scrollTop: $('.sponsors').offset().top}, 1000)
    });

    // amimations onscroll
    $('.js--wp-1').waypoint(function(direction) {
        $('.js--wp-1').addClass('animated fadeIn');
    }, {
        offset: '50%'
    });
    
    $('.js--wp-2').waypoint(function(direction) {
        $('.js--wp-2').addClass('animated fadeInUp');
    }, {
        offset: '50%'
    });
    
     
    
    $('.js--wp-4').waypoint(function(direction) {
        $('.js--wp-4').addClass('animated bounce');
    }, {
        offset: '50%'
    });
 
 
 

  });
