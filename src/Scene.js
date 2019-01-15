import React, {Component} from 'react';
import GLTFLoader from 'three-gltf-loader';
import * as THREE from 'three';

class Scene extends Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.configureScene = this.configureScene.bind(this);
    this.destroyRenderer = this.destroyRenderer.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
  }

  componentWillMount(){
    window.addEventListener('resize', this.handleWindowResize.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentDidMount(){
    this.loadModel('Car/scene.gltf', 'car1', (car) => {
      this.car = car;
      this.car.name = 'car';
      this.car.position.set(-2, 0, 95);
      this.car.initialPosition = {x: -2, y: 0, z: 95};
      this.car.rotateY(3.15)
      this.car.rotateX(0);
      this.car.scale.set(0.005, 0.005, 0.005);
      this.car.castShadow = true;
      this.car.receiveShadow = false;
      this.configureScene();
    });
  }

  configureScene(){
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setClearColor(0xfffafa, 1);
    renderer.shadowMap.enabled = true;
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2( 0xf0fff0, 0.004 );
    scene.background = new THREE.Color('black');

    const camera = new THREE.PerspectiveCamera(60, width/height, 1, 90000);
    scene.add(camera);
    
    camera.position.z = 100;
    camera.position.y = 2;
    camera.position.x = 0;

    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;

    this.skyBox();
    this.carsCounter = 0;
    this.cars = [];
    setInterval(()=>{this.addCars()}, 7000)
    
    this.models = ['bird1', 'bird2', 'bird3', 'phoenix1', 'phoenix2', 'phoenix3'];
    this.modelLoader('flying_bird/scene.gltf', {x: 4, y: 3, z: 94}, this.models[0], {x: 19.2, y: 0, z: 0});
    this.modelLoader('flying_bird/scene.gltf', {x: 4, y: 2.3, z: 94.5}, this.models[1], {x: 19.2, y: 0, z: 0});
    this.modelLoader('flying_bird/scene.gltf', {x: 4.5, y: 3, z: 94.5}, this.models[2], {x: 19.2, y: 0, z: 0});
    setTimeout(() => {
      this.addBirds();
    }, 5000)

    let plane = new THREE.PlaneGeometry(20,1000,14,14);
    let material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide, 
      map: new THREE.TextureLoader().load("Road/Albedo.jpg"),
      aoMap: new THREE.TextureLoader().load("Road/Ao.jpg"),
      displacementMap: new THREE.TextureLoader().load("Road/Displacement.jpg"),
      normalMap: new THREE.TextureLoader().load("Road/Normal.jpg"), 
      lightMap: new THREE.TextureLoader().load("Road/Specular.jpg"),
      roughness: 1,
      normalScale: new THREE.Vector2(0.6,0.6)

    })

    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 10);

    let ground = new THREE.Mesh(plane, material);
    ground.receiveShadow = true;
    ground.castShadow = false;
    ground.rotation.x=-Math.PI/2; 
    ground.position.z = 100;
    ground.position.y = -1;
    this.ground = ground;
    scene.add(ground);

    let ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambLight.position.set(0, 100, 300);
    camera.add(ambLight);

    let hemiLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9);
    scene.add(hemiLight);
    
    let dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(100, 100, 100);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 256;
    dirLight.shadow.mapSize.height = 256;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50 ;
    scene.add(dirLight);
    this.updateSpeed = 0.005;

    renderer.setSize(width, height);
    this.container.appendChild(renderer.domElement);
    this.counter = 0;
    this.start();
  }

  addBirds(){
    this.modelLoader('phoenix_bird/scene.gltf', {x: -35, y: 10, z: 80}, this.models[3], {x: 0, y: 1, z: 0}, {x: 0.01, y: 0.01, z: 0.01});
    this.modelLoader('phoenix_bird/scene.gltf', {x: -45, y: 13, z: 85}, this.models[4], {x: 0, y: 1, z: 0}, {x: 0.01, y: 0.01, z: 0.01});
    this.modelLoader('phoenix_bird/scene.gltf', {x: -50, y: 8, z: 80}, this.models[5], {x: 0, y: 1, z: 0}, {x: 0.01, y: 0.01, z: 0.01});
  }

  generateRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  addCars(){
    let numCars = 1;
    let range = [-2, 2];
    this.carsCounter += 1;
    for (let i = 0; i < numCars; i++){
      this.cars.push(`car${this.carsCounter}`);
      this.state[`car${this.carsCounter}`] = this.car.clone();
      this.state[`car${this.carsCounter}`].name = `car${this.carsCounter}`;
      this.state[`car${this.carsCounter}`].position.x = range[this.generateRandomNumber(0,1)];
      this.state[`car${this.carsCounter}`].position.z = Math.random() * (100 - (95)) + (95);
      this.scene.add(this.state[`car${this.carsCounter}`]);
    }
  }

  skyBox(){
    let geometry = new THREE.CubeGeometry(9000,9000,9000);
    var cubeMaterials = [
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "Skybox/nightsky_ft.png" ), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'Skybox/nightsky_bk.png' ), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'Skybox/nightsky_up.png' ), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'Skybox/nightsky_dn.png' ), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'Skybox/nightsky_rt.png' ), side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'Skybox/nightsky_lf.png' ), side: THREE.DoubleSide })
    ];
  
    var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
    this.sky = new THREE.Mesh( geometry, cubeMaterial );
    this.scene.add(this.sky);
  }


  modelLoader(model, position, name, rotation, scale){
    this.state[name] = {};
    this.state[name].actions = {};
    let gltfLoader = new GLTFLoader();
    gltfLoader.load(model, object => {
      this.mesh = object.scene;
      this.mesh.name = name;
      this.mesh.traverse(item => {
        if (item.isMesh){
          item.castShadow = true;
        }
      });
      this.state[name].mixer = new THREE.AnimationMixer(this.mesh);
      this.state[name].initialPosition = position;
      this.state[name].mesh = this.mesh;
      if (rotation){
        this.state[name].mesh.rotateX(rotation.x);
        this.state[name].mesh.rotateY(rotation.y);
        this.state[name].mesh.rotateZ(rotation.z);
      }
      if (scale){
        this.state[name].mesh.scale.set(scale.x, scale.y, scale.z);
      }
      this.state[name].clock = new THREE.Clock();
      for (var i = 0; i < object.animations.length; i++){
        var clip = object.animations[i];
        var action =  this.state[name].mixer.clipAction(clip);
        this.state[name].actions[clip.name] = action;
      }
      this.state[name].activeAction = this.state[name].actions[Object.keys(this.state[name].actions)[0]];
      if (this.state[name].activeAction){
        this.state[name].activeAction.fadeIn(0.5);
        this.state[name].activeAction.play();
      }
      this.object = this.mesh;
      this.mesh.position.set(position.x, position.y, position.z)
      this.scene.add(this.mesh);  
    });
  }

  distanceVector(v1, v2){
    return ( parseInt((Math.pow( (v1.x - v2.x), 2) ) + ( (Math.pow( (v1.y - v2.y), 2)) ) + ( (Math.pow( (v1.z - v2.z), 2)) ) ));
  }

  loadModel(model, name, cbk){
    let gltfLoader = new GLTFLoader();
    this.birdActions = {};
    gltfLoader.load(model, object => {
      this.bird = object.scene;
      this.bird.name = name;
      this.bird.traverse(item => {
        if (item.isMesh){
          item.castShadow = true;
        }
      });
      this.mixer = new THREE.AnimationMixer(this.bird);
      this.clock = new THREE.Clock();
      for (var i = 0; i < object.animations.length; i++){
        var clip = object.animations[i];
        var action =  this.mixer.clipAction(clip);
        this.birdActions[clip.name] = action;
      }
      this.birdActiveAction = this.birdActions[Object.keys(this.birdActions)[0]];
      if (this.birdActiveAction){
        this.birdActiveAction.fadeIn(0.5);
        this.birdActiveAction.play();
      }
      cbk(this.bird);  
    });
  }

  start(){
    if (!this.frameId){
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop(){
    cancelAnimationFrame(this.frameId)
  }

  animate(){
    this.frameId = requestAnimationFrame(this.animate);
    this.ground.material.map.offset.y += this.updateSpeed;
    if (this.cars && this.cars.length > 0){
      this.cars.map( (car, index) => {
        let increment = 0.1
        this.state[car].position.set(this.state[car].position.x, this.state[car].position.y, this.state[car].position.z - (increment))
        let distance = this.distanceVector(this.state[car].position, new THREE.Vector3(this.ground.position.x, this.ground.position.y, this.ground.position.z - 200))
        if ( distance > 10  && distance < 30 ){
          this.scene.remove(this.scene.getObjectByName(car)); 
        }
      })
    }
    this.models.map(model => {
      if (this.state[model] && this.state[model].mixer && this.state[model].clock){
        this.counter += 1;
        this.state[model].mixer.update(this.state[model].clock.getDelta());
        if (model.includes('phoenix')){
          this.state[model].mesh.position.set(this.state[model].mesh.position.x + 1, this.state[model].mesh.position.y, this.state[model].mesh.position.z - 1);
        }
        if(this.counter > 5000){
          this.removeModels();
          this.counter = 0;
          this.addBirds();
        }
      }
    })
    this.renderScene();
  }

  renderScene(){
    this.renderer.render(this.scene, this.camera);
  }

  removeModels(){
    this.models.map( (model,index) => {
      if (model.includes('phoenix')){
        this.scene.remove(this.scene.getObjectByName(model));
        this.state[model].mesh.position.set(this.state[model].initialPosition.x, this.state[model].initialPosition.y, this.state[model].initialPosition.z)
      }
    })
  }

  componentWillUnmount(){
    this.destroyRenderer();
  }

  handleWindowResize(){
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  handleKeyDown(e){
    // if (e.keyCode === 37){   //left arrow
    //   console.log('%c left arrow: ', 'color: dodgerblue');
    //   this.state['bird1'].mesh.position.set(this.state['bird1'].mesh.position.x - 0.1, this.state['bird1'].mesh.position.y, this.state['bird1'].mesh.position.z)
    //   this.camera.position.set(this.camera.position.x - 0.1, this.camera.position.y, this.camera.position.z)
      
    // } 
    // else if (e.keyCode === 39) { //right arrow
    //   console.log('%c right arrow: ', 'color: orange');
    //   this.state['bird1'].mesh.position.set(this.state['bird1'].mesh.position.x + 0.1, this.state['bird1'].mesh.position.y, this.state['bird1'].mesh.position.z)
    //   this.camera.position.set(this.camera.position.x + 0.1, this.camera.position.y, this.camera.position.z)
    // }
    // else if (e.keyCode === 38) { //up arow
    //   console.log('%c Up arrow: ', 'color: orange');
    //   this.state['bird1'].mesh.position.set(this.state['bird1'].mesh.position.x, this.state['bird1'].mesh.position.y, this.state['bird1'].mesh.position.z - 0.1)
    //   this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z - 0.1)
    // }
    // else if (e.keyCode === 40) { //down arow
    //   console.log('%c Down arrow: ', 'color: orange');
    //   this.state['bird1'].mesh.position.set(this.state['bird1'].mesh.position.x, this.state['bird1'].mesh.position.y, this.state['bird1'].mesh.position.z + 0.1)
    //   this.camera.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z + 0.1)
    // }
  }

  handleMouseClick(e){
    console.log('%c Click: ', 'color: green');
  }

  destroyRenderer(){
    this.container.removeChild(this.destroyRenderer.domElement);
    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;
    this.renderer = null;
  }

  render(){
    return(
      <div 
        ref={(container) => {this.container = container}} 
        style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden'}} 
        onClick={this.handleMouseClick}
      >
      </div>
    );
  }
}

export default Scene;