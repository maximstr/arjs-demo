require(["AR"], function(AR) {
    
    // html elements
    var arContainer = document.getElementById("ar_container");
    //var modelButton = document.getElementById("model_button");
    //var fullscreenButton = document.getElementById("fullscreen_button");

    // pseudo classes instances
    var augmentedReality = new AR(arContainer);

    // event listeners
    //modelButton.addEventListener("click", onButtonClick);
    //fullscreenButton.addEventListener("click", onFullscreenButton);

    // event listeners callbacks
    // function onButtonClick() {
    //     var id = augmentedReality.changeModel();
    //     if (id == 8) modelButton.innerHTML = "Change to Frog";
    //     else if (id == 1) modelButton.innerHTML = "Change to Bird";
    //     else if (id == 2) modelButton.innerHTML = "Change to Panorama1";
    //     else if (id == 3) modelButton.innerHTML = "Change to Panorama2";
    //     else if (id == 4) modelButton.innerHTML = "Change to Panorama3";
    //     else if (id == 5) modelButton.innerHTML = "Change to Panorama4";
    //     else if (id == 6) modelButton.innerHTML = "Change to Head";
    //     else if (id == 7) modelButton.innerHTML = "Change to Secret";
    // }

    // function onFullscreenButton() {
    //     augmentedReality.goFullscreen();
    // }





    // AugmentedReality.prototype.goFullscreen = function() {
    //     var elem = document.getElementsByTagName("canvas")[0];
    //     elem.webkitRequestFullScreen();
    // }
});