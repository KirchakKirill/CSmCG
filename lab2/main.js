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


function drawCube(offsetX,offsetY,rotationMatrix){
    const vsCube =`
    attribute vec3 vertexPosition;
    attribute vec3 c_color;
    uniform mat4 uRotationMatrix;
    uniform vec3 u_position;
    varying vec3 color;

    void main(void){
        gl_Position = uRotationMatrix * vec4(u_position + vertexPosition, 1.0);
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
    var vertices = [
        // Передняя грань
        -0.25, -0.25, -0.25,
        0.25, -0.25, -0.25,
        -0.25, -0.25, 0.25,
    
        0.25, -0.25, 0.25,
        -0.25, -0.25, 0.25,
        0.25, -0.25, -0.25,
    
        // Задняя грань
        -0.25, 0.25, -0.25,
        -0.25, 0.25, 0.25,
        0.25, 0.25, -0.25,
    
        0.25, 0.25, -0.25,
        0.25, 0.25, 0.25,
        -0.25, 0.25, 0.25,
    
        // Нижняя грань
        -0.25, -0.25, -0.25,
        -0.25, 0.25, -0.25,
        0.25, -0.25, -0.25,
    
        0.25, 0.25, -0.25,
        0.25, -0.25, -0.25,
        -0.25, 0.25, -0.25,
    
        // Верхняя грань
        -0.25, -0.25, 0.25,
        0.25, -0.25, 0.25,
        -0.25, 0.25, 0.25,
    
        0.25, 0.25, 0.25,
        -0.25, 0.25, 0.25,
        0.25, -0.25, 0.25,
    
        // Левая грань
        -0.25, -0.25, -0.25,
        -0.25, -0.25, 0.25,
        -0.25, 0.25, -0.25,
    
        -0.25, 0.25, 0.25,
        -0.25, 0.25, -0.25,
        -0.25, -0.25, 0.25,
    
        // Правая грань
        0.25, -0.25, -0.25,
        0.25, 0.25, -0.25,
        0.25, -0.25, 0.25,
    
        0.25, 0.25, 0.25,
        0.25, -0.25, 0.25,
        0.25, 0.25, -0.25
    ];
    var c_colors = [
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
        1, 0.8, 0,
    
        // Задняя грань
        1, 0.5, 0,
        1, 0.5, 0,
        1, 0.5, 0,
        1, 0.5, 0,
        1, 0.5, 0,
        1, 0.5, 0,
    
        // Нижняя грань
        1, 0.6, 0,
        1, 0.6, 0,
        1, 0.6, 0,
        1, 0.6, 0,
        1, 0.6, 0,
        1, 0.6, 0,
    
        // Верхняя грань
        1, 0.7, 0,
        1, 0.7, 0,
        1, 0.7, 0,
        1, 0.7, 0,
        1, 0.7, 0,
        1, 0.7, 0,
    
        // Левая грань
        1, 0.9, 0,
        1, 0.9, 0,
        1, 0.9, 0,
        1, 0.9, 0,
        1, 0.9, 0,
        1, 0.9, 0,
    
        // Правая грань
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,]
    const res =  setup(vsCube,fsCube,vertices,c_colors)

    const programInfo = {
        program:res[0],
        vertexBuffer:res[1],
        colorBuffer:res[2]
    }


    initAttrib('vertexPosition', 'c_color', programInfo.program, programInfo.vertexBuffer, programInfo.colorBuffer)

    var uPosition = gl.getUniformLocation(programInfo.program, 'u_position');
    const uRotationMatrix = gl.getUniformLocation(programInfo.program,'uRotationMatrix')


    gl.useProgram(programInfo.program);
    gl.uniform3fv(uPosition, [offsetX,offsetY, 0]);
    gl.uniformMatrix4fv(uRotationMatrix, false, rotationMatrix) 


    gl.drawArrays(gl.TRIANGLES, 0,36)

}
let angle = 0
let globalAngle = 0
let flag =0
let angles = {
    angle1Cube:0,
    angle2Cube:0,
    angle3Cube:0,
    angle4Cube:0
}

document.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        angles.angle1Cube += 0.1; 
    }  
    else if (event.key === '2') {
        angles.angle2Cube += 0.1;
     }
    else if (event.key === '3') {
        angles.angle3Cube += 0.1;
    }
    else if (event.key === '4') {
        angles.angle4Cube += 0.1;
    }
    else if (event.key === '5') {
        angle +=0.1
        flag =1
    }
    else if (event.key==='6'){
        flag = 2
        globalAngle+=0.1
    }

});

function createRotationMatrix(matRotationCube, angle, cubeCenter){


    mat4.fromTranslation(matRotationCube,[-1*(cubeCenter[0]),-1* (cubeCenter[1]),cubeCenter[2]])

    mat4.rotateY(matRotationCube,matRotationCube,angle)

    mat4.translate(matRotationCube,matRotationCube,[-1*(cubeCenter[0]),(cubeCenter[1]),cubeCenter[2]])


    return  matRotationCube
    
}

    let matRotationCubes = {
        matrotation1cube:mat4.create(),
        matrotation2cube:mat4.create(),
        matrotation3cube:mat4.create(),
        matrotation4cube:mat4.create()
    }
    

function animate() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let centres = {
        centre1Cube: [-0.73, 0, 0],
        centre2Cube: [-0.22, 0, 0],
        centre3Cube: [-0.22, 0.51, 0],
        centre4Cube: [0.29, 0, 0]
    };

    const globalRotationMat = mat4.create();
    const globalRotationSceneMat = mat4.create();

    if (flag===1) {
        mat4.fromTranslation(globalRotationMat, [-centres.centre2Cube[0], -centres.centre2Cube[1], -centres.centre2Cube[2]]);
    
        
        mat4.rotateY(globalRotationMat, globalRotationMat, angle);
    
        
        mat4.translate(globalRotationMat, globalRotationMat, centres.centre2Cube);
    }
    else if(flag===2){
        mat4.fromRotation(globalRotationSceneMat,globalAngle,[0,1,0])
       
    }

    matRotationCubes.matrotation1cube = createRotationMatrix(matRotationCubes.matrotation1cube, angles.angle1Cube, centres.centre1Cube);
    matRotationCubes.matrotation2cube = createRotationMatrix(matRotationCubes.matrotation2cube, angles.angle2Cube, centres.centre2Cube);
    matRotationCubes.matrotation3cube = createRotationMatrix(matRotationCubes.matrotation3cube, angles.angle3Cube, centres.centre3Cube);
    matRotationCubes.matrotation4cube = createRotationMatrix(matRotationCubes.matrotation4cube, angles.angle4Cube, centres.centre4Cube);

    
    if (flag===1) {

        

        mat4.multiply(matRotationCubes.matrotation1cube, globalRotationSceneMat, matRotationCubes.matrotation1cube);
        mat4.multiply(matRotationCubes.matrotation2cube, globalRotationSceneMat, matRotationCubes.matrotation2cube);
        mat4.multiply(matRotationCubes.matrotation3cube, globalRotationSceneMat, matRotationCubes.matrotation3cube);
        mat4.multiply(matRotationCubes.matrotation4cube, globalRotationSceneMat, matRotationCubes.matrotation4cube);

        mat4.multiply(matRotationCubes.matrotation1cube, globalRotationMat, matRotationCubes.matrotation1cube);
        mat4.multiply(matRotationCubes.matrotation2cube, globalRotationMat, matRotationCubes.matrotation2cube);
        mat4.multiply(matRotationCubes.matrotation3cube, globalRotationMat, matRotationCubes.matrotation3cube);
        mat4.multiply(matRotationCubes.matrotation4cube, globalRotationMat, matRotationCubes.matrotation4cube);


        

    }
    else if (flag === 2) {
        mat4.multiply(matRotationCubes.matrotation1cube, globalRotationSceneMat, matRotationCubes.matrotation1cube);
        mat4.multiply(matRotationCubes.matrotation2cube, globalRotationSceneMat, matRotationCubes.matrotation2cube);
        mat4.multiply(matRotationCubes.matrotation3cube, globalRotationSceneMat, matRotationCubes.matrotation3cube);
        mat4.multiply(matRotationCubes.matrotation4cube, globalRotationSceneMat, matRotationCubes.matrotation4cube);
    }

    
    drawCube(centres.centre1Cube[0], centres.centre1Cube[1], matRotationCubes.matrotation1cube);
    drawCube(centres.centre2Cube[0], centres.centre2Cube[1], matRotationCubes.matrotation2cube);
    drawCube(centres.centre3Cube[0], centres.centre3Cube[1], matRotationCubes.matrotation3cube);
    drawCube(centres.centre4Cube[0], centres.centre4Cube[1], matRotationCubes.matrotation4cube);

    
    requestAnimationFrame(animate);
}

animate();

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
    float stripe = mod(vTexCoord.x * 20.0, 2.0); 
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

//drawSquare()

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