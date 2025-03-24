import * as mat4 from './esm/mat4.js'
window.onload = main;

        let cubeRotation = 0;
        let pedestalRotation = 0;
        let globalRotation = 0;

        const cubeColors = [
            [1.0, 0.8, 0.0, 1.0],
            [1.0, 0.8, 0.0, 1.0],
            [1.0, 0.8, 0.0, 1.0],
            [1.0, 0.8, 0.0, 1.0],
        ];

        const cubeOffsets = [
            [-0.5, 0.5, 0],
            [-1.5, -0.5, 0],
            [-0.5, -0.5, 0],
            [0.5, -0.5, 0],
        ];

        const vertices = new Float32Array([
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            0, 4, 7, 0, 7, 3,
            1, 5, 6, 1, 6, 2,
            3, 2, 6, 3, 6, 7,
            0, 1, 5, 0, 5, 4
        ]);

        const vertexShaderSource = `
            attribute vec4 aPosition;
            uniform mat4 uModelViewMatrix;
            void main(void) {
                gl_Position = uModelViewMatrix * aPosition;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 vColor;
            void main(void) {
                gl_FragColor = vColor;
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
                    aPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
                },
                uniformLocations: {
                    uModelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
                    vColor: gl.getUniformLocation(shaderProgram, 'vColor'),
                },
            };

            window.addEventListener("keydown", (event) => handleKeyDown(event, gl, canvas, programInfo));
            renderScene(gl, canvas, programInfo);
        }

        function handleKeyDown(event, gl, canvas, programInfo) {
            const angleIncrement = Math.PI / 90;
            switch (event.key) {
                case '1': cubeRotation += angleIncrement; break;
                case '2': cubeRotation -= angleIncrement; break;
                case '3': pedestalRotation += angleIncrement; break;
                case '4': pedestalRotation -= angleIncrement; break;
                case '5': globalRotation += angleIncrement; break;
                case '6': globalRotation -= angleIncrement; break;
            }
            renderScene(gl, canvas, programInfo);
        }

        function renderScene(gl, canvas, programInfo) {

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            const fieldOfView = 90 * Math.PI / 180;
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

            
            const vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, vertices);
            const indexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indices);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.aPosition);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            for (let i = 0; i < 4; i++) {
                const cubeMatrix = mat4.clone(pedestalGlobalMatrix);
                mat4.translate(cubeMatrix, cubeMatrix, cubeOffsets[i]);
                mat4.rotate(cubeMatrix, cubeMatrix, cubeRotation, [0, 1, 0]);

                const modelViewMatrix = mat4.create();
                mat4.multiply(modelViewMatrix, viewMatrix, cubeMatrix);

                const mvpMatrix = mat4.create();
                mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

                gl.useProgram(programInfo.program);
                gl.uniformMatrix4fv(programInfo.uniformLocations.uModelViewMatrix, false, mvpMatrix);
                gl.uniform4fv(programInfo.uniformLocations.vColor, cubeColors[i]);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            }
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

        