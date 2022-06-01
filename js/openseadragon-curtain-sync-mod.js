'use strict';

/* =================================================
findme ref: original code based on https://github.com/cuberis/openseadragon-curtain-sync
please see original license if you wish to use this code.
================================================= */

(function () {

  // Ensure the console is here; some versions of IE need this.
  window.console = window.console || {};
  window.console.assert = window.console.assert || function () { };
  window.console.error = window.console.error || function () { };


  //findme todo: remove or replace
  // ties the viewer to related nubbin to avoid conflicts

  //get the drag nubbin
  var dragItem = document.getElementById("nubbin");
  var dragItemW = dragItem.offsetWidth/2;
  var dragItemH = dragItem.offsetHeight/2;



  // ----------
  var CurtainMode = function (args) {
    var self = this;

/*findme deprecated: used for synced viewers
    // get all osd viewers in the document for syncing
    var osdViewers = document.getElementsByClassName('osdViewer');
*/
    this.images = args.images;
    this.startingZoom = args.zoom;
    this.startingPan = args.pan;
    this.isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
    // this.isMobile = true; // For testing

    if (this.isMobile) {
      this.clipFactorX = 0.5;
      this.clipFactorY = 0.5;
    } else {
      this.clipFactorX = 0;
      this.clipFactorY = 0;
    }

    OpenSeadragon.EventSource.call(this);

    var ops = args.osdOptions;
    ops.element = args.container;


    //findme: console.log('ops = ',ops);
    //passes arguments to build the osd viewer
    this.viewer = OpenSeadragon(ops);

    this.viewer.canvas.style.outline = 'none'; // so we don't see the browser's selection rectangle when we click


    // drag slider handler
    // findme added: code to use a nubbin instead of just the mouse
      // findme ref: https://www.kirupa.com/html5/drag.htm

    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    dragItem.addEventListener("touchstart", dragStart, false);
    dragItem.addEventListener("touchend", dragEnd, false);
    dragItem.addEventListener("touchmove", drag, false);

    document.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e) {
      if (active) {

        e.preventDefault();

        // findme todo: add container buffer
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - dragItemW;
            currentY = e.touches[0].clientY - dragItemH;
        } else {
          currentX = e.clientX - dragItemW;
          currentY = e.clientY - dragItemH;
        }

        xOffset = currentX;
        yOffset = currentY;

        // sets the position of the nubbin
        setTranslate(currentX, currentY, dragItem);
        // sets the position of the layer clipping
        self.dragClip(currentX,currentY, true, true);

      }
    }

    function setTranslate(xPos, yPos, el) {
    //original uses css transform style to move nubbin smoother?
    //  el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";

    //adjusted uses actual position elements prevents creap error
      dragItem.style.left = currentX + 'px';
      dragItem.style.top = currentY + 'px';
    }


    this.viewer.addHandler('viewport-change', function () {
      self.updateClip();
      // suppress the viewport update on the underlying viewer to reduce event calls
      if (ops.id === 'viewer2') {
        self.raiseEvent('change:viewport');
      }
    });

    this.viewer.addHandler('add-item-failed', function (event) {
      self.raiseEvent('add-item-failed', event);
    });

    this.viewer.addHandler('canvas-drag', function (event) {
      // makes sure the images are clipped when dragging the canvas around
      if (!self.isDraggingClipX && !self.isDraggingClipY) {
        return;
      }
    });


      self.images.forEach(function (image, i) {
        image.curtain = {};

        self.viewer.addTiledImage({
          tileSource: image.tileSource,
          opacity: image.shown,
          success: function (event) {
            image.curtain.tiledImage = event.item;
            image.curtain.tiledImage.setOpacity(image.shown ? 1 : 0);

            if (i === 0) {
              if (self.startingZoom) {
                self.viewer.viewport.zoomTo(self.startingZoom, null, true);
              }

              if (self.startingPan) {
                self.viewer.viewport.panTo(self.startingPan, true);
              }
            }
            self.updateClip();
          }
        });
      });


//    self.setImages (this.images);



    self.setSplit();

  };

  // ----------
  CurtainMode.prototype = OpenSeadragon.extend({
    // ----------
    destroy: function () {
      this.images.forEach(function (image) {
        delete image.curtain;
      });

      this.viewer.destroy();
    },



    // ----------
    // findme addition: changes the image sources
    replaceImages: function (images) {
    //  this.mode.setMode('curtain',images);

      this.images.forEach(function (image) {
        delete image.curtain;
      });
      this.viewer.destroy();

      setImageShown('curtain', images);

    },

    //findme addition: updates the image split based on current nubbin position.
    setSplit : function () {
      this.dragClip(dragItem.offsetLeft, dragItem.offsetTop, true, true);
    },


    // ----------
    // findme addition: sets the opacity of an overlay layer (not base split view layers)
    setLayerOpacity: function (layer, opacity, split) {
      if (split) {
        layer = 1;
        var layerImages = this.getShownImages();
      }else{
        var layerImages = this.getLayerImages();
      }

      layerImages[layer].curtain.tiledImage.setOpacity(opacity);
    },

    // findme added ----------
    // returns the view object
    getViewer: function () {
      return this.viewer;
    },

    // ----------
    startingPan: function () {
      return self.startingPan;
    },

    getZoom: function () {
      return this.viewer.viewport.getZoom();
    },

    // ----------
    setZoom: function (zoom) {
      this.viewer.viewport.zoomTo(zoom, null, true);
      this.startingZoom = zoom;
    },

    // ----------
    getPan: function () {
      return this.viewer.viewport.getCenter();
    },

    // ----------
    setPan: function (pan) {
      this.viewer.viewport.panTo(pan, true);
      this.startingPan = pan;
    },

    // ----------
    zoomIn: function () {
      this.viewer.viewport.zoomBy(this.viewer.zoomPerClick);
      this.viewer.viewport.applyConstraints();
    },

    // ----------
    zoomOut: function () {
      this.viewer.viewport.zoomBy(1 / this.viewer.zoomPerClick);
      this.viewer.viewport.applyConstraints();
    },

    // ----------
    updateImageShown: function (image) {
      if (image.curtain.tiledImage) {
        image.curtain.tiledImage.setOpacity(image.shown ? 1 : 0);
      }
    },

    // ----------
    // clips the images
    updateClip: function () {
      var viewerPos = new OpenSeadragon.Point(this.viewer.container.clientWidth * this.clipFactorX,
        this.viewer.container.clientHeight * this.clipFactorY);

      var viewportPos = this.viewer.viewport.pointFromPixel(viewerPos, true);
      var tiledImage, imageSize, imagePos, clip;
      var allImages = this.getShownImages();
      var shownImages = this.getShownImages();

      // findme to do - make apply to all plsit layers and drop the 2-way split
      // 1 way split
      if (shownImages.length > 1) {
        tiledImage = shownImages[1].curtain.tiledImage;
        if (tiledImage) {
          imageSize = tiledImage.getContentSize();
          imagePos = tiledImage.viewportToImageCoordinates(viewportPos);
          var x = Math.min(imageSize.x, Math.max(0, imagePos.x));
          clip = new OpenSeadragon.Rect(x, 0, imageSize.x, imageSize.y);
          tiledImage.setClip(clip);
        }
      }

      // 2-way split
      if (shownImages.length > 2) {
        tiledImage = shownImages[2].curtain.tiledImage;
        if (tiledImage) {
          imageSize = tiledImage.getContentSize();
          imagePos = tiledImage.viewportToImageCoordinates(viewportPos);
          var y = Math.min(imageSize.y, Math.max(0, imagePos.y));
          clip = new OpenSeadragon.Rect(0, y, imageSize.x, imageSize.y);
          tiledImage.setClip(clip);
        }
      }
    },

    // clips the layer plased ont he position of the nubbing/curser
    // ----------
    dragClip: function (xPos, yPos, dragX, dragY) {


      //wrapped in a check to ensure that the OS viewer is visible before trying to modify

      if ( !document.getElementById(this.viewer.id).classList.contains('hidden') ){
        if (dragX) {
          // findme todo: 10 + is a shim to fix a position error for the nubbin. Needs fixing
          this.clipFactorX = (10 + xPos +  dragItemW/2) / this.viewer.container.clientWidth;
        }

        if (dragY) {
          this.clipFactorY = (yPos + dragItemH/2) / this.viewer.container.clientHeight;
        }

        this.updateClip();
      }
    },


    // ----------
    getShownImages: function () {
      return this.images.filter(function (image) {
        /*findme note: returns a list of visible, curtain view images*/
        return image.shown && image.isCurtain;
      });
    },

    /* findme addition: gets an array of the overlay layers */
    // ----------
    getLayerImages: function () {
      return this.images.filter(function (image) {
        return !image.isCurtain;
      });

    }
  }, OpenSeadragon.EventSource.prototype);

  // ----------
  var SyncMode = function (args) {
    var self = this;

    this.images = args.images;
    this.startingZoom = args.zoom;
    this.startingPan = args.pan;
    this.leadingImage = null;

    OpenSeadragon.EventSource.call(this);

    this.innerContainer = document.createElement('div');
    this.innerContainer.style.display = 'flex';
    this.innerContainer.style.height = '100%';
    args.container.appendChild(this.innerContainer);

    this.images.forEach(function (image, i) {
      image.sync = {};

      image.sync.container = document.createElement('div'); // makes a frame for OSD viewer
      image.sync.container.style.flexGrow = 1; // enables auto resize flexbox
      self.innerContainer.appendChild(image.sync.container);  //adds the container for the canvas
      //hides any non displayed images
      if (!image.shown) {
        image.sync.container.style.display = 'none';
      }

      var ops = args.osdOptions; //gets initial arguments for the viewer
      ops.element = image.sync.container; // tells OSD which container to use as viewer frame
      ops.tileSources = image.tileSource; // tells OSD the tilesource
      image.sync.viewer = OpenSeadragon( ops ); // create OSD instance

      image.sync.viewer.canvas.style.outline = 'none'; // so we don't see the browser's selection rectangle when we click

      // handler to set the starting zoom/pan locations to be in sync
      image.sync.viewer.addHandler('open', function () {
        if (self.startingZoom) {
          image.sync.viewer.viewport.zoomTo(self.startingZoom, null, true);
        }
        // catch if viewer is panning
        if (self.startingPan) {
          image.sync.viewer.viewport.panTo(self.startingPan, true);
        } else {
          var bounds = image.sync.viewer.world.getHomeBounds();
          var pan = new OpenSeadragon.Point(bounds.x + (bounds.width / 2), bounds.y + (bounds.height / 2));
          image.sync.viewer.viewport.panTo(pan, true);
        }
      });

      image.sync.viewer.addHandler('add-item-failed', function (event) {
        self.raiseEvent('add-item-failed', event);
      });

      // propogates pan and zoom to other images
      var changeHandler = function () {
        if (self.leadingImage && self.leadingImage !== image) {
          return;
        }

        self.leadingImage = image;
        self.images.forEach(function (image2) {
          if (image2 === image) {
            return;
          }

          image2.sync.viewer.viewport.zoomTo(image.sync.viewer.viewport.getZoom());
          image2.sync.viewer.viewport.panTo(image.sync.viewer.viewport.getCenter());
        });

        self.leadingImage = null;
      };

      // hooks that listen to changes in zoom state on the current viewer
      image.sync.viewer.addHandler('zoom', function () {
        changeHandler();
      });

      image.sync.viewer.addHandler('pan', function () {
        changeHandler();
      });

      if (i === 0) {
        image.sync.viewer.addHandler('viewport-change', function () {
          self.raiseEvent('change:viewport');
        });
      }
    });
  };

  // ----------
  SyncMode.prototype = OpenSeadragon.extend({
    // ----------
    destroy: function () {
      this.images.forEach(function (image) {
        image.sync.container.parentNode.removeChild(image.sync.container);
        image.sync.viewer.destroy();
        delete image.sync;
      });

      this.innerContainer.parentNode.removeChild(this.innerContainer);
    },

    // ----------
    getZoom: function () {
      var viewer = this.images[0].sync.viewer;
      return viewer.viewport.getZoom();
    },

    // ----------
    setZoom: function (zoom) {
      var viewer = this.images[0].sync.viewer;
      viewer.viewport.zoomTo(zoom, null, true);
      this.startingZoom = zoom;
    },

    // ----------
    getPan: function () {
      var viewer = this.images[0].sync.viewer;
      return viewer.viewport.getCenter();
    },

    // ----------
    setPan: function (pan) {
      var viewer = this.images[0].sync.viewer;
      viewer.viewport.panTo(pan, true);
      this.startingPan = pan;
    },

    // ----------
    zoomIn: function () {
      var viewer = this.images[0].sync.viewer;
      viewer.viewport.zoomBy(viewer.zoomPerClick);
      viewer.viewport.applyConstraints();
    },

    // ----------
    zoomOut: function () {
      var viewer = this.images[0].sync.viewer;
      viewer.viewport.zoomBy(1 / viewer.zoomPerClick);
      viewer.viewport.applyConstraints();
    },

    // ----------
    updateImageShown: function (image) {
      image.sync.container.style.display = image.shown ? 'block' : 'none';
    },

  }, OpenSeadragon.EventSource.prototype);



  // ----------
  window.CurtainSyncViewer = function (args) {
    var self = this;

    console.assert(args, '[CurtainSyncViewer] args is required');
    console.assert(args.container, '[CurtainSyncViewer] args.container is required');
    console.assert(args.images, '[CurtainSyncViewer] args.images is required');
    console.assert(args.images.length > 0, '[CurtainSyncViewer] args.images must have at least 1 image');

    OpenSeadragon.EventSource.call(this);

    this.container = args.container;
    this.viewportEventThrottle = args.viewportEventThrottle || 250;
    this.lastViewportEventTime = 0;
    this.images = [];
    this.osdOptions = args.osdOptions || {};
    this.osdOptions.showNavigationControl = false; // hardcode to override this option


    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    args.images.forEach(function (argsImage, i) {
      console.assert(argsImage.key, '[CurtainSyncViewer] args.images[' + i + '].key is required');
      console.assert(argsImage.tileSource, '[CurtainSyncViewer] args.images[' + i + '].tileSource is required');

      var image = {
        key: argsImage.key,
        tileSource: argsImage.tileSource,
        shown: !!argsImage.shown,
        isCurtain: !!argsImage.isCurtain
      };

      self.images.push(image);
    });
    console.log('call set mode');
    this.setMode(args.mode || 'curtain');


  };

  // ----------
  window.CurtainSyncViewer.prototype = OpenSeadragon.extend({

    // findme note: register functions here to be exposed to the external access.

    // ----------
    getMode: function () {
      return this.modeKey;
    },

    // ----------
    setMode: function (key, images) {
      console.log('setMode ' + key + ' images:' + images);
      var self = this;

      console.assert(key === 'curtain' || key === 'sync', '[CurtainSyncViewer.setMode] Must have valid key.');
      if (key === this.modeKey && !images) {
        return;
      }

      if (images) {
        console.log('set images');
        this.images = images;
      }

      if (this.mode) {
        this.mode.destroy();
      }

      this.modeKey = key;

      var config = {
        container: this.container,
        images: this.images,
        zoom: this.zoom,
        pan: this.pan,
        osdOptions: OpenSeadragon.extend({}, this.osdOptions)
      };

      if (key === 'curtain') {
        this.mode = new CurtainMode(config);
      } else { // sync
        this.mode = new SyncMode(config);
      }

      this.mode.addHandler('change:viewport', function () {
        self.handleViewportChange();
      });

      this.mode.addHandler('add-item-failed', function (event) {
        self.raiseEvent('open-failed', {
          message: event.message || '',
          tileSource: event.options ? event.options.tileSource : undefined
        });
      });

      this.raiseEvent('change:mode');

    },

    // findme added ----------
    // returns the view object
    getViewer: function () {
      return this.mode.getViewer();
    },


    // ----------
    getZoom: function () {
      return this.mode.getZoom();
    },

    // ----------
    setZoom: function (zoom) {
      console.assert(typeof zoom === 'number' && zoom > 0 && zoom < Infinity, '[CurtainSyncViewer.setZoom] zoom must be a positive number');
      this.mode.setZoom(zoom);
      this.handleViewportChange();
    },

    // ----------
    zoomIn: function () {
      this.mode.zoomIn();
      this.handleViewportChange();
    },

    // ----------
    zoomOut: function () {
      this.mode.zoomOut();
      this.handleViewportChange();
    },

    // ----------
    getPan: function () {
      return this.mode.getPan();
    },


    // ----------
    setPan: function (pan) {
      console.assert(typeof pan === 'object' && typeof pan.x === 'number' && typeof pan.y === 'number',
        '[CurtainSyncViewer.setPan] pan must be an object with an x and a y');

      this.mode.setPan(new OpenSeadragon.Point(pan.x, pan.y));
      this.handleViewportChange();
    },

    //findme: possibly deprecated?
    // ----------
    getImageShown: function (key) {
      var shown = false;
      this.images.forEach(function (image) {
        if (image.key === key && image.shown && image.curtain) {
          shown = true;
          curtain = true;
        }
      });

      return shown;
    },

    // ----------
    setImageShown: function (key, shown) {
      var self = this;
      shown = !!shown;
      var changed = false;
      this.images.forEach(function (image) {
        if (image.key === key && image.shown !== shown) {
          changed = true;
          image.shown = shown;
          self.mode.updateImageShown(image);
        }
      });

      if (changed) {
        this.raiseEvent('change:imageShown', {
          key: key
        });
      }
    },

    // ----------
    //findme : added
    replaceImages : function (images) {
      console.log(images);
      return this.mode.replaceImages(images);
    },

    // ----------
    //findme : added
    setLayerOpacity: function (level,opacity,split) {
      this.mode.setLayerOpacity(level,opacity,split);
    },

    //findme : added
    setSplit: function () {
      this.mode.setSplit();
    },

    // ----------
    //findme : added
    setLayerSource (level, opacity) {
      this.mode.setLayerSource(level,opacity);
    },

    // ----------
    handleViewportChange: function () {
      var self = this;
      var zoom = this.getZoom();
      var pan = this.getPan();

      if (this.zoom !== zoom || !this.pan || this.pan.x !== pan.x || this.pan.y !== pan.y) {
        if (!this.viewportEventTimeout) {
          var now = Date.now();
          var diff = now - this.lastViewportEventTime;
          if (diff < this.viewportEventThrottle) {
            this.viewportEventTimeout = setTimeout(function () {
              self.viewportEventTimeout = null;
              self.raiseEvent('change:viewport');
              self.lastViewportEventTime = Date.now();
            }, this.viewportEventThrottle - diff);
          } else {
            this.raiseEvent('change:viewport');
            this.lastViewportEventTime = now;
          }
        }
      }

      this.zoom = zoom;
      this.pan = pan;
    }
  }, OpenSeadragon.EventSource.prototype);

})();




//findme to do:  add cross fade while switching images OR destroy and rebuild the viewer each time and fade with jquery?
//https://github.com/openseadragon/openseadragon/issues/1552
