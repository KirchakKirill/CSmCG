import * as mat4 from './esm/mat4.js'

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

function drawPentagon(offsetX)
{
    const vsPentagon = `
    attribute vec3 p_position;
    attribute vec3 p_color;
    uniform mat4  mvMatrix;
    uniform mat4  prMatrix;
    varying vec3 v_color;

    void main(void){
        v_color = p_color;
        gl_Position = prMatrix * mvMatrix * vec4( p_position, 1.0);
    }
    `
    const fsPentagon = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec3 v_color;

    void main(void) {
    gl_FragColor = vec4(v_color.rgb, 1.0);
    }
    `
    var vertices = [1, 0, 0, 0.309, 0.951, 0, -0.809, 0.588, 0,-0.809, -0.588, 0,0.309, -0.951, 0];
    var colors = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ,0, 0, 1 ,0, 0];

    const res =  setup(vsPentagon,fsPentagon,vertices,colors)

    const programInfo = {
        program:res[0],
        vertexBuffer:res[1],
        colorBuffer:res[2]
    }

    initAttrib('p_position', 'p_color', programInfo.program, programInfo.vertexBuffer, programInfo.colorBuffer)

    gl.useProgram(programInfo.program);

    setMatrixUniforms(programInfo.program,[offsetX, 0, -1])
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
}
//drawPentagon(0)




function drawSquare(){

    const vsSourceSQ = `
    attribute vec3 aPosition; 
    attribute vec3 aTexCoord; 

    varying vec3 vTexCoord; 

    void main() {
    
    gl_Position = vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;
    }`;


    const fsSourceSQ = `
    precision mediump float; 

    varying vec3 vTexCoord; 

    void main() {
    
    vec3 blue = vec3(0.0, 0.5, 1.0); 
    vec3 white = vec3(1.0, 1.0, 1.0); 
    float stripe = mod(vTexCoord.y * 20.0, 2.0); 
    if (stripe < 1.0) {
        gl_FragColor = vec4(blue, 1.0); 
    } else {
        gl_FragColor = vec4(white, 1.0);
    }
    }`

    var vertices = [
        -0.5, -0.5, 0.0, // Нижний левый угол
         0.5, -0.5, 0.0, // Нижний правый угол
         0.5,  0.5, 0.0, // Верхний правый угол
        -0.5,  0.5, 0.0  // Верхний левый угол
    ];
    var colors = [
        0.0, 0.0, 0.0, 
        1.0, 0.0, 0.0, 
        1.0, 1.0, 0.0, 
        0.0, 1.0, 0.0  
    ];

    const res =  setup(vsSourceSQ,fsSourceSQ,vertices,colors)

    const programInfo = {
        program:res[0],
        vertexBuffer:res[1],
        colorBuffer:res[2]
    }
    
    initAttrib('aPosition', 'aTexCoord', programInfo.program, programInfo.vertexBuffer, programInfo.colorBuffer)
    gl.useProgram(programInfo.program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


}

drawSquare()

}

function setup(vShader,fShader,vertices,colors){

    var vertexshader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexshader,vShader)
    gl.compileShader(vertexshader)

    var fragmentshader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentshader,fShader)
    gl.compileShader(fragmentshader)

    var program = gl.createProgram()
    gl.attachShader(program,vertexshader)
    gl.attachShader(program,fragmentshader)
    gl.linkProgram(program);


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),  gl.STATIC_DRAW);


    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return [program,vertexBuffer,colorBuffer]
}


function initAttrib(nameVertexAttr, nameColorAttr, program, vertexBuffer,colorBuffer){

    var cPosition = gl.getAttribLocation(program, nameVertexAttr);
    var cColor = gl. getAttribLocation(program, nameColorAttr)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);    
    gl.enableVertexAttribArray(cPosition);
    gl.vertexAttribPointer(cPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);    
    gl.enableVertexAttribArray(cColor);
    gl.vertexAttribPointer(cColor, 3, gl.FLOAT, false, 0, 0);



}

function setMatrixUniforms(programS,tr) {
    const mvMatrix = mvTranslate(tr);
    const prMatrix = makePerspective(100, 640 / 480.0, 0.1, 100);

    const mvUniform = gl.getUniformLocation(programS, "mvMatrix");
    const prUniform = gl.getUniformLocation(programS, "prMatrix");

    gl.uniformMatrix4fv(mvUniform, false, mvMatrix);
    gl.uniformMatrix4fv(prUniform, false, prMatrix);
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


start()