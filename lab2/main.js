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

    var vertexshader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexshader,vsPentagon)
    gl.compileShader(vertexshader)

    var fragmentshader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentshader,fsPentagon)
    gl.compileShader(fragmentshader)

    var program = gl.createProgram()
    gl.attachShader(program,vertexshader)
    gl.attachShader(program,fragmentshader)
    gl.linkProgram(program);



    var vertexBuffer = gl.createBuffer();
    var vertices = [1, 0, 0, 0.309, 0.951, 0, -0.809, 0.588, 0,-0.809, -0.588, 0,0.309, -0.951, 0];
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),  gl.STATIC_DRAW);


    var colorBuffer = gl.createBuffer();
    var colors = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ,0, 0, 1 ,0, 0];
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);



    var pPosition = gl.getAttribLocation(program, 'p_position');
    var pColor = gl.getAttribLocation(program, 'p_color');
    gl.useProgram(program);


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(pColor);
    gl.vertexAttribPointer(pColor, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(pPosition);
    gl.vertexAttribPointer(pPosition, 3, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(program,[offsetX, -0.4, -3])
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
}
//drawPentagon(-3)


function drawCube(){
    const vsCube =`
    attribute vec3 vertexPosition;
    attribute vec3 c_color;
    uniform float x_angle;
    uniform float y_angle;
    varying vec3 color;

    void main(void){
        mat3 transform = mat3( 1, 0, 0, 0, cos(x_angle), sin(x_angle), 0, -sin(x_angle), cos(x_angle) )
        * mat3( cos(y_angle), 0, sin(y_angle),0, 1, 0, -sin(y_angle), 0, cos(y_angle) );
        gl_Position = vec4(vertexPosition * transform, 1.0);
        color = c_color;
    }
    `

    const fsCube =`
    precision mediump float;
    varying vec3 color;

    void main(void) {
    gl_FragColor = vec4(color.rgb,1.0);
    }
    `

    var vertexshader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexshader,vsCube)
    gl.compileShader(vertexshader)

    var fragmentshader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentshader,fsCube)
    gl.compileShader(fragmentshader)

    var program = gl.createProgram()
    gl.attachShader(program,vertexshader)
    gl.attachShader(program,fragmentshader)
    gl.linkProgram(program);



    var vertexBuffer = gl.createBuffer();
    var vertices = [
        // Передняя грань
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
    
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
    
        // Задняя грань
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
    
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
    
        // Нижняя грань
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
    
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
    
        // Верхняя грань
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
    
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
    
        // Левая грань
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, -0.5,
    
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, 0.5,
    
        // Правая грань
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
    
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, -0.5
    ];
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),  gl.STATIC_DRAW);

    var colorBuffer = gl.createBuffer()
    var c_colors = [
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Задняя грань
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Нижняя грань
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Верхняя грань
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Левая грань
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Правая грань
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,]
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(c_colors), gl.STATIC_DRAW);


    var cPosition = gl.getAttribLocation(program, 'vertexPosition');
    var cColor = gl. getAttribLocation(program, 'c_color')

    var xAngleLoc = gl.getUniformLocation(program, 'x_angle');
    var yAngleLoc = gl.getUniformLocation(program, 'y_angle');

    gl.useProgram(program);


    gl.uniform1f(xAngleLoc, Math.PI / 4); 
    gl.uniform1f(yAngleLoc, Math.PI / 4); 



    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);    
    gl.enableVertexAttribArray(cPosition);
    gl.vertexAttribPointer(cPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);    
    gl.enableVertexAttribArray(cColor);
    gl.vertexAttribPointer(cColor, 3, gl.FLOAT, false, 0, 0);


    gl.drawArrays(gl.TRIANGLES, 0,36)

}
//drawCube()
}

start()