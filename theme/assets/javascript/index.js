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
	$sitehead = $('#site-head'),
	geoLocation = {},
	currentState = "register",
	oldState = null;
	
function subscribeMailChimp() {
	var emailAddress = $('#registration-email').val();
	var re = /\@\S*\.\S/;
	if(!emailAddress || !emailAddress.match(re) ) {
		console.log('no or bad email: ' + emailAddress);
		$('#registration-widget').addClass('invalid animated shake').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$('#registration-widget').removeClass('animated shake');
		});
	} else {
		geoLocate();
		console.log("form being submitted: " + emailAddress);
		console.log("serialised data:", $('.subscribe-form').serialize() ); 
		$.ajax({
			url: 'chimp/register/' + emailAddress, 
			type: "POST",
			data: $('.subscribe-form').serialize()
			// data: { FNAME: 'joe'}
		})
		.done(function(msg) {
			console.log('successful', msg);
			chimpState('success');
		})
		.fail(function(error) {
			console.log(error);
			if(error.status === 409) {
				chimpState('already-exists');
			} else {
				chimpState('error');
			}
		});	
	}
	return true;
}

function chimpProfileEmail() {
	var emailAddress = $('#registration-email').val();
	$.ajax({
		url: 'chimp/profileEmail/' + emailAddress, 
		type: "POST",
	})
	.done(function(msg) {
		console.log('sent subscriber their profile email', msg);
	})
	.fail(function(error) {
		console.log(error);
	});
}

function contactUs() {
	var emailAddress = $('#customer-email').val();
	var data = $('#contact-form').serialize();
	$.ajax({
		url: 'chimp/contact/' + emailAddress,
		type: "POST",
		data: data
	})
	.done(function(msg) {
		chimpState('register',{transition:'left'});
		messageWindow('<i class="fa fa-send-o"></i> Message sent. Thank you!', {timeframe: 5000});
	})
	.fail(function(error) {
		console.log(error);
		messageWindow("Uh oh. There was a problem sending. Please try again soon.", {timeframe: 15000});
	});
}

function messageWindow(msg, options) {
	options = options || {};
	if (typeof options === 'string') {
		options = JSON.parse(options);		
	}
	var transitionTypes = {
		'default': {'in':'rubberBand', 'out': 'fadeOut'},
	};
	var transition = options.transition || 'default';
	var timeframe = options.timeframe || 5000;
	transition = transitionTypes[transition];
	$('#message-window').html(msg);
	$('#message-window').removeClass('invisible').addClass('animated ' + transition.in).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() {
		$('#message-window').removeClass('animated ' + transition.in);
		// keep message window open for timeframe
		window.setTimeout(function() {
			// now fade it out
			$('#message-window').removeClass('invisible').addClass('animated ' + transition.out).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() {
				$('#message-window').addClass('invisible').removeClass('animated ' + transition.out);				
			})
		}, timeframe);
	});
}

function chimpState(state, options) {
	options = options || {};
	if (typeof options === 'string') {
		options = JSON.parse(options);		
	}
	var transitionTypes = {
		'default': {'in':'fadeInUp', 'out': 'fadeOutUp'},
		'up': {'in':'fadeInUp', 'out': 'fadeOutUp'},
		'down': {'in':'fadeInDown', 'out': 'fadeOutDown'},
		'right': {'in':'fadeInLeft', 'out': 'fadeOutRight'},
		'left': {'in':'fadeInRight', 'out': 'fadeOutLeft'},
	};
	var transition = options.transition || 'default';
	transition = transitionTypes[transition];
	console.log("changing registration state from " + currentState + " to " + state + ".");
	console.log("options are: ", options);
	oldState = currentState;
	currentState = state;
	// remove the OLD
	$('.registration .' + oldState).addClass('animated ' + transition.out ).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() { 
		console.log('clearing up the transition out for ' + oldState, this);
		$(this).addClass('hidden').removeClass('animated ' + transition.out);
	});
	// bring in the NEW
	$('.registration .' + currentState).removeClass('hidden').addClass('animated ' + transition.in).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function() {
		console.log('clearing up the transition in for ' + currentState, this);
		$(this).removeClass('animated ' + transition.in);
	});
	$('[data-toggle="tooltip"]').tooltip();
	geoLocate();
	if(options.clearEmail) {
		$('#registration-email').val('');
	}
}

function geoLocate(callback) {
	if(geoLocation && callback) {
		callback(geoLocation);
	} else {
		$.ajax({
			url: 'http://ipinfo.io/json',
			type: 'GET'
		})
		.done(function(data) {
			console.log('got geolocation information', data);
			// replace in appropriate selectors
			$('.geolocation.ip').val(data.ip);
			$('.geolocation.country').val(data.country);
			$('.geolocation.region').val(data.region);
			$('.geolocation.postal').val(data.postal);
			$('.geolocation.location').val(data.loc);
			// set global variable (should probably remove this)
			geoLocation = data;
			// return the value to the callback if it exists
			if(callback) {
				callback(data);
			}
		})
		.fail(function(error) {
			console.log("failed to get geolocation", error);
		})
	}
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
        });
        $('#contact-link').click( function () {
        	chimpState('contact-us',{transition: 'left'});
        });
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

        // $('li').before('<span class="bult fa fa-asterisk icon-asterisk"></span>')
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
	
	geoLocate();
    

}(jQuery));
