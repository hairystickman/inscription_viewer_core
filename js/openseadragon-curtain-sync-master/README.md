# Curtain & Sync Modes for OpenSeadragon

This library is an extension for [OpenSeadragon](https://openseadragon.github.io/#) that enables side-by-side, syncronized image viewing. This extension will add the "curtain" and "sync" view modes to any OpenSeadragon viewer.

**Curtain mode** overlays images on top of each other and reveals more or less of each image based on your cursor position.

**Sync mode** shows images side-by-side but keeps each image in sync as the user zooms or pans.

## Demo
[View the demo here](https://cuberis.github.io/openseadragon-curtain-sync/demo/)

*\*All images courtesy of The Leiden Collection*

## Install
1. [Download and install OpenSeadragon](https://openseadragon.github.io/#download).
2. Include `openseadragon-curtain-sync.min.js` on your page.

## Getting Started
This library includes only the javascript for extending OpenSeadragon. It does not include any of the UI elements for interacting with the CurtainSyncViewer. You may use any of the [default configuration options](https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) passed in an object via the `osdOptions` argument, but must include the new `images` option which is specific to this plugin.

**First**, initialize the viewer (note: this example uses IIIF for image tiling).

```js
var viewer = new CurtainSyncViewer({

  // default options
  container: document.querySelector('#viewer'),

  // images used by the viewer (2 or more).
  // "key" (string) - a unique string used to target this image.
  // "shown" (boolean) - whether the image is on/off when page is loaded.
  images: [
    {
      key: 'my-key-1',
      tileSource: 'https://url-to-iiif-manifest.json',
      shown: true
    },
    {
      key: 'my-key-2',
      tileSource: 'https://url-to-iiif-manifest.json',
    }
  ],

  // OpenSeaDragon options
  osdOptions: {
    zoomPerClick: 2
  },

});
```

**Second**, implement the UI for interacting with the new view modes. Below is a simple example using jQuery. For a more detailed example, see the demo.

```js
// show an alternate image
$('#myButton').on('click', function(e){
  viewer.setImageShown('my-key-2', true);
});

// switch view mode ("curtain" or "sync")
$('#myButton').on('click', function(e){
  viewer.setMode('curtain');
});
```

## Methods
The following new methods are now available on the viewer instance.

Method|Args|Description
-|-|-
`getImageShown`|*key*|Returns `true` or `false` for a given image `key`.
`setImageShown`|*key,*<br>*shown*|Shows or hides an image `key` based on the `shown` arguement.
`getMode`|*none*|Returns the current viewer mode.
`setMode`|*mode*|Sets the mode for the viewer (`mode` = "curtain" or "sync"). If no key is provided, it will default to "sync" mode.

**Example:**
```js
var viewer = new CurtainSyncViewer(options);
viewer.setMode('sync');
```

## DZI Image Sources
Each image in the demo and examples above use IIIF for the `TileSource` which makes things super easy. However, you can also choose to use any of the OpenSeadragon supported [DZI image formats](https://openseadragon.github.io/examples/creating-zooming-images/). An example would look like:

```js
var viewer = new CurtainSyncViewer({
  container: document.querySelector('#viewer'),
  images: [
    {
      key: 'my-key-1',
      tileSource: {
        Image: {
          xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
          Url: 'https://url-to-your-image-tiles-folder',
          Format: 'jpg',
          Overlap: '1',
          TileSize: '128',
          Size: {
            Width:  '5183',
            Height: '6539'
          }
        }
      },
      shown: true
    },
    {
      key: 'my-key-2',
      tileSource: {
        Image: {
          xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
          Url: 'https://url-to-your-image-tiles-folder',
          Format: 'jpg',
          Overlap: '1',
          TileSize: '128',
          Size: {
            Width:  '5183',
            Height: '6539'
          }
        }
      },
    }
  ],
});
```
