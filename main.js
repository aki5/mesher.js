
(function(window){
	"use strict";

	var cam = camera.New();
	cam.dist = 400;
	cam.yaw = Math.PI/3.0;
	cam.pitch = Math.PI/5.0;

	/*
	 *	I suspect the following create3DContext / setupWebGL rubbish is no longer necessary.
	 *	at any rate, they came from webgl-utils.js, licensed under three-clause BSD license.
	 */
	function create3DContext(canvas, options) {
		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		var context = null;
		for (var ii = 0; ii < names.length; ++ii) {
			try {
				context = canvas.getContext(names[ii], options);
			} catch(e){}
			if(context) {
				break;
			}
		}
		return context;
	};


	function setupWebGL(canvas, options) {
		if (!window.WebGLRenderingContext) {
			console.log("no webgl rendering context");
			return null;
		}
		var context = create3DContext(canvas, options);
		if (!context) {
		}
		return context;
	};


	function windowSetup() {
		var canvas = document.getElementById("glcanvas");
		var gl = setupWebGL(canvas, {stencil:false, antialias:true, premultipliedAlpha: true});
		if (!gl) {
			console.log("failed to setup webgl canvas");
			return;
		}

		var renderer = render.New(gl, canvas);

		window.addEventListener("resize",
			function(ev) {
				renderer.Kick();
			},
			false
		);

		/* mouse interface */
		canvas.addEventListener("mousedown",
			function(ev){
				var rect = canvas.getBoundingClientRect();
				var cam = renderer.scene.camera0;
				ev.preventDefault();
				cam.mousedown(ev.clientX-rect.left, ev.clientY-rect.top);
				renderer.Kick();
			},
			false
		);
		canvas.addEventListener("mousemove",
			function(ev){
				var rect = canvas.getBoundingClientRect();
				var cam = renderer.scene.camera0;
				ev.preventDefault();
				cam.mousemove(ev.clientX-rect.left, ev.clientY-rect.top);
				renderer.Kick();

			},
			false
		);
		canvas.addEventListener("mouseup",
			function(ev){
				var rect = canvas.getBoundingClientRect();
				var cam = renderer.scene.camera0;
				ev.preventDefault();
				cam.mouseup(ev.clientX-rect.left, ev.clientY-rect.top);
				renderer.Kick();
			},
			false
		);

		canvas.addEventListener("wheel",
			function(ev){
				var rect = canvas.getBoundingClientRect();
				var cam = renderer.scene.camera0;
				ev.preventDefault();
				cam.mousewheel(ev.clientX-rect.left, ev.clientY-rect.top, ev.deltaY);
				renderer.Kick();
			},
			false
		);

		/* touch interface */
		canvas.addEventListener("touchstart",
			function(ev){

			},
			false
		);
		canvas.addEventListener("touchmove",
			function(ev){

			},
			false
		);
		canvas.addEventListener("touchend",
			function(ev){

			},
			false
		);

		// kick the renderer to draw a scene.
		renderer.Kick();

		return gl;
	}

	function main(){
		var gl = windowSetup();
	}

	window["main"] = main;

})(window);
