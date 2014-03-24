/**
 * Created by ids on 3/24/14.
 */
window.furSlider = function(el, options) {
    if(typeof options == 'string') {
        return handleCommand(options);
    }

    this.sliderOptions = {speed: 1500};
    for(var opt in options) {
        this.sliderOptions[opt] = options[opt];
    }
    addClass(el.querySelector(".fur-slider-items img"), "fur-thumb-active");

    var images = el.querySelectorAll(".fur-slider-items img");
    for(var i in images) {
        if(isNaN(parseInt(i)))
            continue;

        var img = document.createElement('img');
        img.setAttribute('data-fur-slider-id', i);
        images.item(i).setAttribute('data-fur-slider-id', i);

        if(images.item(i).hasAttribute("alt"))
            img.setAttribute('alt', images.item(i).getAttribute('alt'));

        if(images.item(i).hasAttribute("title"))
            img.setAttribute('title', images.item(i).getAttribute('title'));

        addClass(img, "fur-slider-slide");
        addClass(images.item(i), "fur-thumb");
        img.setAttribute('data-src', images.item(i).hasAttribute("data-src") ? images.item(i).getAttribute("data-src") : images.item(i).src);

        addEventListener(images.item(i), 'click', onThumbClick);
        addEventListener(img, 'load', onImgLoad);

        el.querySelector(".fur-slider-viewport").appendChild(img);

        if(i == 0) {
            img.src = img.getAttribute('data-src');
            addClass(img, "fur-slide-active");
            addClass(img, "fur-slide-loaded");
        }
    }
    setTimeout(function() {
        loadNextImage( el.querySelector('.fur-slide-active').nextSibling);
    }, 1500);

    this.sliderInterval = setInterval(slideTo, this.sliderOptions.speed);

    function onImgLoad(e) {
        removeEventListener(e.srcElement || e.target, 'load', onImgLoad);
        removeClass(e.srcElement || e.target, 'fur-slide-loading');
        addClass(e.srcElement || e.target, 'fur-slide-loaded');
    }

    function onThumbClick(e) {
        var elm = e.srcElement || e.target;

        if(containsClass(elm, 'fur-thumb-active'))
            return;

        handleCommand('gotoSlide', elm.getAttribute('data-fur-slider-id'));
    }

    function handleCommand(command, data) {
        // Handle command
        switch(command) {
            case 'stop':
                clearInterval(this.sliderInterval);
                break;
            case 'resume':
                clearInterval(this.sliderInterval);
                this.sliderInterval = setInterval(slideTo, this.sliderOptions.speed);
                break;
            case 'gotoSlide':
                clearInterval(this.sliderInterval);
                slideTo(data);
                break;
        }
    }

    function loadNextImage(img) {
        if(containsClass(img, "fur-slide-loading"))
            return;
        addClass(img, 'fur-slide-loading');
        img.src = img.getAttribute('data-src');
    }

    function slideTo(id) {
        var active = el.querySelector('.fur-slide-active');
        var next = active.nextSibling;
        if(!next) {
            next = active.parentNode.querySelector('.fur-slider-slide');
        }
        if(typeof id != 'undefined') {
            next = el.querySelector('.fur-slider-slide[data-fur-slider-id="'+id+'"]');
        }
        var isLoadingNext = false;
        if(!containsClass(next, 'fur-slide-loaded')) {
            // Not loaded yet
            loadNextImage(next);
            // Also load the 'next next' one
            if(next.nextSibling)
                loadNextImage(next.nextSibling);
            isLoadingNext = true;

        }
        // When the image is not loaded yet, and no id is specified, wait for the next interval to proceed,
        // When an id is specified continue animation,
        if(isLoadingNext && typeof id == 'undefined')
            return;

        addClass(next, 'fur-slide-active');
        var thumbs = document.querySelectorAll('.fur-slider-items [data-fur-slider-id]');
        for(var i in thumbs) {
            removeClass(thumbs.item(i), 'fur-thumb-active');
        }

        var sid = next.getAttribute('data-fur-slider-id');

        addClass(document.querySelector('.fur-slider-items [data-fur-slider-id="'+sid+'"]'), 'fur-thumb-active');
        removeClass(active, 'fur-slide-active');
    }

    /**
     * Polyfills for addClass, containsClass & removeClass
     */
    function addClass(element, classname) {
        if(element.classList) {
            element.classList.add(classname);
        } else {

            var classList = element.getAttribute('class') || element.getAttribute('className');
            if(!classList)
                classList = '';

            classList = classList.split(' ');
            classList.push(classname);
            element.setAttribute('class', classList.join(' '))
        }
    }

    function containsClass(element, classname) {
        if(element.classList)
            return element.classList.contains(classname);

        var classList = element.getAttribute('class') || element.getAttribute('className');
        if(!classList)
            classList = '';
        classList = classList.split(' ');
        var idx = classList.indexOf(classname);
        return (idx > -1);
    }

    function removeClass(element, classname) {
        if(element.classList) {
            element.classList.remove(classname);
        }else {
            var classList = element.getAttribute('class') || element.getAttribute('className');
            if(!classList)
                classList = '';
            var classes = classList.split(' ');
            var idx = classes.indexOf(classname);
            if(idx > -1)
                classes.splice(idx, 1)
            element.setAttribute('class', classes.join(' '));
        }
    }

    /**
     * Polyfill for event listeners
     * @param element
     * @param event
     * @param callback
     */
    function addEventListener(element, event, callback) {
        if(element.addEventListener) {
            element.addEventListener(event, callback, false);
        } else if(element.attachEvent) {
            element.attachEvent('on' + event, callback);
        }
    }

    /**
     * Polyfill for event listeners
     * @param element
     * @param event
     * @param callback
     */
    function removeEventListener(element, event, callback) {
        if(element.removeEventListener) {
            element.removeEventListener(event, callback, false);
        } else {
            element.detachEvent('on' + event, callback);
        }
    }


    /**
     * IE8 Polyfill
     */
    if(!Array.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        }
    }
}