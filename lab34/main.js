import * as mat4 from './esm/mat4.js';
import * as mat3 from './esm/mat3.js'

window.onload = main;

let cubeRotation = 0;
let pedestalRotation = 0;
let globalRotation = 0;



let shaderProgram;
let gl;
var vertexBuffer;
var indexBuffer;
var textureBuffer;
var vertexNormalBuffer;
let programInfo;

let phongLight = true;
let phongShading = true;
let uAttenuationLinear = 0.0;
let uAttenuationQuadratic = 0.0;
let uAmbientPower = 0.1;
let uMix = 0.5;


let cubeTextures;
let materialTexture;

const cubeColors = [
    [0.0, 1.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
];

const cubeOffsets = [
    [-1, 0.5, 0],
    [-2, -0.5, 0],
    [-1, -0.5, 0],
    [0, -0.5, 0],
];

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var nMatrix = mat3.create();

const vertexShaderSource = `
   precision mediump float;

        attribute vec3 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;
        
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;
        
        uniform vec3 uLightPosition;
        uniform vec4 uLightColor;

        uniform bool uShadingPhong;
        uniform bool uLightPhong;

        uniform float uAttenuationLinear;
        uniform float uAttenuationQuadratic;
        uniform float uAmbientPower;

        varying vec3 vLightWeighting;
        varying vec3 vVertexPosition;
        varying vec3 vVertexNormal;
        varying vec2 vTextureCoord;
        
        const float shininess = 16.0;
            
        void main() {
            vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);
            gl_Position = uPMatrix * vertexPositionEye4;
            vec3 normal = normalize(uNMatrix * aVertexNormal);
            vTextureCoord = aTextureCoord;

            if(!uShadingPhong) {

                vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;
                
                vec3 lightDirection = normalize(uLightPosition - vertexPositionEye3);
                
                float distance = length(uLightPosition - vertexPositionEye3);
                float attenuation = 1.0 / (1.0 + uAttenuationLinear * distance + uAttenuationQuadratic * distance * distance);
                
                float diffuseLightDot = max(dot(normal, lightDirection), 0.0);
                
                vec3 reflectionVector = normalize(reflect(-lightDirection, normal));
                
                float specularLightParam = 0.0;
                if(uLightPhong) {
                    vec3 viewVectorEye = normalize(-vertexPositionEye3);
                    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
                    specularLightParam = pow(specularLightDot, shininess);
                }
                
                vLightWeighting = uLightColor.rgb; 
            } else {
                vVertexPosition = vertexPositionEye4.xyz;
                vVertexNormal = normal;
            }
        }                
`;

const fragmentShaderSource = `
   
precision mediump float;

        varying vec3 vVertexPosition;
        varying vec3 vVertexNormal;

        uniform vec3 uLightPosition;
        uniform vec4 uLightColor;

        uniform bool uShadingPhong;
        uniform bool uLightPhong;

        uniform float uAttenuationLinear;
        uniform float uAttenuationQuadratic;
        uniform float uAmbientPower;
        uniform float uMix;
        
        uniform sampler2D uNumber;
        uniform sampler2D uMaterial;

        varying vec3 vLightWeighting;
        varying vec2 vTextureCoord;


        const float shininess = 16.0;
        
        void main() { 
            vec4 textureNumber = texture2D(uNumber, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
            vec4 textureMaterial = texture2D(uMaterial, vTextureCoord);

            vec4 finalTexture = mix(textureNumber, textureMaterial, uMix);

            
            if (!uShadingPhong) {
                gl_FragColor = vec4(finalTexture.rgb * vLightWeighting, finalTexture.a);
                 
            } else {
                vec3 lightDirection = normalize(uLightPosition - vVertexPosition);
                
                float distance = length(uLightPosition - vVertexPosition);
                float attenuation = 1.0 / (1.0 + uAttenuationLinear * distance + uAttenuationQuadratic * distance * distance);

                float diffuseLightDot = max(dot(vVertexNormal, lightDirection), 0.0);
                
                vec3 reflectionVector = normalize(reflect(-lightDirection, vVertexNormal));
                
                float specularLightParam = 0.0;
                if(uLightPhong) {
                    vec3 viewVectorEye = normalize(-vVertexPosition);
                    float specularLightDot = max(dot(reflectionVector, viewVectorEye), 0.0);
                    specularLightParam = pow(specularLightDot, shininess);
                }
                
                vec3 vColor = uLightColor.rgb;

                gl_FragColor = vec4(finalTexture.rgb * vColor, finalTexture.a);
            }
        }
`;

function createGLContext(canvas) {
    const gl = canvas.getContext("webgl2");
    gl.enable( gl.BLEND ); 
    if (!gl) {
        alert("WebGL 2.0 not supported");
    }
    return gl;
}

function main() {
    const canvas = document.getElementById('glcanvas');
    gl = createGLContext(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    shaderProgram = initShaderProgram(vertexShaderSource, fragmentShaderSource);
    programInfo = {
        attribLocations: {
            vertexPositionAttribute: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormalAttribute: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoordAttribute: gl.getAttribLocation(shaderProgram,'aTextureCoord')
        },
        uniformLocations: {
            MVMatrix: gl.getUniformLocation(shaderProgram, "uMVMatrix"),
            ProjMatrix: gl.getUniformLocation(shaderProgram, "uPMatrix"),
            NormalMatrix: gl.getUniformLocation(shaderProgram, "uNMatrix"),
            uniformLightPosition: gl.getUniformLocation(shaderProgram, "uLightPosition"),
            uniformLightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
            uShadingPhong: gl.getUniformLocation(shaderProgram, "uShadingPhong"),
            uLightPhong: gl.getUniformLocation(shaderProgram, "uLightPhong"),
            uAttenuationLinear: gl.getUniformLocation(shaderProgram, "uAttenuationLinear"),
            uAttenuationQuadratic: gl.getUniformLocation(shaderProgram, "uAttenuationQuadratic"),
            uAmbientPower: gl.getUniformLocation(shaderProgram, "uAmbientPower"),
            uNumber: gl.getUniformLocation(shaderProgram, "uNumber"),
            uMaterial: gl.getUniformLocation(shaderProgram, "uMaterial"),
            uMix: gl.getUniformLocation(shaderProgram, "uMix"),
            

        },
    };
    //console.log(programInfo.uniformLocations.uShadingPhong)

    initBuffers();
    setupLights();
    setTextures();

    window.addEventListener("keydown", (event) => handleKeyDown(event));
    renderScene();
}

function initBuffers() {
    if (!shaderProgram) {
        console.error('Shader program is not initialized');
        return;
    }

    const vertices = new Float32Array([
        // Front face
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,

        // Back face
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,

        // Top face
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,

        // Bottom face
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5,

        // Right face
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,

        // Left face
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
    ]);

    const normals = [
        // Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];

    const indices = new Uint16Array([
        0, 1, 2,
        0, 2, 3, // front

        4, 5, 6,
        4, 6, 7, // back

        8, 9, 10,
        8, 10, 11, // top

        12, 13, 14,
        12, 14, 15, // bottom

        18, 17, 16,
        18, 16, 19, // right

        20, 21, 22,
        20, 22, 23, // left
    ]);

    const textureCoordinates = [
        // Front
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Back
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        // Top
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Bottom
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        // Right
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        // Left
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    
    
        // Создание и привязка буфера вершин
        vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.error('Failed to create vertex buffer');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        vertexBuffer.itemSize = 3;
        console.log('Vertex buffer created and data set');
    
        // Создание и привязка буфера индексов
        indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            console.error('Failed to create index buffer');
            return;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        indexBuffer.numberOfItems = indices.length;
        console.log('Index buffer created and data set');
    
        // Создание и привязка буфера нормалей
        vertexNormalBuffer = gl.createBuffer();
        if (!vertexNormalBuffer) {
            console.error('Failed to create vertex normal buffer');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        vertexNormalBuffer.itemSize = 3;
        console.log('Vertex normal buffer created and data set');
    
        // Создание и привязка буфера текстурных координат
        textureBuffer = gl.createBuffer();
        if (!textureBuffer) {
            console.error('Failed to create texture buffer');
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
        textureBuffer.itemSize = 2;
        console.log('Texture buffer created and data set');
    
        // Включение атрибутов
        if (programInfo.attribLocations.vertexPositionAttribute === -1) {
            console.error('Failed to get attribute location: aVertexPosition');
        } else {
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPositionAttribute);
            console.log('Enabled vertex position attribute');
        }
    
        if (programInfo.attribLocations.vertexNormalAttribute === -1) {
            console.error('Failed to get attribute location: aVertexNormal');
        } else {
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormalAttribute);
            console.log('Enabled vertex normal attribute');
        }
    
        if (programInfo.attribLocations.textureCoordAttribute === -1) {
            console.error('Failed to get attribute location: aTextureCoord');
        } else {
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordAttribute);
            console.log('Enabled texture coordinate attribute');
        }
    
}

function handleKeyDown(event) {
    const angle = Math.PI / 180;
    switch (event.key) {
        case '1': cubeRotation += angle; break;
        case '2': cubeRotation -= angle; break;
        case '3': pedestalRotation += angle; break;
        case '4': pedestalRotation -= angle; break;
        case '5': globalRotation += angle; break;
        case '6': globalRotation -= angle; break;
        case '7': phongLight = !phongLight; break;
        case '8': phongShading = !phongShading; break;
        case 'w': case 'W': uAttenuationLinear += 0.001; break;
        case 's': case 'S': uAttenuationLinear -= 0.001; break;
        case 'q': case 'Q': uAttenuationQuadratic += 0.001; break;
        case 'a': case 'A': uAttenuationQuadratic -= 0.001; break;
        case 'e': case 'E': uAmbientPower += 0.01; break;
        case 'd': case 'D': uAmbientPower -= 0.01; break;
        case 'r': case 'R': uMix = Math.min(uMix + 0.01, 1.0); break;
        case 'f': case 'F': uMix = Math.max(uMix - 0.01, 0.0); break;
    }
    renderScene();
}

function renderScene() {
    const canvas = gl.canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const fieldOfView = 90 * Math.PI / 180;
    mat4.perspective(pMatrix, fieldOfView, canvas.width / canvas.height, 0.1, 100.0);

    gl.useProgram(shaderProgram);

    const positions = [
        [-1, 0.5],
        [-2, -0.5],
        [0, -0.5],
        [-1, -0.5],
    ];

    for (let i = 0; i < 4; i++) {
        gl.useProgram(shaderProgram)
        const globalMatrix = mat4.create();
        mat4.rotateY(globalMatrix, globalMatrix, globalRotation);

        const pedestalPos = [1, 0, -3];
        const pedestalMatrix = mat4.create();
        mat4.translate(pedestalMatrix, pedestalMatrix, pedestalPos);
        mat4.rotateY(pedestalMatrix, pedestalMatrix, pedestalRotation);

        const pedestalGlobalMatrix = mat4.create();
        mat4.multiply(pedestalGlobalMatrix, globalMatrix, pedestalMatrix);

        mvMatrix = pedestalGlobalMatrix;

        mat4.translate(mvMatrix, mvMatrix, [positions[i][0], positions[i][1], 0]);
        mat4.rotateY(mvMatrix, mvMatrix, cubeRotation);

        mat3.normalFromMat4(nMatrix, pedestalGlobalMatrix);

        setMatrixUniforms(i,programInfo);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoordAttribute, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.enable(gl.DEPTH_TEST);
        gl.drawElements(gl.TRIANGLES, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
    };
}

function setMatrixUniforms(i,programInfo) {
    if (!programInfo || !programInfo.uniformLocations) {
        console.error('programInfo or programInfo.uniformLocations is undefined');
        return;
    }
    gl.useProgram(shaderProgram)
    gl.uniform1i(programInfo.uniformLocations.uShadingPhong, phongShading)
    gl.uniform1i(programInfo.uniformLocations.uLightPhong, phongLight)
    gl.uniform4fv(programInfo.uniformLocations.uniformLightColor, cubeColors[i]);

    gl.uniform1f(programInfo.uniformLocations.uAttenuationLinear, uAttenuationLinear)
    gl.uniform1f(programInfo.uniformLocations.uAttenuationQuadratic, uAttenuationQuadratic)
    gl.uniform1f(programInfo.uniformLocations.uAmbientPower, uAmbientPower);

    if (cubeTextures.length > i) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, cubeTextures[i]);
        gl.uniform1i(programInfo.uniformLocations.uNumber, 0);
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, materialTexture);
    gl.uniform1i(programInfo.uniformLocations.uMaterial, 1);

    gl.uniform1f(programInfo.uniformLocations.uMix, uMix);

    gl.uniformMatrix4fv(programInfo.uniformLocations.ProjMatrix, false, pMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.MVMatrix, false, mvMatrix);
    gl.uniformMatrix3fv(programInfo.uniformLocations.NormalMatrix, false, nMatrix);
}

function setupLights() {
    gl.useProgram(shaderProgram)
    gl.uniform3fv(programInfo.uniformLocations.uniformLightPosition, [0.0, 0.0, 5.0]);
}

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initShaderProgram(vsSource, fsSource) {
    const vertexShader = compileShader( gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader( gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
        console.error('Shader compilation failed');
        return null;
    }


    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadTexture(url) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
    };

    image.onerror = function () {
        console.error('Failed to load texture:', url);
    };

    image.crossOrigin = "anonymous";
    image.src = url;
    return texture;
    
}

function setTextures() {
    cubeTextures = [
        loadTexture('1.png'),
        loadTexture('2.png'),
        loadTexture('3.png'),
        loadTexture('')
    ];

    materialTexture = loadTexture('a.jpg');
}


