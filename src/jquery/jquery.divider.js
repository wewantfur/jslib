/**
 * jQuery Divider plugin
 * Copyright (c) 2013 Fur
 * http://www.wewantfur.com
 * Licensed under the Apache License
 * @author ids - Fur
 */
(function($) {
	$.fn.divider = function(options) {

		for(var di = 0; di < this.length; di++) {
			setup($(this[di]));
		}
		
		function setup(divider) {
			var resizeTimeout, curWidth, oldWidth;
			if(!divider.hasClass('fur-divider')) {
	
				resizeTimeout = 0;
				curWidth = divider.width();
				oldWidth = curWidth;
				var settings = $.extend( {
				      'widths'         : []
				    }, options);
				
				divider.addClass('fur-divider');
		
				// Add divider handles
				var nc = divider.children().length;
				divider.children().each(function(index, el) {
					$(this).after('<span class="fur-divider-handle" data-index="'+index+'" data-total="'+nc+'"><span>||</span></span>');
				});
				// Get width of divider
				var handleWidth = divider.children().last().width();
				// Remove last divider
				divider.children().last().remove();
				
				var width = divider.width();
				var itemWidth = Math.floor((width - ((divider.children('div').length - 1)* handleWidth)) / divider.children('div').length);  
				divider.children('div').wrap('<div class="fur-divider-item"></div>');
				var pos = 0;
				divider.children('div, span').each(function(index, el){
					var w = handleWidth;
					if($(el).hasClass('fur-divider-item')) {
						$(el).width(itemWidth).css('left', pos+'px');
						w = itemWidth;
					} else {
						$(el).css('left',pos+'px');
					}
					pos += w;			
				});
				
				divider.on('mousedown.divider'+di, '.fur-divider-handle', function(de) {
					var handle = $(this);
					// Since event.offset is unreliable, we'll do it this way
					var offsetl = divider.offset().left;
					divider.addClass('unselectable');
					divider.on('mousemove.divider'+di, function (me) {
						// Get all previous divs
						var xpos = me.pageX - offsetl;
		
						// Current index
						var hi = handle.attr('data-index');
						var nc = handle.attr('data-total');
						
						// The minimal left position (number of handles left of this one * width of 1 handle)
						var minl = hi * handleWidth;
						// The maximum left position (width of container - number of handles right of this one * width of 1 handle)
						var maxl = divider.width() - ((nc-hi)*handleWidth);
						// The new position of this handle
						var hpos = Math.min(Math.max(minl,xpos), maxl);
						handle.css('left', hpos);
						// Position the other handles
						divider.children('.fur-divider-handle').each(function(i, el) {
							if(i < hi) {
								// Check if the position of the handles left of this one should be altered
								// This is the case when the dragged handle is dragged 'over' the previous one(s);
								if($(this).position().left >= hpos - ((hi-i) * handleWidth)) {
									$(this).css('left', hpos - ((hi-i) * handleWidth));
								}
							} else if(i > hi) {
								// Check if the position of the handles right of this one should be altered
								// This is the case when the dragged handle is dragged 'over' the next one(s);
								if($(this).position().left <= hpos - ((hi-i) * handleWidth)) {
									$(this).css('left', hpos - ((hi-i) * handleWidth));
								}
							}
						});
						
						positionItems(divider, handleWidth);
						
					});
				});
		
				divider.on('mouseup.divider'+di, function(ue) {
					divider.removeClass('unselectable');
					divider.off('mousemove.divider'+di);
				});
				
				// The only way to check for resize events :'(
				resizeTimeout = setInterval(function() {
					if(divider.width() != curWidth) {
						oldWidth = curWidth;
						curWidth = divider.width();
						resizeDivider(divider, oldWidth, curWidth,handleWidth);
					}
				},100);
			}
		}
		
		function resizeDivider(divider, oldWidth, curWidth, handleWidth) {
			divider.children('.fur-divider-handle').each(function() {
				$(this).css('left', ($(this).position().left / oldWidth) * curWidth );
			});
			positionItems(divider,handleWidth);
		};
		
		function positionItems(divider, handleWidth) {
			var pos = 0;
			// Now resize all containers according to the new handle positions
			divider.children('.fur-divider-item').each(function(i, el) {
				var nexthandle = $(this).next();
				var r = divider.width();
				if(nexthandle.length > 0)
					r = nexthandle.position().left;
				
				$(this).css({left: pos, width:r-pos});
				pos += (r-pos) + handleWidth;
			});
		};
		return this;
	};
})(jQuery);