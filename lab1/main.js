var gl; 
function start() {
var canvas = document.getElementById("glcanvas");
gl = initWebGL(canvas); 

function initWebGL(canvas) {
    gl = null;
    try { 
     
     gl  = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    
    }
    catch(e) {}
    
     if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
    }
    return gl;
}

if (gl) { 

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
   
    gl.depthFunc(gl.LEQUAL);
   
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    }
    
    function makePerspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov * Math.PI / 360.0);
        const rangeInv = 1.0 / (near - far);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    
    function mvTranslate(translation) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            translation[0], translation[1], translation[2], 1
        ];
    }
    
    function setMatrixUniforms(programS,tr) {
        const mvMatrix = mvTranslate(tr);
        const prMatrix = makePerspective(100, 640 / 480.0, 0.1, 100);
    
        const mvUniform = gl.getUniformLocation(programS, "mvMatrix");
        const prUniform = gl.getUniformLocation(programS, "prMatrix");
    
        gl.uniformMatrix4fv(mvUniform, false, mvMatrix);
        gl.uniformMatrix4fv(prUniform, false, prMatrix);
    }


    function drawTriangle(offsetX){
        const vsSource = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 mvMatrix;
uniform mat4 prMatrix;
varying vec3 v_color;

void main(void) {
    v_color = a_color;
    gl_Position = prMatrix * mvMatrix * vec4( a_position, 1.0);
}`;


const fsSource = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec3 v_color;

void main(void) {
    gl_FragColor = vec4(v_color.rgb, 1.0);
}
`;
var vertexShader = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader,fsSource);
gl.compileShader(fragmentShader);


var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);


var vertexBuffer = gl.createBuffer();
var vertices = [0, 0, 0, 0.5, 1, 0, 1, 0, 0];
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),  gl.STATIC_DRAW);

var colorBuffer = gl.createBuffer();
var colors = [1, 0, 0, 0, 1, 0, 0, 0, 1];
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


var aPosition = gl.getAttribLocation(program, 'a_position');
var aColor = gl.getAttribLocation(program, 'a_color');

gl.useProgram(program);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(aColor);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

setMatrixUniforms(program,[offsetX, -0.4, -3])
gl.drawArrays(gl.TRIANGLES, 0, 3);

    }
    function drawSquire(offsetX){
        const vsSourceSQ = `
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 mvMatrix;
uniform mat4 prMatrix;
varying vec4 color;

void main(void) {
gl_Position = prMatrix * mvMatrix * vec4 ( aVertexPosition, 1.0 );
color = aVertexColor;
}`;


const fsSourceSQ = `
#ifdef GL_ES
precision highp float;
#endif
varying vec4 color;
void main(void) {
gl_FragColor = color;
}

`;


var vertexShaderSq = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertexShaderSq, vsSourceSQ);
gl.compileShader(vertexShaderSq);

var fragmentShaderSq = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShaderSq,fsSourceSQ);
gl.compileShader(fragmentShaderSq);


var programS = gl.createProgram();
gl.attachShader(programS, vertexShaderSq);
gl.attachShader(programS, fragmentShaderSq);
gl.linkProgram(programS);


gl.useProgram(programS);

var vertexBufferSq = gl.createBuffer();
var verticesS = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
    ];
    
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSq);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesS),  gl.STATIC_DRAW);

var colorBufferSq = gl.createBuffer();
var colorsS = [
    1, 0, 0, 
    0, 1, 0, 
    0, 0, 1, 
    1, 1, 0  
];
    
gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferSq);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsS),  gl.STATIC_DRAW);



vertexPositionAttribute = gl.getAttribLocation(programS, "aVertexPosition");
colorPositionAttribute = gl.getAttribLocation(programS, "aVertexColor");


gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferSq);
gl.enableVertexAttribArray(vertexPositionAttribute);
gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);


gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferSq);
gl.enableVertexAttribArray(colorPositionAttribute);
gl.vertexAttribPointer(colorPositionAttribute, 3, gl.FLOAT, false, 0, 0);


function drawScene() {
    setMatrixUniforms(programS,[offsetX, 0, -6.0]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); 
    setMatrixUniforms(programS,[-2, 0, -6.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    setMatrixUniforms(programS,[1, 0, -6.0]); 
    gl.drawArrays(gl.TRIANGLES, 0, 4);
    setMatrixUniforms(programS,[4, 0, -6.0]); 
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
    setMatrixUniforms(programS,[7, 0, -6.0]);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);
    setMatrixUniforms(programS,[5.5, -3, -6.0]);
    gl.drawArrays(gl.LINES, 0, 4);

    }
drawScene()
}

    drawTriangle(-4.5)
    drawSquire(-5)

 } 
 start()

 


