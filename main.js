
(function(window){
	"use strict";

	var renderer;

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
			console.log("failed to create 3d context for canvas, options: " + options);
			return null;
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

		renderer = render.New(gl, canvas);

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
		windowSetup();

		var light0Pitch = document.getElementById("light0Pitch");
		if(!light0Pitch){
			console.log("lightpitch element not found in document");
		} else {
			light0Pitch.addEventListener("input",
				function(ev){
					var pitch = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light0.SetPitch(pitch);
					renderer.Kick();
					console.log("setting pitch to '" + pitch + "'");
				},
				false
			);
		}

		var light1Pitch = document.getElementById("light1Pitch");
		if(!light1Pitch){
			console.log("lightpitch element not found in document");
		} else {
			light1Pitch.addEventListener("input",
				function(ev){
					var pitch = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light1.SetPitch(pitch);
					renderer.Kick();
					console.log("setting pitch to '" + pitch + "'");
				},
				false
			);
		}

		var light2Pitch = document.getElementById("light2Pitch");
		if(!light2Pitch){
			console.log("lightpitch element not found in document");
		} else {
			light2Pitch.addEventListener("input",
				function(ev){
					var pitch = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light2.SetPitch(pitch);
					renderer.Kick();
					console.log("setting pitch to '" + pitch + "'");
				},
				false
			);
		}


		var light0Yaw = document.getElementById("light0Yaw");
		if(!light0Yaw){
			console.log("lightpitch element not found in document");
		} else {
			light0Yaw.addEventListener("input",
				function(ev){
					var yaw = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light0.SetYaw(yaw);
					renderer.Kick();
					console.log("setting yaw to '" + yaw + "'");
				},
				false
			);
		}

		var light1Yaw = document.getElementById("light1Yaw");
		if(!light1Yaw){
			console.log("lightpitch element not found in document");
		} else {
			light1Yaw.addEventListener("input",
				function(ev){
					var yaw = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light1.SetYaw(yaw);
					renderer.Kick();
					console.log("setting yaw to '" + yaw + "'");
				},
				false
			);
		}

		var light2Yaw = document.getElementById("light2Yaw");
		if(!light2Yaw){
			console.log("lightpitch element not found in document");
		} else {
			light2Yaw.addEventListener("input",
				function(ev){
					var yaw = ev.target.valueAsNumber / 180.0 * Math.PI;
					renderer.scene.light2.SetYaw(yaw);
					renderer.Kick();
					console.log("setting yaw to '" + yaw + "'");
				},
				false
			);
		}


//modlr.DumpEdges();
/*
		for(var i = 0; i < 10; i++){
			console.log("cur " + i + " Next: " + modlr.Next(i));
			console.log("cur " + i + " Prev: " + modlr.Prev(i));
			console.log("cur " + i + " Right: " + modlr.Right(i));
			console.log("cur " + i + " Flip: " + modlr.Flip(i));
			console.log("cur " + i + " Left: " + modlr.Left(i));
		}
*/

	}

	window["main"] = main;

})(window);
