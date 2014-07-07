/*jslint browser: true, jquery: true */ 
/*global console:true*/

/**
 * Main JS file for GhostScroll behaviours
 */
var $post = $('.post'), 
	$first = $('.post.first'), 
	$last = $('.post.last'), 
	$fnav = $('.fixed-nav'),
	$postholder = $('.post-holder'),
	$postafter = $('.post-after'),
	$sitehead = $('#site-head');
	
function subscribeMailChimp() {
	var emailAddress = $('#registration-email').val();
	if(!emailAddress || !emailAddress.match('\@') || !emailAddress.match('\.') ) {
		console.log('no or bad email: ' + emailAddress);
		$('#registration-widget').addClass('invalid animated shake').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$('#registration-widget').removeClass('animated shake');
		});
	} else {
		console.log("form being submitted: " + emailAddress);
		$("#message").html("<span class='error'>Adding your email address...</span>");
		$.ajax({
			url: 'chimp/subscribe/' + emailAddress, 
			data: $('#signup').serialize(),
			success: function(msg) {
				$('.register-message').addClass('animated fadeOutUp');
				$('.registration-success').addClass('animated fadeInUp');
				$('#message').html(msg); 
			},
			error: function(error) {
				$('.register-message').addClass('animated fadeOutUp');
				$('.registration-error').removeClass('hidden').addClass('animated fadeInUp');
				console.log(error);
			}
		});		
	}
	return false;
}
	

/*globals jQuery, document */
(function ($) {
    "use strict";
    function scrollTo (el) {
    	$('html, body').animate({
			scrollTop: el.offset().top
		}, 1000);
    }	
	
    $(document).ready(function(){
     
        $('#about-link').click( function () {
        	scrollTo($first);
        })
        $('.btn.last').click( function () {
        	scrollTo($last);
        })
        $('#header-arrow').click(function () {
            scrollTo($first);
        })
        $('.home-nav').click(function () {
            scrollTo($sitehead);
        })

        $('.post-title').each(function () {
        	var t = $(this).text(),
        	    index = $(this).parents('.post-holder').index();
        	$fnav.append("<a class='fn-item' item_index='"+index+"'>"+t+"</a>")

        	$('.fn-item').click(function () {
        		var i = $(this).attr('item_index'),
        			s = $(".post[item_index='"+i+"']")

        		$('html, body').animate({
					scrollTop: s.offset().top
				}, 400);

        	})
        })

        $('.post.last').next('.post-after').hide();
        if($sitehead.length) { 
            $(window).scroll( function () {
                var w = $(window).scrollTop(),
                    g = $sitehead.offset().top,
                    h = $sitehead.offset().top + $(this).height()-100;

                if(w >= g && w<=h) {
                    $('.fixed-nav').fadeOut('fast')
                } else {
                    if($(window).width()>500)
                      $('.fixed-nav').fadeIn('fast')
                }

                $post.each(function () {
                    var f = $(this).offset().top,
                        b = $(this).offset().top + $(this).height(),
                        t = $(this).parent('.post-holder').index(),
                        i = $(".fn-item[item_index='"+t+"']"),
                        a = $(this).parent('.post-holder').prev('.post-holder').find('.post-after');

                     $(this).attr('item_index', t);

                    if(w >= f && w<=b) {

                        i.addClass('active');
                        a.fadeOut('slow')
                    } else {
                        i.removeClass('active');
                        a.fadeIn('slow')
                    }
                })
            });
        }

        $('li').before('<span class="bult fa fa-asterisk icon-asterisk"></span>')
        $('blockquote p').prepend('<span class="quo icon-quote-left"></span>')
                .append('<span class="quo icon-quote-right"></span>')
        
    });
    
	// AUTO COMPLETES FONT-AWESOME ICONS
    $post.each(function () {
        var postText = $(this).html();
        var fa  = [];
        for(var i=0; i < icons.length; i++) {
            fa[i]       = {};
            fa[i].str   = "@"+ icons[i]+ "@";
            fa[i].icon  = icons[i];
            fa[i].int   = postText.search(fa[i].str);

            if(fa[i].int > -1 ) { 
                fa[i].count = postText.match(new RegExp(fa[i].str,"g")).length;
                for(var j=0; j < fa[i].count; j++) {
                    $(this).html($(this).html().replace(fa[i].str, "<i class='fa "+fa[i].icon+"'></i>"))
                }
            }
        }
    })
    

}(jQuery));
