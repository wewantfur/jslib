# FurSlider: Vanilla Javascript image slider
FurSlider is a vanilla javascript image slider. It uses no jQuery-like libraries. Transitions are achieved with CSS3 effects.

## Usage

### Javascript:
```html
<link rel="stylesheet" href="http://cdn.wewantfur.com/fur-slider/fur-slider-latest-min.css">
<script src="http://cdn.wewantfur.com/fur-polyfill/fur-polyfill-latest-min.js"></script>
<script src="http://cdn.wewantfur.com/fur-slider/fur-slider-latest-min.js"></script>
<script>
window.onload = function(e) {
    fur.slider(document.getElementById('photo'), {speed: 3000});
}
</script>
```

Notes:
* The polyfill is required and provides IE8 support
* The slider accepts a single element or a nodeList

### HTML:
```html
<section id="photo">
	<div class="fur-slider-viewport">
		<img src="/files/slider/1.jpg" alt="Image 1"/>
	</div>
	<aside>
	    <!-- thumbnails -->
		<ul class="fur-slider-items">
			<li><img src="/files/slider/thumb/1.jpg" data-src="/files/slider/1.jpg" alt="Image 1"></li>
			<li><img src="/files/slider/thumb/2.jpg" data-src="/files/slider/2.jpg" alt="Image 2"></li>
			<li><img src="/files/slider/thumb/3.jpg" data-src="/files/slider/3.jpg" alt="Image 3"></li>
			<li><img src="/files/slider/thumb/4.jpg" data-src="/files/slider/4.jpg" alt="Image 4"></li>
			<li><img src="/files/slider/thumb/5.jpg" data-src="/files/slider/5.jpg" alt="Image 5"></li>
		</ul>
	</aside>
</section>
```

Notes:
* The container must have an element with the class `fur-slider-viewport`
* Inside the viewport, an optional placeholder image can be provided
* The container must have a list with the class `fur-slider-items` which contains the items
* The items can be any type of element, the `data-src` property contains the image used in the slide
* An optional `data-url` property can be provided, which will wrap the slides with an `a` tag linking to the url

####Slide Effects
The slider comes with a number of build in effects. A slide affect is added as class to the viewport.
Available effects:
* `fur-slider-slide-left`
* `fur-slider-slide-right`
* `fur-slider-slide-top`
* `fur-slider-slide-bottom`
* `fur-slider-slide-fade`
* `fur-slider-slide-horizontal`
* `fur-slider-slide-vertical`