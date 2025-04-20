import * as mat4 from './esm/mat4.js';
import * as mat3 from './esm/mat3.js'

window.onload = main;

let cubeRotation = 0;
let pedestalRotation = 0;
let globalRotation = 0;


const cubeColors = [
    [1.0, 0.8, 0.0, 0.5],
    [1.0, 0.8, 0.0, 0.5],
    [1.0, 0.8, 0.0, 0.5],
    [1.0, 0.8, 0.0, 0.5],
];

const cubeOffsets = [
    [-0.5, 0.5, 0],
    [-1.5, -0.5, 0],
    [-0.5, -0.5, 0],
    [0.5, -0.5, 0],
];

// Добавим нормали для кубов для расчета освещения
const verticesWithNormals = new Float32Array([
    // Передняя грань (Z = 0.5)
    -0.5, -0.5,  0.5,  
     0.5, -0.5,  0.5,  
     0.5,  0.5,  0.5,  
    -0.5, -0.5,  0.5,  
     0.5,  0.5,  0.5,  
    -0.5,  0.5,  0.5,  

    // Задняя грань (Z = -0.5)
    -0.5, -0.5, -0.5,  
     0.5,  0.5, -0.5,  
     0.5, -0.5, -0.5,  
    -0.5, -0.5, -0.5,  
    -0.5,  0.5, -0.5,  
     0.5,  0.5, -0.5,  

    // Верхняя грань (Y = 0.5)
    -0.5,  0.5, -0.5,  
     0.5,  0.5,  0.5, 
     0.5,  0.5, -0.5, 
    -0.5,  0.5, -0.5,  
    -0.5,  0.5,  0.5,  
     0.5,  0.5,  0.5,  

    // Нижняя грань (Y = -0.5)
    -0.5, -0.5, -0.5,  
     0.5, -0.5, -0.5,  
     0.5, -0.5,  0.5, 
    -0.5, -0.5, -0.5,  
     0.5, -0.5,  0.5,  
    -0.5, -0.5,  0.5,  

    // Правая грань (X = 0.5)
     0.5, -0.5, -0.5,  
     0.5,  0.5, -0.5,  
     0.5,  0.5,  0.5,  
     0.5, -0.5, -0.5, 
     0.5,  0.5,  0.5,  
     0.5, -0.5,  0.5,  

    // Левая грань (X = -0.5)
    -0.5, -0.5, -0.5, 
    -0.5,  0.5,  0.5, 
    -0.5,  0.5, -0.5, 
    -0.5, -0.5, -0.5, 
    -0.5, -0.5,  0.5, 
    -0.5,  0.5,  0.5, 
]);

// const indices = new Uint16Array([
//     0, 1, 2, 0, 2, 3,
//     4, 5, 6, 4, 6, 7,
//     0, 4, 7, 0, 7, 3,
//     1, 5, 6, 1, 6, 2,
//     3, 2, 6, 3, 6, 7,
//     0, 1, 5, 0, 5, 4
// ]);

const normals = [
    0.0,  0.0,  1.0, 
    0.0,  0.0,  1.0, 
    0.0,  0.0,  1.0, 
    0.0,  0.0,  1.0, 
    0.0,  0.0,  1.0, 
    0.0,  0.0,  1.0, 


    // Задняя грань (Z = -0.5)
    0.0,  0.0, -1.0, 
    0.0,  0.0, -1.0, 
    0.0,  0.0, -1.0, 
    0.0,  0.0, -1.0, 
    0.0,  0.0, -1.0, 
    0.0,  0.0, -1.0, 

    // Верхняя грань (Y = 0.5)
    0.0,  1.0,  0.0, 
    0.0,  1.0,  0.0, 
    0.0,  1.0,  0.0, 
    0.0,  1.0,  0.0, // Треугольник 2, вершина 1
    0.0,  1.0,  0.0, // Треугольник 2, вершина 2
    0.0,  1.0,  0.0, // Треугольник 2, вершина 3

    // Нижняя грань (Y = -0.5)
    0.0, -1.0,  0.0, // Треугольник 1, вершина 1
    0.0, -1.0,  0.0, // Треугольник 1, вершина 2
    0.0, -1.0,  0.0, // Треугольник 1, вершина 3
    0.0, -1.0,  0.0, // Треугольник 2, вершина 1
    0.0, -1.0,  0.0, // Треугольник 2, вершина 2
    0.0, -1.0,  0.0, // Треугольник 2, вершина 3

    // Правая грань (X = 0.5)
    1.0,  0.0,  0.0, // Треугольник 1, вершина 1
    1.0,  0.0,  0.0, // Треугольник 1, вершина 2
    1.0,  0.0,  0.0, // Треугольник 1, вершина 3
    1.0,  0.0,  0.0, // Треугольник 2, вершина 1
    1.0,  0.0,  0.0, // Треугольник 2, вершина 2
    1.0,  0.0,  0.0, // Треугольник 2, вершина 3

    // Левая грань (X = -0.5)
    -1.0,  0.0,  0.0, // Треугольник 1, вершина 1
    -1.0,  0.0,  0.0, // Треугольник 1, вершина 2
    -1.0,  0.0,  0.0, // Треугольник 1, вершина 3
    -1.0,  0.0,  0.0, // Треугольник 2, вершина 1
    -1.0,  0.0,  0.0, // Треугольник 2, вершина 2
    -1.0,  0.0,  0.0  // Треугольник 2, вершина 3
]

const vertexShaderSource = `
     attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec4 aVertexColor;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat3 uNMatrix;
    uniform vec3 uLightPosition;
    uniform vec3 uAmbientLightColor;
    uniform vec3 uDiffuseLightColor;
    uniform vec3 uSpecularLightColor;
    varying vec3 vLightWeighting;
    varying vec4 vColor;
    const float shininess = 16.0;


    void main() {
    vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
    vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;
    vec3 lightDirection = normalize(uLightPosition - vertexPositionEye3);
    vec3 normal = normalize(uNMatrix * aVertexNormal);

    float diffuseLightDot = max(dot(normal, lightDirection), 0.0);

    
    vec3 reflectionVector = normalize(reflect(-lightDirection, normal));
    vec3 viewVectorEye = -normalize(vertexPositionEye3);
    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);

    vColor = aVertexColor;
    vLightWeighting = uAmbientLightColor + uDiffuseLightColor * diffuseLightDot + uSpecularLightColor * specularLightParam;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`;

const fragmentShaderSource = `
   
precision mediump float;
varying vec3 vLightWeighting;
varying vec4 vColor;
void main() {
//gl_FragColor = vec4(vLightWeighting.rgb * vColor.rgb, 1);
gl_FragColor = vec4(vLightWeighting.rgb, 1);
} 
`;

function createGLContext(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2.0 not supported");
    }
    return gl;
}

function main() {
    const canvas = document.getElementById('glcanvas');
    const gl = createGLContext(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            aPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            aNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            aColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            uModelViewMatrix: gl.getUniformLocation(shaderProgram, 'uMVMatrix'),
            uPerspectiveMatrix: gl.getUniformLocation(shaderProgram,'uPMatrix'),
            uNormalMatrix: gl.getUniformLocation(shaderProgram, 'uNMatrix'),
            uLightPos: gl.getUniformLocation(shaderProgram, 'uLightPosition'),
            uAmbientColor: gl.getUniformLocation(shaderProgram, 'uAmbientLightColor'),
            uSpecularLightColor: gl.getUniformLocation(shaderProgram, 'uSpecularLightColor'),
            uDiffuseLightColor: gl.getUniformLocation(shaderProgram, 'uDiffuseLightColor'),
        },
    };

    window.addEventListener("keydown", (event) => handleKeyDown(event, gl, canvas, programInfo));
    renderScene(gl, canvas, programInfo);
}

function handleKeyDown(event, gl, canvas, programInfo) {
    const angleIncrement = Math.PI / 180;
    switch (event.key) {
        case '1': cubeRotation += angleIncrement; break;
        case '2': cubeRotation -= angleIncrement; break;
        case '3': pedestalRotation += angleIncrement; break;
        case '4': pedestalRotation -= angleIncrement; break;
        case '5': globalRotation += angleIncrement; break;
        case '6': globalRotation -= angleIncrement; break;
        case '7': ambientStrength += 0.1; break;
        case '8': ambientStrength -= 0.1; break;
        case '9': uSpecularStrength += 0.5; break;
        case '0': uSpecularStrength -= 0.5; break;
    }
    renderScene(gl, canvas, programInfo);
}

function renderScene(gl, canvas, programInfo) {
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

    
   
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0, 0, -5]);
    mat4.rotate(viewMatrix, viewMatrix, Math.PI / 4, [1, 0, 0]);

    
    const globalMatrix = mat4.create();
    mat4.rotate(globalMatrix, globalMatrix, globalRotation, [0, 1, 0]);


    const pedestalPos = [1.5, 0, 0];
    const pedestalMatrix = mat4.create();
    mat4.translate(pedestalMatrix, pedestalMatrix, pedestalPos);
    mat4.rotate(pedestalMatrix, pedestalMatrix, pedestalRotation, [0, 1, 0]);


    const pedestalGlobalMatrix = mat4.create();
    mat4.multiply(pedestalGlobalMatrix, globalMatrix, pedestalMatrix);


    


    

    gl.useProgram(programInfo.program);

    const vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, verticesWithNormals);
    //const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices);
    const colorBuffer = createBuffer(gl, gl.ARRAY_BUFFER, cubeColors);
    const normalsBuffer = createBuffer(gl,gl.ARRAY_BUFFER,normals)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.aColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.aPosition, 3, gl.FLOAT, false, 0, 0); // Позиции
    gl.enableVertexAttribArray(programInfo.attribLocations.aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER,normalsBuffer)
    gl.vertexAttribPointer(programInfo.attribLocations.aNormal, 3, gl.FLOAT, false, 0, 0); // Нормали
    gl.enableVertexAttribArray(programInfo.attribLocations.aNormal)

    


    gl.uniform3fv(programInfo.uniformLocations.uLightPos, [0.0, 10.0, 5.0]);
    gl.uniform3fv(programInfo.uniformLocations.uAmbientColor, [0.5, 0.5, 0.5]);
    gl.uniform3fv(programInfo.uniformLocations.uDiffuseLightColor, [0.7, 0.7, 0.7]);
    gl.uniform3fv(programInfo.uniformLocations.uSpecularLightColor, [1.0, 1.0, 1.0]);


    

    gl.uniformMatrix4fv(programInfo.uniformLocations.uPerspectiveMatrix,false,projectionMatrix)

    for (let i = 0; i < 4; i++) {
        const cubeMatrix = mat4.clone(pedestalGlobalMatrix);
        mat4.translate(cubeMatrix, cubeMatrix, cubeOffsets[i]);
        mat4.rotate(cubeMatrix, cubeMatrix, cubeRotation, [0, 1, 0]);

        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, cubeMatrix);

        

        gl.uniformMatrix4fv(programInfo.uniformLocations.uModelViewMatrix, false, modelViewMatrix);
        
        //gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }
    const normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix,pedestalGlobalMatrix)
    gl.uniformMatrix3fv(programInfo.uniformLocations.uNormalMatrix, false,  normalMatrix);
}

function createBuffer(gl, target, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buffer;
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        return null;
    }
    return shaderProgram;
}


