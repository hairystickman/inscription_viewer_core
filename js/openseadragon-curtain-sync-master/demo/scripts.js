var myViewer = {

  /**
   * Init method.
   */
  init: function() {

    this.initViewActions();
    this.initModeActions();
    this.initZoomActions();

  },

  /**
   * View Actions.
   */
  initViewActions: function() {

    // add click event to switch views
    $('.view-trigger').on('click', function (e) {
      var thisView = $(this),
        isMobile = (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);

      e.preventDefault();
      thisView.toggleClass('active');
      viewer.setImageShown(thisView.data('type'), thisView.hasClass('active'));

      // need this to initiate curtain view on mobile
      if (isMobile) {
        var thisZoom = viewer.getZoom();
        viewer.setZoom(thisZoom + 0.000000000001);
      }

    });

  },

  /**
   * Mode actions.
   */
  initModeActions: function() {

    // click event to trigger mode change
    $('.mode-trigger').on('click', function (e) {
      var thisMode = $(this);
      e.preventDefault();

      if ($(window).width() < 768) {
        alert("Modes are not available on small screens. Please view on a larger screen to access modes.");
        return false;
      }

      $('.mode-trigger').removeClass('active');
      thisMode.addClass('active');
      viewer.setMode(thisMode.data('mode'));

    });

  },

  /**
   * Zoom actions.
   */
  initZoomActions: function() {

    // click event to zoom in/out
    $('.zoom-trigger').on('click', function () {
      var thisZoom = $(this);

      if (thisZoom.data('type') === 'in') {
        viewer.zoomIn();
      } else {
        viewer.zoomOut();
      }
    });

  }

}

/**
 * Run functions on doc ready.
 */
$(document).ready(function(){
  myViewer.init();
});
