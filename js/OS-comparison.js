// findme notes: fast, efficient, needs beeter touch handling (slider doesn't work on phone) and the dividing line jitters on zoom.


// Proof of concept by Illya Moskvin, IMA Lab, Indianapolis Museum of Art
// MIT License, free (gratis and libre) for any use, we take no responsibility :P

// Image comparison slider, loosely based on the following:
// https://codyhouse.co/gem/css-jquery-image-comparison-slider/

// Initialize the viewer
var viewer = OpenSeadragon({
    id:              "openseadragon01",

    showNavigator:false,
    showNavigationControl: false
});

// Create a point exactly in the middle of the viewport
var $viewer = $('#container');

var middle = new OpenSeadragon.Point( $viewer.width() / 2, $viewer.height() / 2 );

function updateMiddle( offset ) {
    middle.x = offset;
}

// Keep track of the two images we're splitting
var leftImage = null;
var rightImage = null;

var leftRect = new OpenSeadragon.Rect( 0,0,0,0 );
var rightRect = new OpenSeadragon.Rect( 0,0,0,0 );

viewer.addTiledImage( {
    tileSource: 'https://dlcs.io/iiif-img/3/2/04fbbb28-d5a7-4408-b7da-800c4e65eda3/info.json',
    success: function( event ) {

        leftImage = event.item;
        imagesLoaded();

    }
});

viewer.addTiledImage( {
    tileSource: 'https://dlcs.io/iiif-img/3/2/8034eb5b-9c90-4471-ad68-52124232ec0c/info.json',
    success: function( event ) {

        rightImage = event.item;
        imagesLoaded();

    }
});

// Handle pan and zoom events
viewer.addHandler('animation', imagesClipAggressive);
viewer.addHandler('animation-start', imagesClip);

// Basic function to check when both images are loaded
function imagesLoaded() {
    if( leftImage && rightImage ) {

        leftRect.height = leftImage.getContentSize().y;
        rightRect.height = rightImage.getContentSize().y;

        imagesClip();

        initClip();

    }
}

var oldSpringX = 0.5;

function imagesClipAggressive() {
    var newSpringX = viewer.viewport.centerSpringX.current.value;
    var deltaSpringX = newSpringX - oldSpringX;
    oldSpringX = newSpringX;

    var fixedMiddle = viewer.viewport.viewerElementToViewportCoordinates(middle);
    fixedMiddle.x += deltaSpringX;

    var rox = rightImage.viewportToImageCoordinates(fixedMiddle).x;
    var lox = leftImage.viewportToImageCoordinates(fixedMiddle).x;

    imagesClipShared(rox, lox);
}

function imagesClip() {
    var rox = rightImage.viewerElementToImageCoordinates(middle).x;
    var lox = leftImage.viewerElementToImageCoordinates(middle).x;

    imagesClipShared(rox, lox);
}

function imagesClipShared(rox, lox) {
    rightRect.x = rox ;
    rightRect.width = rightImage.getContentSize().x - rox;

    leftRect.width = lox;

    leftImage.setClip(leftRect);
    rightImage.setClip(rightRect);
}

function initClip() {

    //console.log( leftImage, rightImage );
    //console.log( rightImage.getContentSize() );

    // TODO: Abstract this away
    var $handle = $('.slider-handle');
    var $container = $handle.parents('.slider-container');

    // We will assume that the width of the handle element does not change
    var dragWidth = $handle.outerWidth();

    // However, we will track when the container resizes
    var containerWidth, containerOffest, minLeft, maxLeft;

    function updateContainerDimensions() {

        containerWidth = $container.outerWidth();
        containerOffset = $container.offset().left;
        minLeft = containerOffset + 10;
        maxLeft = containerOffset + containerWidth - dragWidth - 10;

        // Spoof the mouse events
        var offset = $handle.offset().left + dragWidth / 2;
        var event;

        // Bind the drag event
        event = new jQuery.Event("mousedown");
        event.pageX = offset;

        $handle.trigger( event );

        // Execute the drag event
        event = new jQuery.Event("mousemove");
        event.pageX = offset;

        $container.trigger( event );

        // Unbind the drag event
        $handle.trigger("mouseup");

    }

    // Retrieve initial container dimention
    updateContainerDimensions();

    // Bind the container resize
    $(window).resize( updateContainerDimensions );

    // We are just going to assume jQuery is loaded by now
    // Eventually, I'll make this work without jQuery
    $handle.on("mousedown vmousedown", function(e) {

        var xPosition = $handle.offset().left + dragWidth - e.pageX;

        function trackDrag(e) {

            var leftValue = e.pageX + xPosition - dragWidth;

            //constrain the draggable element to move inside its container
            leftValue = Math.max(leftValue, minLeft);
            leftValue = Math.min(leftValue, maxLeft);

            var widthPixel = (leftValue + dragWidth/2 - containerOffset);
            var widthFraction = widthPixel/containerWidth;
            var widthPercent = widthFraction*100+'%';

            $handle.css('left', widthPercent);

            updateMiddle( widthPixel );
            imagesClip( );

        }

        $container.on("mousemove vmousemove", trackDrag);

        $handle.add($container).one("mouseup vmouseup", function(e) {
            $container.unbind("mousemove vmousemove", trackDrag);
        });

        e.preventDefault();

    });

}
