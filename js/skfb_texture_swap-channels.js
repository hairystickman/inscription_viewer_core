/*
 Special thanks to O. Murray for suggesting exploring this and providing the incentive to try this out.
 This code drew on free online resources and tutorials.
 additional references in code

 Please improve, build and share it freely also
 This includes hard coded sections to handle an example scene for the Kings Chamber demo,
 available at the time of writing at http://ommphoto.ca/kings_chamber-v01/kings_chamber.html

  This code is very much a WORK IN PROGRESS, use at your own peril

  Note on notes
  Tasks planned for the future, references, debug calls and other in-progress notes are identified witht he prefix 'findme'
*/



/* functions that need to called from external scripts/pages*/

  function selectScene (index) {
        /*
          findme todo: Only a shim for handling only small number of scenes with the possible selections 'baked in'.
          Modify to load info from a json file.

          -1 check ignores clicks on the model that aren't an annotation
        */


            if (index >-1){


              $('.scene-active').removeClass('scene-active');
              // note index starts at 0. needs to be compensated
              var scene = "#scene-" + index;
              $(scene).addClass('scene-active')


            // Detects if the scene has an inscription to load in the viewer or not and hides if not.
            // This is a hard coded temporary fix
            // Findme todo: replace with dynamic method to listen if an annotation has a finished inscription or not.
            if (index == 1) {
//                  container.style.clipPath = 'inset(0 0 100% 0)';
              $('#osd-container').css('opacity','0');
              setTimeout(function(){ $('#osd-container').addClass('invisible'); }, 200);

              $('#inscription-tab-li').addClass('d-none');
              $('#inscription-tab').removeClass('active');
              $('#gallery-tab').addClass('active');
              initialiseGallery();//only runs if not already initialised (ie not viewed yet)
              $('#osd-gallery-container').removeClass('invisible');
              $('#osd-gallery-container').css('opacity','100');
            }else{
              /* displays the sample viewer */
              $('#osd-container').removeClass('invisible');
              $('#osd-container').css('opacity','100');
              $('#inscription-tab-li').removeClass('d-none');
              $('#inscription-tab').addClass('active');
              $('#gallery-tab').removeClass('active');

              //gallery.style.marginTop = '0';
              //gallery.style.opacity = 0;

              setTimeout(function() {
                $('#osd-gallery-container').addClass('invisible');
//                      osdViewer.setMode('curtain',images);
//                      container.style.opacity = 1;
//                      container.style.clipPath = 'inset(0 0 0 0)';
              }, 200);
            }


            // findme todo: proceduralize to handle n number of scenes
            // Set the content based on the selection
            if (index == 0){
              //findme todo: hides additional tools when ready. turn this into an easy system using a flag.
              //$("#inscription-tools").addClass("d-none");
              $("#accordion-inscription-tools").addClass("d-none");
              //find me todo: show/hide or enabl/disable illustation slider

              $(".osdGalleryViewer").removeClass("hidden");
              // set the title
              $('#title').text('Plate 1');

              // set the description text
              $.get('pages/page01.txt', function (data) {
                  $("#text-container").html(data);
              });




              // switch the viewer
              // normall this bit of code won't be called called if the page starts with this scene.
              if (osdViewer0 == undefined){
                  tileSources = ['manifests/pl83_photo.json','manifests/pl82_archive.json','manifests/pl83_drawing.json','manifests/pl82_archive.json'];
                  makeCurtainSyncViewer(tileSources,0);


                // set up the scalebar for the viewer
                osdViewer0.getViewer().scalebar({
                  minWidth: '200px',
                  pixelsPerMeter: 5197.5,
                  color: '#000',
                  barThickness: 5,
                  stayInsideImage: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  xOffset: 10,
                  yOffset: 70,
                  location: OpenSeadragon.ScalebarLocation.TOP_LEFT,
                  stayInsideImage: false,
                  type: 'microscopy'
                });
              }

              //swap visible viewers
              $(".osdViewer").addClass("hidden");
              $("#osd-viewer-0").removeClass("hidden");

              // pass the id of the current viewer
              currentViewer = osdViewer0;
              // update the split to match the current pos of the nubbin
              currentViewer.setSplit();


              // findme todo: automate
              // Plate 85, East Wall: Decoration Surrounding the Doorway (pl 85)
              galleryTileSources = ['manifests/entrance_1303.json','manifests/entrance_pl82.json'];



              //findme todo: make more cleverer
              // calls open gallery here as a shim incase the gallery is already open
              osdGalleryViewer.open(galleryTileSources,0);

            }
            // index 2 = page3
            if (index == 2) {
              //findme todo: hides additional tools when ready. turn this into an easy system using a flag.
                $("#inscription-tools").removeClass("d-none");
                $("#accordion-inscription-tools").removeClass("d-none");
                // set the title
                //findme move
                $('#title').text('Plate 3');

                // set the description text
                $.get('pages/page03.txt', function (data) {
                    $("#text-container").html(data);
                });

                // swap visible viewers
                // viewer container must be shown before initializing the viewer otherwise it will break
                $(".osdViewer").addClass("hidden");
                $("#osd-viewer-2").removeClass("hidden");

                // switch the viewer
                //initialise if not already viewed
                if (osdViewer2 == undefined){
                  //other images
                  console.log('osdViewer2 undefined');
                  tileSources = ['manifests/pl86_photo.json','manifests/pl86_archival.json','manifests/pl87_drawing.json','manifests/pl87_drawing.json'];
                  osdViewer2 = makeCurtainSyncViewer(tileSources,2);

                  // set up the scalebar for the viewer
                  osdViewer2.getViewer().scalebar({
                    minWidth: '200px',
                    pixelsPerMeter: 5197.5,
                    color: '#000',
                    barThickness: 5,
                    stayInsideImage: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    xOffset: 10,
                    yOffset: 70,
                    location: OpenSeadragon.ScalebarLocation.TOP_LEFT,
                    stayInsideImage: false,
                    type: 'microscopy'
                  });
                // findme note: mini console utility/tool for getting OSD image coordinates for setting up polygons
                // findme ref: simplified from https://openseadragon.github.io/examples/viewport-coordinates/
                osdViewer2.getViewer().addHandler('canvas-click', function(event) {
                    // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
                    var viewportPoint = currentViewer.getViewer().viewport.pointFromPixel(event.position);
                    console.log(viewportPoint.toString());
                });



                  /*
                    findme todo: this hard coded overlay rectangles for demo only
                    replace with more dynamic system
                  */
                  var svgOverlay = osdViewer2.getViewer().svgOverlay();

                  var svgLine1 = d3.select(svgOverlay.node()).append("polygon")
                      .style('fill' , 'rgba(0,0,0,0)')
                      .style('stroke-width' , '0.002')
                      .attr('id','svg-line1')
                      .attr("class","highlight highlight-hidden")
                      /* findme note: for now get coordinates from OS viewer */
                      /* top left xy, bottom left xy, bottom right xy, top right xy */
                      .attr("points", '0.18 0.26,0.21 0.26,0.21 0.41,0.18 0.41');

                  var svgLine2 = d3.select(svgOverlay.node()).append("polygon")
                      .style('fill' , 'rgba(0,0,0,0)')
                      .style('stroke-width' , '0.002')
                      .attr('id','svg-line2')
                      .attr("class","highlight highlight-hidden")
                      /* findme note: for now get coordinates from OS viewer */
                      /* top left xy, bottom left xy, bottom right xy, top right xy */
                      .attr("points", '0.755 0.125,0.755 0.2,0.785 0.2,0.785 0.125');

                  var svgLine3 = d3.select(svgOverlay.node()).append("polygon")
                      .style('fill' , 'rgba(0,0,0,0)')
                      .style('stroke-width' , '0.002')
                      .attr('id','svg-line3')
                      .attr("class","highlight highlight-hidden")
                      /* findme note: for now get coordinates from OS viewer */
                      /* top left xy, bottom left xy, bottom right xy, top right xy */
                      .attr("points", '0.755 0.1,0.755 0.125,0.84 0.125,0.84 0.1');

                      /* and so on and so forth */
                }


                currentViewer = osdViewer2;
                currentViewer.setSplit();


                // findme todo: automate
                galleryTileSources =   [
                  'manifests/south_1297.json',
                  'manifests/south_1298.json',
                  'manifests/south_7556.json',
                  'manifests/south_7557.json'
                ];

                //findme todo: make more clevererv
                // calls open gallery here as a shim incase the gallery is already open
                osdGalleryViewer.open(galleryTileSources,0);

                // set the gallery images
                /* findme deprecated
                osdGalleryViewer.open(
                [array of iiif manifests],0);
                */



            }


            //index 1 = page 2
            if (index == 1){

              //findme todo: hides additional tools when not available. turn this into an easy system using a flag.
              $("#inscription-tools").addClass("d-none");

              // set the title
              $('#title').text('Plate 85: Decoration Surrounding the Doorway in the King’s Chamber');

              // set the description text
              $.get('pages/page02.txt', function (data) {
                  $("#text-container").html(data);

              });


              //swap visible viewers
              // viewer container must be shown before initializing the viewer otherwise it will break
              $(".osdViewer").addClass("hidden");
        //      $(".osdGalleryViewer").addClass("hidden");

              galleryTileSources =   [
                'manifests/east_13706.json',
                'manifests/east_1302.json'
              ];
              osdGalleryViewer.open(galleryTileSources,0);
            }
        }
  }







// findme note: requires the sketchfab api to be loaded.
// findme note: requires a textured material on the model.

// findme credit: canvas code based on w3schools examples
// findme credit: sketchfab code wrangled out of Sktechfab viewer API examples
// https://sketchfab.com/developers/viewer/examples?sample=Update%20Texture&utm_source=forum&utm_medium=referral

// wait for the page to load fully or the canvas won't draw properly
document.addEventListener("DOMContentLoaded", ready, false);
function ready(){


  // error trap and set defualts for variables passed
  var script_id = document.getElementById('texture_mixer')
  if(typeof script_id.getAttribute('data-max') === undefined) {
      var max = 4096;
    }else{
      var max = script_id.getAttribute('data-max')
    }
  if(typeof script_id.getAttribute('data-mid') === undefined) {
      var mid =  1024;
    }else{
      var mid =  script_id.getAttribute('data-mid')
    }
  if(typeof script_id.getAttribute('data-min') === undefined) {
      var min =  256;
    }else{
      var min =  script_id.getAttribute('data-min')
    }



// fullscreen set up
    var fullscreener = document.getElementById("skfb_frame");     // the frame to make fullscreen
    var btnFullScreen = document.getElementById("btnFullScreen"); // the button
    btnFullScreen.onmousedown = function () {                     // the event
      if (fullscreener.classList.contains('fullscreen')){
        closeFullscreen();
      }else{
        openFullscreen();
      }
    }


// Fullscreener (from w3schools)
  function openFullscreen() {
    fullscreener.classList.add('fullscreen');    //swap view size
    if (fullscreener.requestFullscreen) {
      fullscreener.requestFullscreen();
    } else if (fullscreener.mozRequestFullScreen) { /* Firefox */
      fullscreener.mozRequestFullScreen();
    } else if (fullscreener.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      fullscreener.webkitRequestFullscreen();
    } else if (fullscreener.msRequestFullscreen) { /* IE/Edge */
      fullscreener.msRequestFullscreen();
    }

  }


  function closeFullscreen() {
    fullscreener.classList.remove('fullscreen'); //swap view size
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }





  // Sketchfab Viewer API set up
  // this is the unique ID of the model in the viewr from the sketchfab URL
  if(typeof script_id.getAttribute('data-uid') === undefined) {
      console.log ('no model uid set');
    }else{
      var uid = script_id.getAttribute('data-uid')
    };

  // the version of the skfb api script used
  if(typeof script_id.getAttribute('data-ver') === undefined) {
      console.log ('no version set');
      stop();
    }else{
      var version = script_id.getAttribute('data-ver')
    };



  var iframe = document.getElementById('api-frame');    // id for sketchfab iframe
  var client = new window.Sketchfab(version, iframe);   // uses the sketchfab api script above
  var apiSkfb;

  var mixedTextureId;            // the sketchfab texture that will be updated with canvas data
  var arrMaterials;              // container for an array of materials present on the model being viewed
  var materialsByName = {};      // object for an individual named material used in registrering textures

  var error = function() {
      console.error('Sketchfab API error');
  };





  // flag used for registering the materials with the api only once
  // but not autmatically replacing the default texture till UI
  // element is used
  var isRegistered = false;


  // slider set up
  var btnDetail = document.getElementById("btnDetail");
  var slider = document.getElementById("swap-slider");
//  var sliderFullscreen = document.getElementById("swap-slider-fullscreen"); // the slider visible in fullscreen


  // canvas set up
  // findme todo: Setup multiple canvases for multi-texture objects
  var c = document.createElement("CANVAS");
  c.setAttribute("width",min);
  c.setAttribute("height",min);
  c.setAttribute("id","textureCanvas");
  c.classList.add("hidden");
  var img = document.getElementById("texture1");
  var img2 = document.getElementById("texture2");
  var ctx = c.getContext("2d");



  // sets the size of the texture canvas. always sqaure
  function setCanvasSize (context, size) {
    context.canvas.width = size;
    context.canvas.height = size;
  }


  // mix the two images in a hidden canvas
  function mixTextures() {
    ctx.globalAlpha = 1;                        // sets the background image opacity to be maximum
    ctx.drawImage(img,0,0,c.width,c.height);
    ctx.globalAlpha = slider.value/100;         // set the opacity of the overlying image to transparency of the slider.
    ctx.drawImage(img2,0,0,c.width,c.height);
  }


  function udpateTexture(api, quality = 0.92) {
      // render the current canvas into a bit stream to be sent to the texture
      var url = c.toDataURL('image/png', quality);

      //update the registered texture with the new image data
      api.updateTexture(url, mixedTextureId);
  }


  function mixChannels(api){
    // a very helpful example  https://jsfiddle.net/sketchfab/rabweuzd/

    // m.channels.EmitColor.factor = 1;
    for (var i = 0; i < arrMaterials.length; i++) {
      var m = arrMaterials[i]

      m.channels['EmitColor'].factor = 1 - slider.value/100;

/*
      use uid to set the texture if the emit isn't on when lodaded
      if Emit is 0, or off then the texture won't load.
      need to hack it, either 0.01 emit works, or apply texture on a hidden object

      m.channels['EmitColor'].enable = true;
      m.channels['EmitColor'].texture = {
          uid: 'e4265377f6e441cbb525bc89a470f643'
      };
*/

      m.channels.AlbedoPBR.factor = slider.value/100;
      api.setMaterial(m);
    }
  }


  // textures the model with a new image replacing the default image
  function registerTexture(api) {
      // set the data url to the current canvas output
      var url = c.toDataURL('image/png', 0.92);

      // register the texture with the api
      api.addTexture(url, function(err, textureId) {
          mixedTextureId = textureId;

          //findme todo: implement multiple material support
          if (arrMaterials.length > 1) {
            console.log("multiple material handling not yet implemented");
          }
          var m = arrMaterials[0];

          // apply the texture
          m.channels['AlbedoPBR'].texture = {
              uid: textureId
          };

          // disable emit texture
//        m.channels['EmitColor'].enable = false;
          // disable the normal map
//        m.channels['NormalMap'].enable = false;

          // set the material
          api.setMaterial(m);

      });
  }





  // kick off the code once the sketchfab api link is running
  var success = function(api) {
      apiSkfb = api;
      api.start(function() {
          // wait for the viewer to be active
          api.addEventListener('viewerready', function() {

            /* texture lists for bug tracking
             api.getTextureList( function( err, textures ) {
                      console.log('textures');
            			    console.log( textures );
            			    console.log( textures[textures.length-1].uid );
            			} );
              */

              // remove the loading message
              document.getElementById("loading").classList.add("hidden");

              // show the controls
          		console.log('viewer ready');
              var elements = document.getElementsByClassName("viewer-controls");
//              console.log('elements' + elements.length);
              for (var i = 0; i < elements.length; i++) {
//                  console.log('i ' + i);
                  elements[i].classList.add("fade-in");
                  elements[i].classList.remove("invisible");
              }


              // Only done once
              // get materials on current model and output in console if need to get a name of one later
              api.getMaterialList(function(err, materials) {
                  arrMaterials = materials;
                  // findme todo: impliment multi-texture handling
                  // check if there is more than 1 material and spew out the names

                  // output materials to console and create named array of objects that can
                  // be used as reference later. From starting example not really needed (?)
                  for (var i = 0; i < arrMaterials.length; i++) {
                      var m = arrMaterials[i];
                      materialsByName[m.name] = m;
//                      console.log('pick a material ', m.name);
                  }
              });


              // Slider handling
              // Update the current slider value (each time you drag the slider handle)
              slider.oninput = function() {
//                  sliderFullscreen.value = slider.value;
                  mixChannels(api);
                  //findme note: Used to have handlers for percentage values etc.
              }

              // changes value of normal slider and then updates the model
/*    deprecated repositioned slider instead          sliderFullscreen.oninput = function () {
                  slider.value = sliderFullscreen.value;
                  mixChannels(api);
              }
*/

              //findme note: requires OSload to be initialised in front of sketchfab
              // annotation click handler
              api.addEventListener('annotationSelect', function(index) {
                selectScene(index);
              });

              $('.scene-enabled').click(function () {
                  api.gotoAnnotation( $(this).attr("data-index-number") );
              })
          });

      });

  };


  // initialise the sketchfab api
  client.init(uid, {
      success: success,
      error: error,
      autostart: 0,
      camera: 0,
      preload: 1,
      ui_watermark: 0,
      ui_infos: 0,
      ui_fadeout: 0
  });

}



// findme@hairystickman.co.uk
