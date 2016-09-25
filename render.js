
(function(window){
	"use strict";

	function New(gl, canvas) {

		if(!gl || !canvas){
			if(!gl)
				console.log("render.New: null gl context parameter\n");
			if(!canvas)
				console.log("render.New: null canvas parameter\n");
			return null;
		}

		return new Render(gl, canvas);
	}

	function Render(gl, canvas) {
		this.gl = gl;
		this.canvas = canvas;

		this.width = -1;
		this.height = -1;
		this.kickSeq = 0;
		this.drawSeq = 0;

		// enable depth textures
		this.depthTextureExt = gl.getExtension("WEBGL_depth_texture") ||
			gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
			gl.getExtension("MOZ_WEBGL_depth_texture");
		if(!this.depthTextureExt) {
			console.log("no depth texture extension");
			return;
		}

		this.fragDepthExt = gl.getExtension("EXT_frag_depth");
		if(!this.fragDepthExt){
			console.log("no frag depth ext");
			return;
		}

		this.triangleProg = shaderProgram(
			gl,
			shaderText("flipnormalshader"), // vertex shader
			shaderText("flatshader"), // vragment shader, "flatshader", "ssaoshader"
			// The vertex attribute names used by the shaders.
			// The order they appear here corresponds to their index
			// used later.
			["position", "normal", "color"],
			["image0", "width", "height", "near", "far", "light0dir", "light1dir", "light2dir", "normal_matrix", "mvp_matrix", "edgecolor", "edgedisp", "fullwin"]
		);

		this.edgeProg = shaderProgram(
			gl,
			shaderText("flipnormalshader"), // vertex shader
			shaderText("edgeshader"), // vragment shader, "flatshader", "ssaoshader"
			// The vertex attribute names used by the shaders.
			// The order they appear here corresponds to their index
			// used later.
			["position", "normal", "color"],
			["image0", "width", "height", "near", "far", "light0dir", "light1dir", "light2dir", "normal_matrix", "mvp_matrix", "edgecolor", "edgedisp", "fullwin"]
		);

		this.dotProg = shaderProgram(
			gl,
			shaderText("flipnormalshader"), // vertex shader
			shaderText("dotshader"), // vragment shader, "flatshader", "ssaoshader"
			// The vertex attribute names used by the shaders.
			// The order they appear here corresponds to their index
			// used later.
			["position", "normal", "color"],
			["image0", "width", "height", "near", "far", "light0dir", "light1dir", "light2dir", "normal_matrix", "mvp_matrix", "edgecolor", "edgedisp", "fullwin"]
		);

		gl.enableVertexAttribArray(0);
		gl.enableVertexAttribArray(1);
		gl.enableVertexAttribArray(2);

		this.scene = {
			camera0: camera.New(400.0, [0.0, 0.0, 0.0], Math.PI/3.0, Math.PI/5.0),

			fNear: 10.0,
			fFar: 3000.0,
			fFov: 45.0,

			light0: camera.New(200.0, [0.0, 0.0, 0.0], 1*(2*Math.PI/5), Math.PI/4),
			light1: camera.New(200.0, [0.0, 0.0, 0.0], 3*(2*Math.PI/5), Math.PI/5),
			light2: camera.New(200.0, [0.0, 0.0, 0.0], 4*(2*Math.PI/5), Math.PI/7),

//			mesh: icosphere(gl, 3, 100.0, [100, 140, 50, 255]),
			mesh: cylinder(gl, 16, 200.0, 50.0, 50.0, [100, 140, 50, 255]),
//			mesh: cylinder(gl, 20, 200.0, 50.0, 50.0, [100, 120, 180, 255]),
//			mesh: cylinder(gl, 20, 200.0, 50.0, 50.0, [255, 255, 255, 255]),

		};
	}


	Render.prototype.Resize = function() {

		var canvas = this.canvas;
		var gl = this.gl;

		var pixelRatio = window.devicePixelRatio || 1;
		var realWidth = canvas.clientWidth*pixelRatio;
		var realHeight = canvas.clientHeight*pixelRatio;

		if(realWidth === canvas.width && realHeight === canvas.height)
			return;

		canvas.width = realWidth;
		canvas.height = realHeight;

		gl.viewport(0, 0, realWidth, realHeight);
		gl.scissor(0, 0, realWidth, realHeight);
		gl.enable(gl.SCISSOR_TEST);
/*
		gl.disable(gl.DITHER);
		gl.disable(gl.SAMPLE_COVERAGE);
		gl.disable(gl.POLYGON_OFFSET_FILL);
		gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
		gl.disable(gl.BLEND);

*/
		console.log("render.Resize ok");
	}

	Render.prototype.Draw = function() {
		var gl = this.gl;
		var canvas = this.canvas;
		var scene = this.scene;

		this.Resize();

		gl.clearColor(0.0,0.0,0.0,0.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.depthMask(true);

		//gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);// UNDER
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);// OVER
		//gl.pointSize(10);

		var cam = scene.camera0;
		var light0dir = norm3(sub3(scene.light0.Position(), scene.light0.Center()));
		var light1dir = norm3(sub3(scene.light1.Position(), scene.light1.Center()));
		var light2dir = norm3(sub3(scene.light2.Position(), scene.light2.Center()));

		var proj = mat4.New();
//this.height/this.width
		proj.Perspective(scene.fFov, canvas.width/canvas.height, scene.fNear, scene.fFar);

		var view = mat4.New();
		view.LookAt(cam.Position(), cam.Center(), [0,0,1]);
		var viewProj = proj.Copy().Multiply(view);

		var modelView = view;
		var normalMatrix = modelView.Copy().Inverse().Transpose();
		//var modelViewProj = viewProj;

		// render the triangles
		var prog = this.triangleProg;
		gl.useProgram(prog);
		gl.uniform3fv(prog.locs["light0dir"], light0dir);
		gl.uniform3fv(prog.locs["light1dir"], light1dir);
		gl.uniform3fv(prog.locs["light2dir"], light2dir);
		gl.uniformMatrix4fv(prog.locs["mvp_matrix"], false, viewProj.Array());
		gl.uniformMatrix4fv(prog.locs["normal_matrix"], false, normalMatrix.Array());
		gl.uniform4fv(prog.locs["edgecolor"], [0.0,0.0,0.0,0.0]);
		gl.uniform1f(prog.locs["edgedisp"], 0.0);
		gl.uniform2fv(prog.locs["fullwin"], [canvas.width, canvas.height]);

		gl.depthFunc(gl.LESS);
		scene.mesh.Bind(gl);
		gl.drawElements(gl.TRIANGLES, 3*scene.mesh.ntris, gl.UNSIGNED_SHORT, 0);

		// render the edges
		var prog = this.edgeProg;
		gl.useProgram(prog);
		gl.uniform3fv(prog.locs["light0dir"], light0dir);
		gl.uniform3fv(prog.locs["light1dir"], light1dir);
		gl.uniform3fv(prog.locs["light2dir"], light2dir);
		gl.uniformMatrix4fv(prog.locs["mvp_matrix"], false, viewProj.Array());
		gl.uniformMatrix4fv(prog.locs["normal_matrix"], false, normalMatrix.Array());
		gl.uniform4fv(prog.locs["edgecolor"], [0.0,0.0,0.0,0.2]);
		gl.uniform1f(prog.locs["edgedisp"], 0.0);
		gl.uniform2fv(prog.locs["fullwin"], [canvas.width, canvas.height]);

		gl.lineWidth(2.0);
		scene.mesh.BindEdges(gl);
		//gl.disable(gl.DEPTH_TEST);
		gl.drawElements(gl.LINES, 6*scene.mesh.ntris, gl.UNSIGNED_SHORT, 0);

		// render the vertices
		var prog = this.dotProg;
		gl.useProgram(prog);
		gl.uniform3fv(prog.locs["light0dir"], light0dir);
		gl.uniform3fv(prog.locs["light1dir"], light1dir);
		gl.uniform3fv(prog.locs["light2dir"], light2dir);
		gl.uniformMatrix4fv(prog.locs["mvp_matrix"], false, viewProj.Array());
		gl.uniformMatrix4fv(prog.locs["normal_matrix"], false, normalMatrix.Array());
		gl.uniform4fv(prog.locs["edgecolor"], [0.0,0.0,0.0,0.2]);
		gl.uniform1f(prog.locs["edgedisp"], 1.0);
		gl.uniform2fv(prog.locs["fullwin"], [canvas.width, canvas.height]);


		//gl.disable(gl.DEPTH_TEST);
		gl.depthMask(false);
		//gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.ONE);// UNDER
		gl.drawArrays(gl.POINTS, 0, 3*scene.mesh.ntris);

		this.drawSeq++;
	}

	Render.prototype.Kick = function() {
                if(this.kickSeq === this.drawSeq){
			var self = this;
			this.kickSeq++;
                        window.requestAnimationFrame(function(){self.Draw();});
                }
	}

	window["render"] = {
		New: New,
	};

	/*
	 *	Creates a new texture
	 *
	 *	format: gl.ALPHA, gl.RGB, gl.RGBA, gl.LUMINANCE, gl.LUMINANCE_ALPHA (standard)
	 *		gl.DEPTH_STENCIL (depth texture extension)
	 *	type: UNSIGNED_BYTE, UNSIGNED_SHORT_5_6_5, UNSIGNED_SHORT_4_4_4_4,
	 *		UNSIGNED_SHORT_5_5_5_1 (standard)
	 *		UNSIGNED_INT_24_8_WEBGL (depth texture extension)
	 */
	function newTexture(width, height, type, format){
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, type, width, height, 0, type, format, null);
		return texture;
	}

	// utility functions to deal with shader program creation from html dom
	function shaderText(id) {
		var textEl = document.getElementById(id);
		if (!textEl) {
			console.log("textElement: cannot find " + id + " in document");
			return null;
		}
		return textEl.text;
	}

	function loadShader(gl, shaderText, shaderType) {
		var shader = gl.createShader(shaderType);
		var ok;

		gl.shaderSource(shader, shaderText);
		gl.compileShader(shader);

		ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!ok && !gl.isContextLost()) {
			var error = gl.getShaderInfoLog(shader);
			console.log("loadShader: '"+shaderText+"':"+error);
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	function shaderProgram(gl, vertShader, fragShader, attribs, uniforms) {

		var vertexShader = loadShader(gl, vertShader, gl.VERTEX_SHADER);
		var fragmentShader = loadShader(gl, fragShader, gl.FRAGMENT_SHADER);
		var i;

		var prog = gl.createProgram();
		gl.attachShader(prog, vertexShader);
		gl.attachShader(prog, fragmentShader);

		for (i = 0; i < attribs.length; ++i)
			gl.bindAttribLocation(prog, i, attribs[i]);

		gl.linkProgram(prog);

		var ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
		if (!ok && !gl.isContextLost()) {
			// something went wrong with the link
			var error = gl.getProgramInfoLog (prog);
			console.log("Error in program linking:"+error);
			gl.deleteProgram(prog);
			gl.deleteProgram(fragmentShader);
			gl.deleteProgram(vertexShader);

			return null;
		}

		gl.useProgram(prog);
		prog.locs = {};
		for(i in uniforms){
			prog.locs[uniforms[i]] = gl.getUniformLocation(prog, uniforms[i]);
		}

		return prog;
	}

})(window);
