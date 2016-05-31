
JSFILES=\
	libgeom.js/camera.js\
	libgeom.js/geom.js\
	libgeom.js/mat4.js\
	libgeom.js/math.js\
	libgeom.js/mesh.js\
	libgeom.js/mouse.js\
	libgeom.js/select.js\
	render.js\
	main.js\

all.js: $(JSFILES)
	uglifyjs $(JSFILES) -m -c > $@

clean:
	rm -f all.js
