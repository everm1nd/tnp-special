 /**
  * jQuery Unleash v3
  *
  * Accordion jQuery image slider
  *
  * Created by Ali Alaa 2014
  *
  * http://themeforest.net/user/alialaa
  *
  */
 ;
 (function ($, window, document, undefined) {

     // Create the defaults once
     var pluginName = "unleash",
         defaults = {
             slide_width: "70%",
             duration: 700,
             slide_duration: 6000,
             initially_open_slide: 0,
             pause_onmouseover: true,
             hide_controls: false,
             slideshow: true,
             open_event: 'click',
             collapse_on_mouseout: false,
             onSlideOpen : function() {},
             onEventStart : function() {},
             onDragStart : function() {},
             onDragMove : function() {},
             onDragEnd: function() {},
             onPlay : function() {},
             onPause : function() {},
             onNext : function() {},
             onPrev : function() {},
         };

     // The actual plugin constructor
     function Plugin(element, options) {
         this.element = element;

         this.options = $.extend({}, defaults, options);

         this._defaults = defaults;
         this._name = pluginName;

         $('.unleash_slide img').on('dragstart', function (event) {
             event.preventDefault();
         });
         $('.unleash_slide video').on('click touchstart touchmove touchend', function (event) {
             event.preventDefault();
         });

         this.init();
     }

     function unleash_translate(handle, x, y, unit) {

         handle.css({
             '-o-transform': 'translate(' + x + unit + ',' + y + unit + ')',
             '-ms-transform': 'translate(' + x + unit + ',' + y + unit + ')',
             '-moz-transform': 'translate(' + x + unit + ',' + y + unit + ')',
             '-webkit-transform': 'translate(' + x + unit + ',' + y + unit + ')',
             'transform': 'translate(' + x + unit + ',' + y + unit + ')'
         });
     }

     function unleash_transition(handle, prop, dur, ease) {
         handle.css({
             '-webkit-transition': '-webkit-' + prop + ' ' + dur + 'ms ' + ease,
             '-moz-transition': '-moz-' + prop + ' ' + dur + 'ms ' + ease,
             '-ms-transition': '-ms-' + prop + ' ' + dur + 'ms ' + ease,
             '-o-transition': '-o-' + prop + ' ' + dur + 'ms ' + ease,
             // 'transition': prop + ' ' + dur + 'ms ' + ease
         });
     }

     function cross_translate(handle, val) {
         if ($('html').hasClass('no-csstransitions')) {
             handle.css('left', val);
         } else {
             unleash_translate(handle, val, 0, 'px');
         }
     }

     function check_video(handle, slide, i) {
         if (!$('html').hasClass('no-video')) {
             if (i == (slide - 1)) {
                 if ((handle.find('video').length > 0)) {
                     handle.find('video').get(0).play();
                 }
             } else {
                 if ((handle.find('video').length > 0)) {
                     handle.find('video').get(0).pause();
                 }
             }
         }
     }

     Plugin.prototype = {

         init: function () {
             var $this = this,
                 opts = this.options;
             var el = $(this.element);
             $this.construct();
             next_prev = false;

              var   width = el.width(),
                 slides = el.children('.unleash_slide').length,
                 gap = width / slides;

             $('.unleash_content').css('font-size', $('.unleash_content').height());

             $(window).resize(function (event) {
                 $this.construct();
                 $this.OpenSlide($this.CurrentSlide(), false);
                 $('.unleash_content').css('font-size', $('.unleash_content').height());
             });

             if (opts.slideshow) {
                 el.parent('.unleash_container').append(' <div class="unleash_loader_bg"><div class="unleash_loader"></div></div><div class="unleash_buttons"><i class="icon-left-open-1 unleash_prev"></i><i class="icon-play unleash_play_pause"></i><i class="icon-right-open-1 unleash_next"></i></div>');


                 if (opts.initially_open_slide == 0) {
                     $this.OpenSlide(0);
                     opened = 1;
                 }
                 $this.play();
                 playing = true;
             } else {
                el.parent('.unleash_container').append('<div class="unleash_buttons"><i class="icon-left-open-1 unleash_prev"></i><i class="icon-right-open-1 unleash_next"></i></div>');
                el.siblings('.unleash_buttons').find('.unleash_play_pause').addClass('icon-pause').removeClass('icon-play');
                 playing = false;
             }

             if (opts.initially_open_slide != 0) {
                 $this.OpenSlide(opts.initially_open_slide);
             }

             if (opts.hide_controls) {
                 el.siblings('.unleash_buttons').hide()
             }

             if (opts.collapse_on_mouseout) {
                 el.mouseleave(function () {
                    $this.closeAll();
                });
             }
             

             playing2 = el.siblings('.unleash_buttons').find('.unleash_play_pause').hasClass('icon-pause');
             if(opts.pause_onmouseover){
             el.hover(function() {
                 $this.pause();
             }, function() {
                if(playing2){
                 $this.play();
                }else{
                    $this.pause();
                }
             });
         }


             function get_mouse_touch_pos(ev) {
                 if ($('html').hasClass('no-touch')) {
                     return ev.clientX;
                 } else {
                     return ev.originalEvent.touches[0].pageX;
                 }
             }

             $('.unleash_slide').on('mousemove touchmove', function (event) {
                if($(this).find('.unleash_content').data('parallax')){
                if($(this).find('.unleash_content').length && $(this).hasClass('active')){
                    posX = (event.pageX-$(this).offset().left-($(this).width()/2));
                    posY = (event.pageY-$(this).offset().top-($(this).height()/2));
                    $(this).find('.unleash_content').children().each(function(index, el) {

                
                        $(this).css({
                            'margin-left': -$(this).css('z-index')*posX/100 + 'px',
                            'margin-right': $(this).css('z-index')*posX/100 + 'px',
                            'margin-bottom': $(this).css('z-index')*posY/100 + 'px',
                            'margin-top':  -$(this).css('z-index')*posY/100 + 'px',
                        });
                    });
                }
              }
             });

             var u_event = opts.open_event;

             if (u_event == 'drag') {
                 el.find('.unleash_slide').addClass('unleash_drag')
                 // var start_pos;
                 el.find('.unleash_slide').on('mousedown touchstart', function (event) {

                    $slide = $(this);
                    opts.onDragStart.call( this );

                    playing4 = el.siblings('.unleash_buttons').find('.unleash_play_pause').hasClass('icon-pause');

                    if(!el.find('.unleash_slide').eq(0).hasClass('active')){
                        distance = el.find('.unleash_slide').eq(1).position().left;
                    }else{
                        distance = el.find('.unleash_slide').eq(3).position().left - el.find('.unleash_slide').eq(2).position().left;
                    }
                    
                       if(playing4){
                     $this.pause();
                     }
                       
                     event.preventDefault();
                     $(this).addClass("unleash_slide_mouseDown");
                     end_pos = 0;
                     
                     start_mouse = get_mouse_touch_pos(event);
                     start_slide = ($slide.position().left);

                     start_poss = {};

                     el.find('.unleash_slide').each(function(index, el) {
                            start_poss[index] = $(this).position().left;
                        });


                     var dragged_slide = $(this).index() + 1;
                     var current_slide = el.find('.active').index() + 1;
                     var is_active = $(this).hasClass('active');


                     var mX = 0;
                     mouse_dir = 'left';
                     $(document).on('mousemove touchmove', function (event) {

                        opts.onDragMove.call( this );

                        if (get_mouse_touch_pos(event) < mX) {
                             mouse_dir = 'left';
                         } else {
                             mouse_dir = 'right';
                         }
                         mX = get_mouse_touch_pos(event);

                         unleash_transition(el.find('.unleash_slide'), 'none', '', '');
                         end_pos = get_mouse_touch_pos(event);
                         slides_num = el.children('.unleash_slide').length;

                        if(!$this.CurrentSlide() && dragged_slide != 1){
                             if ((end_pos - start_mouse)<0){
                            el.find('.unleash_slide').each(function(index, el) {
                                sign = (index > (dragged_slide-1)) ? -((slides_num/(dragged_slide-1))-(index/(dragged_slide-1))) : (index/(dragged_slide-1));
                                cross_translate($(this),start_poss[index] + sign*(end_pos - start_mouse));         
                             });
                             }else{
                                
                                el.find('.unleash_slide').each(function(index, el) {
                                        if(index == (dragged_slide-1)){
                                            sign = 1;
                                        }else{
                                            if(index < (dragged_slide-1)){
                                                sign = (index)/(slides-(dragged_slide-1));
                                            }else{
                                                sign = ((slides_num-index))/((slides_num-dragged_slide+1));
                                            }
                                        }
                                
                                if(index >= (dragged_slide-1)){
                                    cross_translate($(this),start_poss[index] + sign*(end_pos - start_mouse));  
                                   } else{
                                
                                cross_translate($(this),start_poss[index] + -sign*(end_pos - start_mouse));  
                                 }
                             });
                           
                             }
                        
                    }
                    else{
                        if(is_active && dragged_slide != 1){

                            dis = distance + (end_pos - start_mouse);
                            curr_wdth = el.find('.unleash_slide').eq(dragged_slide-1).width();
                            if(((end_pos - start_mouse) > 0) && (dis < curr_wdth)){

                                cross_translate($slide,start_poss[dragged_slide-1] + (end_pos - start_mouse));
                            }else if(((end_pos - start_mouse) < 0)){
                                el.find('.unleash_slide').each(function(index, el) {
                                    sign = (index > (dragged_slide-1)) ? (slides/index) : (index/(dragged_slide-1));
                                    cross_translate($(this),start_poss[index] + 0.03*sign*(end_pos - start_mouse));         
                                 });
                            }else if( (dis > curr_wdth)){
                                 //   el.find('.unleash_slide').each(function(index, el) {
                                 //    sign = (index > (dragged_slide-1)) ? (slides/index) : (index/(dragged_slide-1));
                                 //    opened = (index == (dragged_slide-1)) ? curr_wdth-distance-start_poss[index] : 0;
                                 //    cross_translate($(this),start_poss[index] + opened + 0.03*sign*(end_pos - start_mouse));         
                                 // });
                            }
                        
                        }else{
                            if(dragged_slide>current_slide){

                                dis = (Math.abs(distance-(end_pos - start_mouse)));
                                curr_wdth = el.find('.unleash_slide').eq(dragged_slide-1).width();
                                if(((end_pos - start_mouse) < 0) && (dis < curr_wdth)){

                                    el.find('.unleash_slide').each(function(index, el) {
                                        if(index >= current_slide && index < dragged_slide && dragged_slide != 1){
                                        cross_translate($(this),start_poss[index] + (end_pos - start_mouse));
                                        }
                                    });
                                
                                }else if(((end_pos - start_mouse) > 0)){
                                    el.find('.unleash_slide').each(function(index, el) {
                                    sign = (index > (dragged_slide-1)) ? (slides/index) : (index/(dragged_slide-1));
                                    cross_translate($(this),start_poss[index] + 0.01*sign*(end_pos - start_mouse));         
                                 });
                                }
                            }else{

                                dis = (Math.abs((end_pos - start_mouse)+distance));
                                curr_wdth = el.find('.unleash_slide').eq(dragged_slide-1).width();
                                if(((end_pos - start_mouse) > 0) && (dis < curr_wdth)){
                                     el.find('.unleash_slide').each(function(index, el) {
                                    if(index <= (current_slide-1) && index >= (dragged_slide-1) && dragged_slide != 1){
                                    cross_translate($(this),start_poss[index] + (end_pos - start_mouse));
                                    }
                                });
                    
                                }else if((end_pos - start_mouse) < 0){
                                    el.find('.unleash_slide').each(function(index, el) {
                                    sign = (index > (dragged_slide-1)) ? (slides/index) : (index/(dragged_slide-1));
                                    cross_translate($(this),start_poss[index] + 0.01*sign*(end_pos - start_mouse));         
                                 });
                                }
                            }
                        }
                    }
                        

                     });
                 }).on('mouseup touchend', function (event) {
                     opts.onDragEnd.call( this );
                     $slide = $(this);
                     $(this).removeClass("unleash_slide_mouseDown");
                     $(document).unbind('mousemove touchmove');
                     var slide = $(this).index() + 1;
                     var current_slide = el.find('.active').index() + 1;

                    if(slide != 1){
                         if($(this).hasClass('active')){
                             if ((mouse_dir == 'left')){
                                 $this.OpenSlide(slide);
                                 (playing4) ? $this.play() : $this.pause();

                             } else {
                                 $this.stopSlideshow();
                                 $this.OpenSlide(slide-1);
                                 next_prev = true;
                                 (playing4) ? $this.play() : $this.pause();
                                 next_prev = false;
                             }
                         }else{
                            if((slide > current_slide)){
                                if ((mouse_dir == 'left')){
                                 $this.stopSlideshow();
                                 $this.OpenSlide(slide);
                                 next_prev = true;
                                 (playing4) ? $this.play() : $this.pause();
                                 next_prev = false;
                             }else{
                                (current_slide) ? $this.OpenSlide(current_slide) : $this.OpenSlide(slide-1);
                                (playing4) ? $this.play() : $this.pause();
                             }
                         }else{
                            if ((mouse_dir == 'left')){
                                 $this.OpenSlide(current_slide);
                                 (playing4) ? $this.play() : $this.pause();
                             }else{
                                $this.stopSlideshow();
                                 $this.OpenSlide(slide-1);
                                 next_prev = true;
                                 (playing4) ? $this.play() : $this.pause();
                                 next_prev = false;
                             }
                         }
                     }
                   }
                 });


             } else {

                 el.find('.unleash_slide').on(u_event, function (event) {
                     // event.preventDefault();
                     opts.onEventStart.call( this );
                     // loader = $(this).parent('.unleash_slider').siblings('.unleash_loader_bg').find('.unleash_loader');
                     // $this.pause();
                     // loader.css("left", "-101%");
                     // $this.play();
                     playing3 = el.siblings('.unleash_buttons').find('.unleash_play_pause').hasClass('icon-pause');
                     var slide = $(this).index() + 1;
                     var current = $this.CurrentSlide();
                     if((slide != current)){

                     if(playing3){
                     $this.stopSlideshow();
                     next_prev = true;
                     $this.play();
                     next_prev = false;
                     }else{
                        $this.stopSlideshow();
                     }

                     $this.OpenSlide(slide);
                     }
                 });
             }

             // el.find('.unleash_slide').on(u_event, function (event) {
             //         event.preventDefault();
             //         var slide = $(this).index() + 1;
             //         $this.OpenSlide(slide);
             //     });

             el.siblings('.unleash_buttons').find('.unleash_next').click(function () {
                 next_prev = true;
                 $this.goToNext();
                 next_prev = false;

             });

             el.siblings('.unleash_buttons').find('.unleash_prev').click(function () {
                 next_prev = true;
                 $this.goToPrev();
                 next_prev = false;
             });

              el.siblings('.unleash_buttons').find('.unleash_play_pause').click(function () {
                 if ($(this).parent('.unleash_buttons').siblings('.unleash_loader_bg').find('.unleash_loader').is(':animated')) {
                     $this.pause();
                     playing2 = false;
                 } else {
                     $this.play();
                     playing2 = true;
                 }
             });
         },

         construct: function () {
             var el = $(this.element),
                 opts = this.options,
                 width = el.width(),
                 slides = el.children('.unleash_slide').length,
                 slide_width = parseFloat(opts.slide_width) / 100,
                 gap = width / slides;
                // unleash_transition($('.unleash_slide'), 'transform', opts.duration, 'ease');
             el.find('.unleash_slide').width(slide_width * width);
             height = el.find('.unleash_slide img').height(),
             el.height(height);
             el.find('.unleash_slide').height(height);

             el.children('.unleash_slide').each(function (index, slide) {
                 cross_translate($(this), index * gap);
                 if (!$('html').hasClass('no-video')) {
                     if ($(this).find('video').length > 0) {
                         $(this).find('video').get(0).pause();
                     }
                 }
             });
         },

         OpenSlide: function (slide, animate) {

             animate = typeof animate !== 'undefined' ? animate : true;

             var el = $(this.element),
                 opts = this.options,
                 current_slider_width = el.width(),
                 current_slide_width = el.children('.unleash_slide').eq(slide - 1).width(),
                 slides = el.children('.unleash_slide').length,
                 gap = (current_slider_width - current_slide_width) / (slides - 1);

            el.children('.unleash_slide').each(function(index, el) {

                 if($(this).find('.unleash_content').length){
                    
                    if(index != slide-1){
                    $(this).find('.unleash_content').children().each(function(index, el) {
                        ent = $(this).data('entrance');
                        exit = $(this).data('exit');
                        $(this).removeClass(ent);
                        
                            if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                                $(this).fadeOut(300);
                            }else{
                                 $(this).css({
                                     '-webkit-animation-delay': '0ms',
                                     '-moz-animation-delay': '0ms',
                                     'animation-delay': '0ms',
                                 });
                                $(this).addClass(exit);
                            }
                         
                    });
                    }

                 } else if($(this).find('.unleash_caption').length){

                    ent = $(this).find('.unleash_caption').data('entrance');
                    exit = $(this).find('.unleash_caption').data('exit');
                    $(this).find('.unleash_caption').removeClass(ent);
                    if(index != slide-1){
                        if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                            $(this).find('.unleash_caption').fadeOut(300);
                        }else{
                            $(this).find('.unleash_caption').addClass(exit);
                        }
                     }

                 }

            });

             el.children('.unleash_slide').removeClass('active');
             if (animate) {
                 unleash_transition($('.unleash_slide'), 'transform', opts.duration, 'ease');
             } else {
                 unleash_transition($('.unleash_slide'), 'none', '', '');
             }


             if (slide != 0) {
                 el.children('.unleash_slide').eq(slide - 1).addClass('active');

                 if (!$('html').hasClass('no-csstransitions')) {
                     el.children('.unleash_slide').each(function (i) {

                         check_video($(this), slide, i);

                         if ((i / (slide - 1)) > 1) {
                             s = current_slide_width - gap;
                         } else {
                             s = 0;
                         }

                         var val = (i * gap) + s;
                         // unleash_transition($(this),'transform','700','ease');
                         unleash_translate($(this), val, 0, 'px');
                     });
                 } else {
                     el.children('.unleash_slide').each(function (i) {

                         check_video($(this), slide, i);

                         if ((i / (slide - 1)) > 1) {
                             s = current_slide_width - gap;

                         } else {
                             s = 0;
                         }
                         var val = (i * gap) + s + 'px';
                         if (animate) {
                             $(this).stop().animate({
                                 left: val
                             }, {
                                 duration: opts.duration,
                                 complete: function () {      
                            opts.onSlideOpen.call( this );
                           }
                             });
                         } else {
                             $(this).css({
                                 left: val
                             });
                         }
                     });
                 }
                 if(el.children('.unleash_slide').eq(slide - 1).find('.unleash_content').length){
                    this.OpenContent(slide);
                 } else if(el.children('.unleash_slide').eq(slide - 1).find('.unleash_caption').length){
                    this.OpenCaption(slide);
                 }
                 count = 1;
                 el.children('.unleash_slide').eq(slide - 1).add(el.children('.unleash_slide').eq(slide)).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',   
                    function(e) {
                        if((e.originalEvent.propertyName.slice(-9) === 'transform') && (count <= 1)){
                            count++;
                         opts.onSlideOpen.call( this );
                         }
                  });
                 
             }
             
         },

         OpenCaption: function (slide) {
             var el = $(this.element);
             var s = el.find('.unleash_slide').eq(slide-1).find('.unleash_caption');
             if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                s.fadeIn(300);
             }else{
             s.show();
             s.addClass('animated ' + s.data('entrance'));
             s.removeClass(s.data('exit'));
           }
         },
         OpenContent: function (slide) {
             var el = $(this.element);
             var s = el.find('.unleash_slide').eq(slide-1).find('.unleash_content');
             if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                    s.show();
                    s.children().each(function(index, el) {
                        $(this).fadeIn(300);
                     $(this).css({
                         'position': 'absolute',
                         'z-index': $(this).data('z'),
                         'top': ($(this).data('pos')) ? $(this).data('pos')[0] + '%' : 0,
                         'right': ($(this).data('pos')) ? $(this).data('pos')[1] + '%' : 0,
                         'bottom': ($(this).data('pos')) ? $(this).data('pos')[2] + '%' : 0,
                         'left': ($(this).data('pos')) ? $(this).data('pos')[3] + '%' : 0,
                         'width': $(this).data('width') + '%',
                     });
                 });
             }else{
                 s.show();
                 s.children().each(function(index, el) {
                     $(this).css({
                         'position': 'absolute',
                         'z-index': $(this).data('z'),
                         'top': ($(this).data('pos')) ? $(this).data('pos')[0] + '%' : 0,
                         'right': ($(this).data('pos')) ? $(this).data('pos')[1] + '%' : 0,
                         'bottom': ($(this).data('pos')) ? $(this).data('pos')[2] + '%' : 0,
                         'left': ($(this).data('pos')) ? $(this).data('pos')[3] + '%' : 0,
                         'width': $(this).data('width') + '%',
                         '-webkit-animation-duration': ($(this).data('dur')) ? $(this).data('dur') + 'ms' : '1000ms',
                         'animation-duration': ($(this).data('dur')) ? $(this).data('dur') + 'ms' : '1000ms',
                         '-webkit-animation-delay': $(this).data('delay') + 'ms',
                         '-moz-animation-delay': $(this).data('delay') + 'ms',
                         'animation-delay': $(this).data('delay') + 'ms'
                     });
                     $(this).addClass('animated ' + $(this).data('entrance'));
                     if($(this).data('entrance') != $(this).data('exit')){
                     $(this).removeClass($(this).data('exit'));
                     }
                 });
           }
         },
         CurrentSlide: function () {
             var el = $(this.element);
             var current = el.find('.active').index();
             return current + 1;
         },
         NumberOfSlides: function () {
             var el = $(this.element); 
             var slides = el.children('.unleash_slide').length;
             return slides;
         },
         next: function () {
             var $this = this,
                 slides = $this.NumberOfSlides(),
                 current = $this.CurrentSlide();
             if (current == slides) return 1;
             else return current + 1;

         },
         prev: function () {
            
             var $this = this,
                 slides = $this.NumberOfSlides(),
                 current = $this.CurrentSlide();

             if (current == 1) return slides;
             else return current - 1;
         },
         goToNext: function () {
             var $this = this,
                 opts = $this.options,
                 el = $(this.element),
                 loader = el.siblings('.unleash_loader_bg').find('.unleash_loader');
             var nxt = $this.next();
             opts.onNext.call( this );
             if (playing2) {
                 $this.OpenSlide(nxt);
                 $this.pause();
                 loader.css("left", "-101%");
                 $this.play();
             } else {
                 $this.OpenSlide(nxt);
                 $this.pause();
                 loader.css("left", "-101%");
             }
         },
         goToPrev: function () {
             var $this = this;
                 opts = $this.options,
                 el = $(this.element),
                 loader = el.siblings('.unleash_loader_bg').find('.unleash_loader');
             var prv = $this.prev();
             opts.onPrev.call( this );
             if (playing2) {
                 $this.OpenSlide(prv);
                 $this.pause();
                 loader.css("left", "-101%");
                 $this.play();
             } else {
                 $this.OpenSlide(prv);
                 $this.pause();
                 loader.css("left", "-101%");
             }
         },
         play: function () {
             
             var $this = this,
                 opts = $this.options,
                 el = $(this.element),
                 loader = el.siblings('.unleash_loader_bg').find('.unleash_loader');
                 remaining_dur = Math.abs(loader.position().left / loader.width()),
                 duration = remaining_dur * opts.slide_duration;
                 el.siblings('.unleash_buttons').find('.unleash_play_pause').addClass('icon-pause').removeClass('icon-play');
                 
                 opts.onPlay.call( this );
             for (i = 0; i <= 100; i++) {
                  ((i == 0) && (!next_prev)) ? (dur = 0) : (dur = opts.duration);
                                     
                  if(next_prev){
                     loader.css('opacity', '0');
                     loader.delay(dur).stop().animate({
                     left: "0%"
                 }, {
                     queue: true,
                     duration: duration,
                     easing: "linear",

                     complete: function () {
                         var nxt = $this.next();
                         $this.OpenSlide(nxt);
                         loader.css("left", "-101%");
                     }

                 });
                     
                  }else{
                     loader.delay(dur).animate({
                     left: "0%"
                 }, {
                     queue: true,
                     duration: duration,
                     easing: "linear",

                     complete: function () {
                         var nxt = $this.next();
                         $this.OpenSlide(nxt);
                         loader.css("left", "-101%");

                     }

                 });
                  }

                  loader.animate({
                     opacity:'1'
                 }, {
                     queue: false,
                     duration: duration/3,
                     easing: "linear",
                     complete: function () {      
                            loader.css('opacity', '1');
                     }

                 });

                
                 duration = opts.slide_duration;
             }


         },
         pause: function () {
            
             var $this = this,
                 opts = $this.options,
                 el = $(this.element),
                 duration = opts.slide_duration;
             opts.onPause.call( this );
             el.siblings('.unleash_buttons').find('.unleash_play_pause').addClass('icon-play').removeClass('icon-pause');
             el.siblings('.unleash_loader_bg').find('.unleash_loader').stop(true);

         },

     
         closeAll: function () {
             var el = $(this.element),
                 opts = this.options,
                 width = el.width(),
                 slides = el.children('.unleash_slide').length,
                 slide_width = parseFloat(opts.slide_width) / 100,
                 loader = el.siblings('.unleash_loader_bg').find('.unleash_loader'),
                 gap = width / slides;
                unleash_transition($('.unleash_slide'), 'transform', opts.duration, 'ease');
             el.children('.unleash_slide').removeClass('active');
                     
                     if ((el.find('video').length > 0)) {
                     el.find('video').get(0).pause();
                 }
             if (!$('html').hasClass('no-csstransitions')) {
                     el.children('.unleash_slide').each(function (i) {
                         unleash_translate($(this), i*gap, 0, 'px');
                     });
                 } else {
                     el.children('.unleash_slide').each(function (i) {
                             $(this).stop().animate({
                                 left: i*gap,
                             }, {
                                 duration: opts.duration,
                             });
                     });
                 }
                 this.pause();
                 loader.css("left", "-101%");
                 playing2 = false;

                 el.children('.unleash_slide').each(function(index, el) {

                 if($(this).find('.unleash_content').length){
                    
                    $(this).find('.unleash_content').children().each(function(index, el) {
                        ent = $(this).data('entrance');
                        exit = $(this).data('exit');
                        $(this).removeClass(ent);
                        
                            if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                                $(this).fadeOut(300);
                            }else{
                                 $(this).css({
                                     '-webkit-animation-delay': '0ms',
                                     '-moz-animation-delay': '0ms',
                                     'animation-delay': '0ms',
                                 });
                                $(this).addClass(exit);
                            }
                         
                    });

                 } else if($(this).find('.unleash_caption').length){

                    ent = $(this).find('.unleash_caption').data('entrance');
                    exit = $(this).find('.unleash_caption').data('exit');
                    $(this).find('.unleash_caption').removeClass(ent);
                        if ($('html').hasClass('no-csstransitions') || $('html').hasClass('no-csstransforms')) {
                            $(this).find('.unleash_caption').fadeOut(300);
                        }else{
                            $(this).find('.unleash_caption').addClass(exit);
                        }
                 }

            });
         },
         stopSlideshow: function () {
             var $this = this,
                 el = $(this.element),
                 loader = el.siblings('.unleash_loader_bg').find('.unleash_loader');
             $this.pause();
             loader.css("left", "-101%");

         }
     };


     $.fn[pluginName] = function (options) {
         return this.each(function () {
             if (!$.data(this, "plugin_" + pluginName)) {
                 $.data(this, "plugin_" + pluginName,
                     new Plugin($(this), options));
             }
         });
     };

 })(jQuery, window, document);

