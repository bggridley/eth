var gl;
var programInfo;
var buffers;

var eye;  // Initial eye position, also for resets
var up;
var direction;

var yaw = 0.0;
var pitch = 0.0;

var key_w = false;
var key_a = false;
var key_s = false;
var key_d = false;

var key_left = false;
var key_right = false;
var key_up = false;
var key_down = false;
// CONTROLS

function loadWebGL() {
    document.addEventListener('keydown', function (event) {

        event.preventDefault();

        if (event.keyCode == 87) {
            key_w = true;
        } else if (event.keyCode == 65) {
            key_a = true;
        } else if (event.keyCode == 83) {
            key_s = true;
        } else if (event.keyCode == 68) {
            key_d = true;
        } else if (event.keyCode == 37) {
            key_left = true;
        } else if (event.keyCode == 39) {
            key_right = true;
        } else if (event.keyCode == 38) {
            key_up = true;
        } else if (event.keyCode == 40) {
            key_down = true;
        }
    });

    document.addEventListener('keyup', function (event) {

        event.preventDefault();
        if (event.keyCode == 87) {
            key_w = false;
        } else if (event.keyCode == 65) {
            key_a = false;
        } else if (event.keyCode == 83) {
            key_s = false;
        } else if (event.keyCode == 68) {
            key_d = false;
        } else if (event.keyCode == 37) {
            key_left = false;
        } else if (event.keyCode == 39) {
            key_right = false;
        } else if (event.keyCode == 38) {
            key_up = false;
        } else if (event.keyCode == 40) {
            key_down = false;
        }
    });

    const canvas = document.querySelector('#glcanvas');
    gl = canvas.getContext('webgl');

    window.addEventListener('resize', resizeCanvas, false);


    resizeCanvas();

    // If we don't have a GL context, give up now

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program

    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec3 aVertexNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uNormalMatrix;

      varying highp vec3 vLighting;


      void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelViewMatrix * aVertexPosition;

        highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.3, 1.0, 0.25));
  
        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
  
        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
        
       
      }
    `;

    // Fragment shader program 

    const fsSource = `

    varying highp vec3 vLighting;

      void main() {
        gl_FragColor = vec4(vec4(1.0, 0.0, 0.0, 1.0).rgb * vLighting, 1.0);
      }
    `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    buffers = initBuffers(gl);

    // Draw the scene

    eye = vec3.fromValues(0.0, 3, 0.0); // 2 units tall 
    // top of first block is at 1// Initial eye position, also for resets
    up = vec3.fromValues(0.0, 1.0, 0.0);
    direction = vec3.fromValues(0.0, 0.0, 1.0); // initial direction

    window.focus();
    window.requestAnimationFrame(loop);

}

function resizeCanvas() {
    // alert('re');

    var w = $('body').innerWidth();
    var h = $('body').innerHeight() / 2.5;
    gl.canvas.width = w;
    gl.canvas.height = h;
    $("#glCanvas").attr('width', w);
    $("#glCanvas").attr('height', h);

    //  alert(w);

    // resizeCanvasToDisplaySize(gl.canvas);

    // alert(window.innerWidth);
    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */
    //drawStuff(); 
}

async function loop() {
    window.requestAnimationFrame(loop);

    // resizeCanvasToDisplaySize(gl.canvas);
    // alert('loop');
    update();
    drawScene();
}



function update() {

    var normalDirection = vec3.create();
    vec3.normalize(normalDirection, vec3.fromValues(direction[0], 0.0, direction[2]));
    var speed = 0.1;
    vec3.multiply(normalDirection, normalDirection, vec3.fromValues(speed, 0, speed));


    var reverse = vec3.create();
    vec3.multiply(reverse, normalDirection, vec3.fromValues(-1, -1, -1));


    var left_ = vec3.create();
    vec3.rotateY(left_, normalDirection, vec3.fromValues(0.0, 0.0, 0.0), Math.PI / 2);


    var right_ = vec3.create();
    vec3.rotateY(right_, normalDirection, vec3.fromValues(0.0, 0.0, 0.0), -Math.PI / 2);

    var left = vec3.fromValues(left_[0], 0.0, left_[2]);
    var right = vec3.fromValues(right_[0], 0.0, right_[2]); // tghis is a hack but i really don't want to fuckin code a rotation around axis function for vectors in javascript
    if (key_w) {
        vec3.add(eye, eye, normalDirection);
    }

    if (key_s) {
        vec3.add(eye, eye, reverse);
    }

    if (key_a) {
        vec3.add(eye, eye, left);
        //  alert(pitch);
    }

    if (key_d) {
        vec3.add(eye, eye, right);
    }


    if (key_up) {
        pitch += Math.PI / 200;

        if (pitch > Math.PI / 2 - .01) {
            pitch = (Math.PI / 2) - .01;
        }
    }

    if (key_down) {
        pitch -= Math.PI / 200;

        if (pitch < -Math.PI / 2 + .01) {
            pitch = -Math.PI / 2 + .01;
        }
    }

    if (key_left) {
        yaw += Math.PI / 200;
    }

    if (key_right) {
        yaw -= Math.PI / 200;
    }



    var xzLen = Math.cos(pitch)
    var x = xzLen * Math.cos(yaw)
    var y = Math.sin(pitch)
    var z = xzLen * Math.sin(-yaw)

    direction = vec3.fromValues(x, y, z);
    var copy = direction;
    vec3.normalize(direction, copy);


    //alert(direction);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//

var increments = 50;
function initBuffers(gl) {

    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.



    const positions = [];

    const heights = [-0.5, 0.5];
    for (var j = 0; j < 2; j++) {

        var y = heights[j];

        positions.push(0);
        positions.push(y);
        positions.push(0);


        for (var i = 1; i <= increments; i++) {
            var theta = (i / increments) * 2 * 3.14159;


            var x = Math.cos(theta);
            // var y = j;
            var z = Math.sin(theta);

            console.log(theta + ": " + x + "," + z);

            positions.push(x);
            positions.push(y);
            positions.push(z);
            //alert(x + ", " + y);
        }
    }

    console.log(positions);




    /*const positions = [

        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];*/

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.DYNAMIC_DRAW);


    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    /*const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];*/

    //console.log(positions);

    const indices = [
        /* 0, 1, 2,
         0, 2, 3,
         0, 3, 4,
         0, 4, 5,
         0, 5, 6,
         0, 6, 7,
         0, 7, 8,
         0, 8, 9,
         0, 9, 10,
         0, 10, 11,
         0, 11, 12,
         0, 12, 13,
         0, 13, 14,
         0, 14, 15,
         0, 15, 16,
         0, 16, 17,
         0, 17, 18,
         0, 18, 19,
         0, 19, 20,
         0, 20, 1,*/
    ];

    for (var i = 0; i < 2; i++) {
        var of = i == 1 ? increments + 1 : 0;


        for (var j = 1; j <= increments; j++) {
            indices.push(of);
            indices.push(of + j);
            if (j == increments) { // fix this statement to include
                indices.push(of + 1);
            } else {
                indices.push(of + j + 1);
            }

        }

        //alert(of);
    }

    console.log(indices);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.DYNAMIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = [
        // Front

    ];

    for (var i = 0; i < (increments + 1) * 2; i++) {
        if (i < increments + 1) {
            vertexNormals.push(0.0);
            vertexNormals.push(-1.0);
            vertexNormals.push(0.0);
        } else if (i < (increments + 1) * 2) {
            vertexNormals.push(0.0);
            vertexNormals.push(1.0);
            vertexNormals.push(0.0);
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
        gl.DYNAMIC_DRAW);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.


    return {
        position: positionBuffer,
        indices: indexBuffer,
        normal: normalBuffer,
    };
}


function generateNormals(vertices, indices) {
    // indice 0 -> 0, 1, 2
    // 1 -> 3, 4, 5
    // 2 - > 6, 7, 8



}
//
// Draw the scene.
//

var cubeRotation = 0;

function drawScene() {
     cubeRotation += 1 / 60;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 40 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();


    var center = vec3.create();

    // last one is direction
    vec3.add(center, eye, direction);
    mat4.lookAt(viewMatrix, eye, center, up);

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.


    // mat4.scale(modelViewMatrix,  // destination matrix
    //      modelViewMatrix,
    //        vec3.fromValues(0.5, 0.5, 0.5));

    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [0.0, 0.0, 0]);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        cubeRotation,     // amount to rotate in radians
        [0, 0, 1]);       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        cubeRotation * .7,// amount to rotate in radians
        [0, 1, 0]);       // axis to rotate around (X)

    // these need to go after!

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.





    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    // Tell WebGL to use our program when drawing
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        viewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);


    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix);


    {
        const vertexCount = (increments * 2) * 3;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

    }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}