'use strict';

Image.prototype.load = function (url) {
  let thisImg = this;
  let xmlHTTP = new XMLHttpRequest();
  xmlHTTP.open('GET', url, true);
  xmlHTTP.responseType = 'arraybuffer';

  xmlHTTP.onload = function (e) {
    let blob = new Blob([this.response]);
    thisImg.src = window.URL.createObjectURL(blob);
  };

  xmlHTTP.onprogress = function (e) {
    thisImg.completedPercentage = parseInt(e.loaded / e.total * 100);
  };

  xmlHTTP.onloadstart = function () {
    thisImg.completedPercentage = 0;
  };

  xmlHTTP.send();
};

Image.prototype.completedPercentage = 0;

// ======
// Events
// ======

setTimeout(function () {
  console.log('You\'ve been on this page for 1 min now!');
  ga('send', 'event', 'page', 'stay-for-1-min');
}, 60 * 1000);
let gaOpenImageCount = 0;

function increaseOpenImagesCount() {
  if (++gaOpenImageCount == 10) {
    console.log('Opened 10 images!');
    ga('send', 'event', 'image', 'open');
  }
}

function scrollTo(selector) {
  $('html, body').animate({
    scrollTop: $(selector).offset().top + 'px'
  }, 500);
}

$(function () {

  $('a[href^="#"]').click(function (e) {
    e.preventDefault();
    scrollTo($(this).attr('href'));
  });

  $('.js-learn-more').click(function (e) {
    console.log('Clicked');
    ga('send', 'event', 'button', 'click');
  });

  let $body         = $(document.body);
  let $modal        = $('.modal');
  let $popupGallery = $('.popup--gallery');
  let $popupZoom    = $('.popup--zoom');
  let $navList      = $('.nav-list');

  function openModal() {
    $body.addClass('scroll-disabled');
    $modal.addClass('visible');
  }

  $('.nav a').click(function () {
    $navList.removeClass('active');
    $body.removeClass('scroll-disabled');
    $('.burger').removeClass('burger--active');
  });

  $('.js-burger').click(function () {
    $(this).toggleClass('burger--active');
    $body.toggleClass('scroll-disabled');
    $navList.toggleClass('active');
  });

  function showPopupGallery() {
    $popupGallery.css('display', 'block');
  }

  let $popupZoomImg = $('.js-zoom-img');
  let popupZoomIndex = 0;
  let $easter = $('.easter');
  let zoom = 1;
  let x = 0;
  let y = 0;

  function applyTransform() {
    let tempX = 5;

    if (window.innerWidth > 768) {
      tempX = 10;
    }

    if (y < -5 * (zoom - 1) * 5) {
      y = -5 * (zoom - 1) * 5;
    }

    if (y > 5 * (zoom - 1) * 5) {
      y = 5 * (zoom - 1) * 5;
    }

    if (x < -5 * (zoom - 1) * tempX) {
      x = -5 * (zoom - 1) * tempX;
    }

    if (x > 5 * (zoom - 1) * tempX) {
      x = 5 * (zoom - 1) * tempX;
    }

    if (zoom > 3 && popupZoomIndex == 3) {
      $easter.addClass('visible');
    }
    else {
      $easter.removeClass('visible');
    }

    $popupZoomImg.css({
      transform: 'translate(' + (x + 'rem') + ',' + (y + 'rem') + ') scale(' + zoom + ')'
    });
    $easter.css({
      transform: 'translate(' + (x + 'rem') + ',' + (y + 'rem') + ') scale(' + zoom + ')'
    });
  }

  $('.popup-zoomin').click(function () {
    zoom += 1;

    if (zoom > 7) {
      zoom = 7;
    }

    applyTransform();
  });

  $('.popup-zoomout').click(function () {
    zoom -= 1;

    if (zoom < 1) {
      zoom = 1;
    }

    applyTransform();
  });

  $('.popup-up').click(function () {
    y -= 5;
    applyTransform();
  });

  $('.popup-down').click(function () {
    y += 5;
    applyTransform();
  });

  $('.popup-left').click(function () {
    x -= 5;
    applyTransform();
  });

  $('.popup-right').click(function () {
    let incr = 5;
    x += incr;
    applyTransform();
  });

  function bindEvents() {
    $('.js-open-popup').click(function () {
      increaseOpenImagesCount();
      $body.addClass('scroll-disabled');
      $modal.addClass('visible');
      $popupZoom.css('display', 'block');
      popupZoomIndex = +$(this).attr('data-index');

      let img = new Image();
      let src = $(this).siblings('img').attr('src').replace(/\.(png|jpg|jpeg)/, '-full.$1');
      img.load(src);

      let $progressHTML = $('.js-progress');
      let interval = setInterval(function () {
        $progressHTML.attr('value', img.completedPercentage);

        if (img.completedPercentage >= 100) {
          $('.loading-overlay').addClass('hidden');
          $popupZoomImg.replaceWith($(img).addClass('popup-img js-zoom-img'));
          $popupZoomImg = $('.js-zoom-img');
          clearInterval(interval);
        }
      }, 500);
    });

    $('.js-close-popup').click(function () {
      $body.removeClass('scroll-disabled');
      $modal.removeClass('visible');
      $popupGallery.css('display', 'none');
      $popupZoom.css('display', 'none');
    });

    $('.js-next').click(function () {
      increaseOpenImagesCount();
      galleryCurrentIndex++;

      if (galleryCurrentIndex > galleryURLs.length - 1) {
        galleryCurrentIndex = 0;
      }

      updateCurrentIMG();
    });

    $('.js-prev').click(function () {
      increaseOpenImagesCount();
      galleryCurrentIndex--;

      if (galleryCurrentIndex < 0) {
        galleryCurrentIndex = galleryURLs.length - 1;
      }

      updateCurrentIMG();
    });

    $('.js-open-gallery').click(function () {
      let room = $(this).parents('.gallery-slider-item').attr('data-room');
      let index = $(this).parent().index();

      if (+room >= 10) {
        $('.popup-header__text2').css('display', 'block');
      } else {
        $('.popup-header__text2').css('display', 'none');
      }

      galleryURLs = [];
      $(this).parents('.gallery-body').children().each(function (i, el) {
        galleryURLs.push($(el).find('img').attr('src').replace(/\.(png|jpg|jpeg)/, '-full.$1'));
      });
      galleryCurrentIndex = index;
      openModal();
      showPopupGallery();
      updateCurrentIMG();
    });
  }

  bindEvents();

  let galleryURLs = [];
  let galleryCurrentIndex = 0;
  let $galleryCurrentImg = $('.js-current-img');

  function updateCurrentIMG() {
    $galleryCurrentImg.attr('src', galleryURLs[galleryCurrentIndex]);
  }
  
  // Initializing gallery slider
  $('.gallery-slider')
    .addClass('enabled')
    .addClass('owl-carousel')
    .owlCarousel({
      items: 1,
      margin: 1,
      loop: true,
      mouseDrag: false,
      dots: true,
      nav: true,
      navText: [
        '<img src=\'img/icons/angle.svg\' aria-label=\'Вперед\'>',
        '<img src=\'img/icons/angle.svg\' aria-label=\'Назад\'>'
      ]
    })
    .on('changed.owl.carousel', function (event) {
      bindEvents();
    });
    
  // Initializing work slider
  $('.work-slider')
    .addClass('enabled')
    .addClass('owl-carousel')
    .owlCarousel({
      items: 1,
      margin: 1,
      loop: true,
      mouseDrag: false,
      dots: true,
      nav: true,
      navText: [
        '<img src=\'img/icons/angle-white.svg\' aria-label=\'Вперед\'>',
        '<img src=\'img/icons/angle-white.svg\' aria-label=\'Назад\'>'
      ],
      responsive: {
        0: {
          margin: 150
        },
        768: {
          margin: 1
        }
      }
    })
    .on('changed.owl.carousel', function (event) {
      bindEvents();
    });
  
  $('.video').each(function (index, element) {
    let $video = $(element);
    let $link = $video.find('.video__link');
    let $media = $video.find('.video__media');
    let $button = $video.find('.video__button');
    let videoID = $link.attr('href').match(/https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9]+)/)[1];
    $video.on('click', function () {
      if ($video.attr('data-initialized') != null) {
        return;
      }

      $video.attr('data-initialized', '');
      $link.remove();
      $button.remove();
      
      // Creating iframe
      let $iframe = $('<iframe>')
        .addClass('video__media')
        .attr('allowfullscreen', '')
        .attr('allow', 'autoplay')
        .attr('src', 'https://www.youtube.com/embed/' + videoID + '?rel=0&autoplay=1&showinfo=0');
      $video.append($iframe);
    });
    $link.removeAttr('href');
    $video.addClass('video--enabled');
  });
  
  $('.js-parallax-bg').each(function (index, element) {
    let $el = $(element);

    let fn = function fn() {
      let yPos = 0;

      if (window.innerWidth > 768) {
        yPos = -($(window).scrollTop() / 100);
      }

      $el.css({
        backgroundPosition: 'center ' + (-33 + yPos) + 'rem'
      });
    };

    fn();
    $(window).scroll(fn);
  });
});