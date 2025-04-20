import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.up.set(0, 0, 1);
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
const loader = new THREE.TextureLoader();


let car;
let cat;
let collisionCube;
let leftHeadlight, rightHeadlight;
const streetLights = [];
let ambientLight;
let mixer = null;


const lightStates = {
    general: true,
    headlights: true,
    streetLamps: true
};


function createAmbientLight() {
    ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
}


loader.load("road.jpg", texture => {
    const carpet = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 30),
        new THREE.MeshPhongMaterial({map: texture})
    );
    carpet.position.z = 0;
    carpet.receiveShadow = true;
    scene.add(carpet);
});

loader.load("stena.jpg",texture =>{
collisionCube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 29,10),new THREE.MeshPhongMaterial({map: texture}));
collisionCube.position.set(25,0,5);
collisionCube.rotation.set(0,0,0)
collisionCube.receiveShadow = true;
scene.add(collisionCube);

});

const manager = new THREE.LoadingManager();


new MTLLoader(manager).load('car.mtl', materials => {
    materials.preload();
    new OBJLoader(manager).setMaterials(materials).load("car.obj", loadcar => {
        loadcar.scale.set(0.5, 0.5, 0.5);
        loadcar.position.fromArray([-15,0,0]);
        loadcar.rotation.set(0, 0, 0);
        loadcar.up.set(0, 0, 1);
        
        const targetPoint = new THREE.Vector3(-1, 0, 0); 
        loadcar.lookAt(targetPoint);

        
        leftHeadlight = new THREE.SpotLight(
            0xfff4e5, 
            3,        
            20,      
            Math.PI/6, 
            0.5,      
            1.5       
        );
        
        rightHeadlight = leftHeadlight.clone();
        
    
        leftHeadlight.position.set(-3, 2, 12);
        rightHeadlight.position.set(3, 2, 12);
        
       
        const headlightTarget = new THREE.Object3D();
        headlightTarget.position.set(0, 0, 20);
        loadcar.add(headlightTarget);
        
        leftHeadlight.target = headlightTarget;
        rightHeadlight.target = headlightTarget;
        
        
        leftHeadlight.castShadow = true;
        rightHeadlight.castShadow = true;
        leftHeadlight.shadow.mapSize.width = 512;
        leftHeadlight.shadow.mapSize.height = 512;
        rightHeadlight.shadow.mapSize = leftHeadlight.shadow.mapSize;
        
        
        loadcar.add(leftHeadlight);
        loadcar.add(rightHeadlight);
        
        
        headlightTarget.updateMatrixWorld();
        
        car = loadcar;
        scene.add(loadcar);
        
        setupCarControls();
    });
});


function createStreetLamp(x, y, z) {
    new MTLLoader(manager).load('lamp.mtl', materials => {
        materials.preload();
        new OBJLoader(manager).setMaterials(materials).load("lamp.obj", lamp => {
            lamp.scale.set(0.01, 0.01, 0.01);
            lamp.position.set(x, y, z);
            lamp.up.set(0, 0, 1);
            lamp.lookAt(new THREE.Vector3(x, 0, z));

            const lampLight = new THREE.SpotLight(0xfff4e5, 3, 15, 60, 0.5, 2);
            if(y > 0){
                lampLight.position.set(x, y-1, z + 7);
                const lightTarget = new THREE.Object3D();
                lightTarget.position.set(x, y-3, z);
                scene.add(lightTarget);
                lampLight.target = lightTarget;
            } else {
                lampLight.position.set(x, y+1, z + 7);
                const lightTarget = new THREE.Object3D();
                lightTarget.position.set(x, y+3, z);
                scene.add(lightTarget);
                lampLight.target = lightTarget;
            }
            
            lampLight.target.updateMatrixWorld();
            lampLight.castShadow = true;
            lampLight.shadow.mapSize.width = 1024;
            lampLight.shadow.mapSize.height = 1024;
            lampLight.shadow.camera.near = 1;
            lampLight.shadow.camera.far = 50;
            lampLight.shadow.focus = 1;
            
            streetLights.push(lampLight);
            scene.add(lamp);
            scene.add(lampLight);
        });
    });
}


function createBench(x,y,z){

    new MTLLoader(manager).load('bench.mtl', materials =>{
        materials.preload();
        new OBJLoader(manager).setMaterials(materials).load('bench.obj',bench=>{
            bench.scale.set(0.5,0.5,0.5);
            bench.position.set(x,y,2.5);
            bench.rotateOnWorldAxis(new THREE.Vector3(1,0,0),Math.PI/2)
            if(y<0){
                
                bench.rotateOnWorldAxis(new THREE.Vector3(0,0,1),Math.PI)
            }
            scene.add(bench);
        });
    })
}



createStreetLamp(-15, -10, 0);
createStreetLamp(-15, 10, 0);
createStreetLamp(-5, -10, 0);
createStreetLamp(-5, 10, 0);
createStreetLamp(5, -10, 0);
createStreetLamp(5, 10, 0);



createBench(-10,-10,0);
createBench(-10,10,0);
createBench(0,-10,0);
createBench(0,10,0);


function toggleGeneralLight() {
    lightStates.general = !lightStates.general;
    ambientLight.visible = lightStates.general;
    console.log('Общее освещение:', lightStates.general ? 'ВКЛ' : 'ВЫКЛ');
}

function toggleHeadlights() {
    lightStates.headlights = !lightStates.headlights;
    if (leftHeadlight) leftHeadlight.visible = lightStates.headlights;
    if (rightHeadlight) rightHeadlight.visible = lightStates.headlights;
    console.log('Фары:', lightStates.headlights ? 'ВКЛ' : 'ВЫКЛ');
}

function toggleStreetLights() {
    lightStates.streetLamps = !lightStates.streetLamps;
    streetLights.forEach(light => {
        light.visible = lightStates.streetLamps;
    });
    console.log('Уличные фонари:', lightStates.streetLamps ? 'ВКЛ' : 'ВЫКЛ');
}


createAmbientLight();


function checkCollision() {
    if (!car || !collisionCube) return false;
    
    const carBox = new THREE.Box3().setFromObject(car);
    const cubeBox = new THREE.Box3().setFromObject(collisionCube);
    
    return carBox.intersectsBox(cubeBox);
}

const carSpeed = 0.2;
let updateCatMovement = null;
const keysPressed = {};

window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    
    if (e.key === '1') toggleGeneralLight();
    if (e.key === '2') toggleHeadlights();
    if (e.key === '3') toggleStreetLights();
});

window.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
});





function loadAnimatedFBX(modelPath, callback) {
    const loader = new FBXLoader();
    loader.load(modelPath, (fbx) => {
        fbx.scale.setScalar(0.05);
        fbx.position.set(-15, -5, 0);
        fbx.rotateX(Math.PI / 2);

        fbx.traverse((c) => {
            if (c.isMesh) {
                c.castShadow = true;
            }
        });

        if (fbx.animations && fbx.animations.length > 0) {
            mixer = new THREE.AnimationMixer(fbx);
            const action = mixer.clipAction(fbx.animations[0]);
            action.play();
        }

        cat = fbx;
        scene.add(fbx);
        
        if (callback) callback();
    }, undefined, (error) => {
        console.error("FBX load error:", error);
    });
}



function catMoving() {
    if (!cat) return;
    
    const catSpeed = 0.025;
    let movingForward = true;
    let lastTurnTime = 0; 
    
    function checkCatBoundaries() {
        if (cat.position.x > 25) {
            return 'right';
        }
        if (cat.position.x < -25) {
            return 'left';
        }
        

        if (collisionCube) {
            const catBox = new THREE.Box3().setFromObject(cat);
            const cubeBox = new THREE.Box3().setFromObject(collisionCube);
            

            const expandedCubeBox = cubeBox.clone().expandByScalar(1.5);
            
            if (catBox.intersectsBox(expandedCubeBox)) {
                return 'collision';
            }
        }
        
        return false;
    }
    

    return function updateCat(delta) {
        const boundary = checkCatBoundaries();
        const currentTime = Date.now();
        
        if (boundary && currentTime - lastTurnTime > 1000) { 
            cat.rotation.y += Math.PI;
            movingForward = !movingForward;
            lastTurnTime = currentTime;
            

            const direction = movingForward ? 1 : -1;
            cat.position.x -= catSpeed * direction * 2;
        }
        
        const direction = movingForward ? 1 : -1;
        cat.position.x += catSpeed * direction;
    };
}

function setupCarControls() {
    const direction = new THREE.Vector3();
    
    
    function updateCarMovement() {
        if (!car) return;
        
        const isColliding = checkCollision();
        car.getWorldDirection(direction);
        direction.z = 0;
        direction.normalize();
        
        if ((keysPressed['w'] || keysPressed['arrowup']) && !isColliding) {
            car.position.addScaledVector(direction, carSpeed);
        }
        
        if (keysPressed['s'] || keysPressed['arrowdown']) {
            car.position.addScaledVector(direction, -carSpeed);
        }
    }

    let clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        
        updateCarMovement();
        
       
        if (updateCatMovement) {
            updateCatMovement(delta);
        }
        
       
        if (mixer) {
            mixer.update(delta);
        }
        
        controls.update();
        renderer.render(scene, camera);
    }
    
    
    
    
    animate();
}

loadAnimatedFBX("cat.fbx", () => {
    updateCatMovement = catMoving();
});


setupCarControls();