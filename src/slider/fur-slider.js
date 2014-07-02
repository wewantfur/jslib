/**
 * Vanilla JS image caroussel
 * Attribution 3.0 License. http://creativecommons.org/licenses/by/3.0/
 *
 * @author Fur - http://www.wewantfur.com
 * @requires fur-polyfill.js
 * @see http://cdn.wewantfur.com/fur-slider/example/
 *
 * @version 2.3.5
 */
(function(fur) {

    var sliders = {};
    var numSliders = 0;

    fur.slider = function(el, opts, data) {
        if(!el)
            return;

        if (typeof el.length === 'number'
            && typeof el.item !== 'undefined') {

            // Multiple elements
            for(var i in el) {
                if(isNaN(parseInt(i)))
                    continue;

                window.fur.slider(el.item(i), opts);
            }

            return;
        }

        // Command
        if(typeof opts == 'string') {
            return handleCommand(getSlider(el), opts, data);
        }

        // Existing slider
        if(el.hasAttribute("data-fur-slider-id")) {
            return;
        }

		// New slider
        createSlider(el,opts);
    }

    /**
     * Adds an image / slide to the sliders viewport
     * @param element The main slider element
     * @param li The li with image to add
     * @param replaces Optional, the image which it should replace (in case of a placeholder image)
     */
    function addImageToViewport(element, li, replaces) {
        if(replaces) {
            replaces.parentNode.insertBefore(li, replaces);
            replaces.parentNode.removeChild(replaces);
            return;
        }

        fur.addClass(li,'fur-slider-slide');
        element.querySelector(".fur-slider-inner-viewport").appendChild(li);

    }

    /**
     * Converts the viewport to a list
     * @param el The viewport element
     */
    function convertViewportToUl(el) {
        var viewport = document.createElement('ul');
        fur.addClass(viewport, 'fur-slider-inner-viewport');
        if(el.childElementCount > 0) {
            // There's a placeholder
            while(el.children.length > 0) {
                var child = el.firstChild;
                child.parentNode.removeChild(child);

                if(child.nodeType != 1)
                    continue;

                var li = document.createElement('li');
                li.appendChild(child);
                viewport.appendChild(li);
            }
        }
        el.appendChild(viewport);
    }

    /**
     * Creates a slide for the given thumb
     * @param thumb The thumbnail to create a slide of
     * @param index The index of the slider
     * @returns {HTMLElement}
     */
    function createSlide(thumb, index) {
        var li  = document.createElement('li');
        var img = document.createElement('img');
        li.setAttribute('data-fur-slide-id', index);
        thumb.setAttribute('data-fur-slide-id', index);

        if(thumb.hasAttribute("alt"))
            img.setAttribute('alt', thumb.getAttribute('alt'));

        if(thumb.hasAttribute("title"))
            img.setAttribute('title', thumb.getAttribute('title'));

        fur.addClass(li, "fur-slider-slide");
        fur.addClass(thumb, "fur-thumb");
        img.setAttribute('data-src', thumb.hasAttribute("data-src") ? thumb.getAttribute("data-src") : thumb.src);
		if(thumb.parentNode.querySelector('[data-url]')) {
			var aTag = document.createElement('a');
			aTag.setAttribute('href', thumb.parentNode.querySelector('[data-url]').getAttribute('data-url'));
			aTag.appendChild(img);
			img = aTag;
		}
        li.appendChild(img);
        return li;
    }

    /**
     * Creates a new slider
     * @param el
     * @param opts
     */
    function createSlider(el, opts) {
        var sl, images, next;
        sl = setSlider(el, opts);

        images = getImages(el);

        for(var i in images) {
            // getImages returns an 'item' property, skip it
            if(isNaN(parseInt(i)))
                continue;

            var li = createSlide(images.item(i), i);

            fur.on(images.item(i), 'click', onThumbClick);
            fur.on(li.querySelector('img'), 'load', onImgLoad);

            // Check if there is a placeholder image,
            // if so, replace it with a real slide
            if(i == 0 && el.querySelector('.fur-slider-viewport').childElementCount > 0) {
                addImageToViewport(el, li, el.querySelector(".fur-slider-viewport li"));
            } else {
                addImageToViewport(el, li, null);
            }

        }


		// Check if there is a hash in the url
		var startSlide = getStartSlide(el);

		setActiveById(el, startSlide);

		// Just one image
		if(images.length == 1)
			return;

		next = fur.nextElement(el.querySelector('.fur-slider-slide.fur-slide-active')) || el.querySelector('.fur-slider-slide');


        loadNextImage(next);

        if(sl.options.autostart == true){
            sl.interval = setInterval(function() {
                slideTo(sl, null);
            }, sl.options.speed);
        }
    }


    /**
     * Searches the thumb list for images
     * @param element
     * @returns {NodeList}
     */
    function getImages(element) {
        var images = element.querySelectorAll(".fur-slider-items img");

        if(images.length == 0) {
            // no images, match on data-src
            images = element.querySelectorAll(".fur-slider-items [data-src]");
        }

        return images;
    }

    /**
     * Finds the current slider.
     * @param el The slider element or a child element of the slider
     * @returns {element:HTMLElement, options: {*}}
     */
    function getSlider(el) {

        while(el && !el.hasAttribute('data-fur-slider-id') && el.parentNode){
            el = el.parentNode;
        }
        return sliders[el.getAttribute('data-fur-slider-id')];
    }

	/**
	 * Gets the index of the startslide. Checks if there is a hash in the url
	 * which matches any target link in the thumbnails
	 * @param el The slider element
	 * @returns {string}
	 */
	function getStartSlide(el) {
		if(!window.location.hash)
			return null;

		var id = null;


		[].forEach.call(
			el.querySelectorAll(".fur-slider-items a[href^='#']"),
			function (thumb) {
				if(thumb.getAttribute('href') == window.location.hash) {
					id = thumb.getAttribute('data-fur-slide-id');
				}

			}
		);

		return id;

	}

    function handleCommand(slider, command, data) {
        // Handle command
        switch(command) {
            case 'stop':
                clearInterval(slider.interval);
                break;
            case 'resume':
                clearInterval(slider.interval);
                slider.interval = setInterval(function() {
                    slideTo(slider, null);
                }, slider.options.speed);
                break;
            case 'currentIndex':
                var index = 0;
                var found = false;
                [].forEach.call(slider.element.querySelectorAll('.fur-slider-slide'),function(item) {

                    if(found)
                        return;
                    if(fur.hasClass(item, 'fur-slide-active')) {
                        found = true;
                        return;
                    }
                    index++;
                });

                if(!found)
                    return -1;

                return index;

                break;
            case 'gotoSlide':
                clearInterval(slider.interval);
                slideTo(slider, data);
                break;
        }
    }



    /**
     * Initializes the loading of an image, if not already loading
     * @param img The image to load
     */
    function loadNextImage(li) {
        var img = li.querySelector('img');
        if(fur.containsClass(img, "fur-slide-loading"))
            return;

        fur.addClass(img, 'fur-slide-loading');
        img.src = img.getAttribute('data-src');
    }

	/**
	 * Sets the given image and it's thumb active
	 * @param el
	 * @param id
	 */
	function setActiveById(el,id) {
		if(id == null)
			id = el.querySelector('.fur-slider-slide').getAttribute('data-fur-slide-id');

		var li = el.querySelector('.fur-slider-slide[data-fur-slide-id="'+id+'"]');
		li.querySelector('img').src = li.querySelector('img').getAttribute('data-src');
		fur.addClass(li, "fur-slide-active");
		fur.addClass(el.querySelectorAll('[data-fur-slide-id="'+id+'"]'), "fur-slide-active");
		fur.addClass(li.querySelector('img'), "fur-slide-loaded");

	}

    /**
     * Adds the active class to the new slide, and removes it from the current
     * @param element The main slider element
     * @param active The current active slide
     * @param next The new active slide
     */
    function setActiveClasses(element, active, next) {
        fur.addClass(active.parentNode.querySelector('.fur-slider-slide-out'), 'fur-no-anim');
        fur.removeClass(active.parentNode.querySelector('.fur-slider-slide-out'), 'fur-slider-slide-out');

        fur.removeClass(active, 'fur-no-anim');
        fur.addClass(active, 'fur-slider-slide-out');

        fur.removeClass(next, 'fur-no-anim');
        fur.addClass(next, 'fur-slide-active');

        setActiveThumb(element, next);

        fur.removeClass(active, 'fur-slide-active');
    }

    function setActiveThumb(element, next) {
        var thumbs = element.querySelectorAll('.fur-slider-items [data-fur-slide-id]');
        for(var i in thumbs) {
            fur.removeClass(thumbs.item(i), 'fur-slide-active');
        }

        var sid = next.getAttribute('data-fur-slide-id');

        fur.addClass(element.querySelector('.fur-slider-items [data-fur-slide-id="'+sid+'"]'), 'fur-slide-active');
    }

    /**
     * Combines the user options with the default options
     * @param options
     * @param defaultOptions
     * @returns {*}
     */
    function setOptions(options, defaultOptions) {

        for(var opt in options) {
            defaultOptions[opt] = options[opt];
        }

        return defaultOptions;
    }

    function setSlideDirection(axis, viewport, current, next) {
        //current.in
        var nodeList = Array.prototype.slice.call(viewport.querySelector('.fur-slider-inner-viewport').children), dir;

        fur.addClass(current, 'fur-no-anim');
        fur.addClass(next, 'fur-no-anim');

        fur.removeClass(next, 'fur-slider-slide-out');

        switch (axis) {
            case 'horizontal':
                fur.removeClass(viewport, 'fur-slider-slide-right');
                fur.removeClass(viewport, 'fur-slider-slide-left');
                dir = nodeList.indexOf(current) < nodeList.indexOf(next) ? 'right' : 'left';
                break;
            case 'vertical':
                fur.removeClass(viewport, 'fur-slider-slide-up');
                fur.removeClass(viewport, 'fur-slider-slide-down');
                dir = nodeList.indexOf(current) < nodeList.indexOf(next) ? 'up' : 'down';
                break;
        }
        fur.addClass(viewport, 'fur-slider-slide-'  + dir);

        // trigger reflow
        viewport.offsetHeight;
        /*next.offsetHeight;*/
        fur.removeClass(current, 'fur-no-anim');
        fur.removeClass(next, 'fur-no-anim');

    }

    function setSlider(el, opts) {
        var viewportType = el.querySelector(".fur-slider-viewport").nodeName;
        var isList = viewportType == 'OL' || viewportType == 'UL';
        if(isList) {
            fur.addClass(el.querySelector(".fur-slider-viewport"),'fur-slider-inner-viewport');
        } else {
            convertViewportToUl(el.querySelector(".fur-slider-viewport"));
        }

        if(el.querySelector('.fur-slider-slide-horizontal')) {
            fur.addClass(el.querySelector('.fur-slider-slide-horizontal'), 'fur-slider-slide-right');
        }

        // new element
        el.setAttribute("data-fur-slider-id", "slider-" + ++numSliders);

        sliders["slider-" + numSliders] = {viewportIsList: isList, element: el, options: setOptions(opts, {speed: 1500, autostart: true})};
        var sl = sliders["slider-" + numSliders];
        if(sl.options.hasOwnProperty("onSlideChange")) {
            fur.on(sl.element, "slideChange", sl.options.onSlideChange);
        }

        return sl;
    }

    /**
     * Slides to the next element
     * @param object slider
     * @param id
     */
    function slideTo(slider, id) {

        var active = slider.element.querySelector('.fur-slider-slide.fur-slide-active');

        var next = fur.nextElement(active);

        if(!next) {
            next = active.parentNode.querySelector('.fur-slider-slide');
        }


        if(id != null && typeof id != 'undefined') {
            next = slider.element.querySelector('.fur-slider-slide[data-fur-slide-id="' + id + '"]');
        }
        if(!next) {
            return;
		}

        if(slider.element.querySelector('.fur-slider-slide-horizontal')) {
            setSlideDirection('horizontal', slider.element.querySelector('.fur-slider-viewport'), active, next);
        }

        slider.nextItem = id;

        var isLoadingNext = false;

        if(!fur.containsClass(next.querySelector('img'), 'fur-slide-loaded')) {
            // Not loaded yet
            loadNextImage(next);
            isLoadingNext = true;
        }

        if(fur.nextElement(next) && !fur.containsClass(fur.nextElement(next).querySelector('img'), 'fur-slide-loaded')) {
            // Also load the 'next next' one
            loadNextImage(fur.nextElement(next));
        }

        // When the image is not loaded yet, wait for the next interval to proceed,
        // When an id is specified the animation is continued when the image is loaded
        if(isLoadingNext) {
            return;
        }

        // Wait a little to allow the browser to set
        // the new classes

        setTimeout(function() {

        },20);
        setActiveClasses(slider.element, active, next);

        fur.trigger(slider.element, "slideChange");

    }

    ///////////////////////////////////////////////////
    ///                 Event handlers              ///
    ///////////////////////////////////////////////////


    function onImgLoad(e) {
        var img = e.srcElement || e.target;
        fur.off(img, 'load', onImgLoad);
        fur.removeClass(img, 'fur-slide-loading');
        fur.addClass(img, 'fur-slide-loaded');
        var slider = getSlider(img);

        if(!slider.hasOwnProperty('nextItem'))
			return;

		var node = img;
		while(!node.hasAttribute('data-fur-slide-id') && node != slider.element) {
			node = node.parentNode;

		}
		if(node.getAttribute('data-fur-slide-id') == slider.nextItem) {

			slideTo(slider, slider.nextItem);
			delete slider.nextItem;
		}
    }


    function onThumbClick(e) {
        //e.preventDefault();
        var elm = e.srcElement || e.target;
        if(fur.containsClass(elm, 'fur-slide-active'))
            return;

        handleCommand(getSlider(elm), 'gotoSlide', elm.getAttribute('data-fur-slide-id'));
    }
})(window.fur = window.fur || {});