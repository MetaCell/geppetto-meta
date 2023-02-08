/* eslint-disable no-template-curly-in-string */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Resources from '@metacell/geppetto-meta-core/Resources';
import MeshFactory from '@metacell/geppetto-meta-ui/3d-canvas/threeDEngine/MeshFactory';
import 'aframe';
import 'aframe-slice9-component';
import LaserControls from '../LaserControls';
import '../aframe/interactable';
import '../aframe/thumbstick-controls';
import '../aframe/rig-wasd-controls';
import { BRING_CLOSER, } from '../Events';
import particle from "@metacell/geppetto-meta-ui/3d-canvas/textures/particle.png";
import { hasVisualType, hasVisualValue } from "../../3d-canvas/threeDEngine/util";

const HOVER_COLOR = { r: 0.67, g: 0.84, b: 0.9 };
const SELECTED_COLOR = { r: 1, g: 1, b: 0 };
const SHORTCUTS = { BRING_CLOSER: 99, };

function getProxyInstance (i) {
  const color = i.getId().startsWith('baskets') ? { r: 0, g:0, b: 1, a:1 } : { r: 1, g:0, b: 0, a:1 }
  return { instancePath: i.getId(), color: color }
}

function updateInstancesMap (geppettoInstance, instancesMap) {
  try {
    if (hasVisualValue(geppettoInstance)) {
      instancesMap.set(geppettoInstance.getInstancePath(), getProxyInstance(geppettoInstance));
    } else if (hasVisualType(geppettoInstance)) {
      if (
        geppettoInstance.getType().getMetaType() !== Resources.ARRAY_TYPE_NODE
          && geppettoInstance.getVisualType()
      ) {
        instancesMap.set(geppettoInstance.getInstancePath(), getProxyInstance(geppettoInstance));
      }
      if (geppettoInstance.getMetaType() === Resources.INSTANCE_NODE) {
        const children = geppettoInstance.getChildren();
        for (let i = 0; i < children.length; i++) {
          updateInstancesMap(children[i], instancesMap);
        }
      } else if (
        geppettoInstance.getMetaType() === Resources.ARRAY_INSTANCE_NODE
      ) {
        for (let i = 0; i < geppettoInstance.length; i++) {
          updateInstancesMap(geppettoInstance[i], instancesMap);
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

function getInstancesMap (instances) {
  const instancesMap = new Map()
  for (const instance of instances){
    updateInstancesMap(instance, instancesMap)
  }
  return instancesMap
}

class Canvas extends Component {
  constructor (props) {
    super(props);
    this.state = {
      loadedTextures: false,
      time: 0,
      isReady: false
    };
    this.canvasRef = React.createRef();
    this.sceneRef = React.createRef();
    this.handleLoadedTextures = this.handleLoadedTextures.bind(this);
    this.handleHover = this.handleHover.bind(this);
    this.handleHoverLeave = this.handleHoverLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyboardPress = this.handleKeyboardPress.bind(this);
    this.threeMeshes = {};
    this.selectedMeshes = {};
    this.hoveredMeshes = {};
    this.initTextures(this.handleLoadedTextures);
  }

  initTextures (callback) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(particle, texture => {
      this.particleTexture = texture;
      callback();
    });
  }

  componentDidMount () {
    const { id, threshold } = this.props;
    const scene = document.getElementById(`${id}_scene`);
    this.meshFactory = new MeshFactory(
      scene.object3D,
      threshold,
      true,
      300,
      1,
      null,
      THREE    
    );

    this.sceneRef.current.addEventListener('mesh_hover', this.handleHover);
    this.sceneRef.current.addEventListener(
      'mesh_hover_leave',
      this.handleHoverLeave
    );
    this.sceneRef.current.addEventListener('mesh_click', this.handleClick);
    document.addEventListener('keypress', this.handleKeyboardPress);
    
    this.setEntityMeshes();
  }

  shouldComponentUpdate (nextProps) {
    const { instances } = this.props;
    if (instances !== nextProps.instances) {
      this.meshFactory.start(getInstancesMap(nextProps.instances));
    }
    return true;
  }

  componentDidUpdate () {
    const { instances } = this.props;
    const { loadedTextures, isReady } = this.state;
    if (!isReady) {
      if (loadedTextures) {
        this.meshFactory.setParticleTexture(this.particleTexture);
        this.meshFactory.start(getInstancesMap(instances)).then(_ => {
          this.threeMeshes = this.meshFactory.getMeshes();
          this.setState({ isReady: true })
        })
      }
    }
    this.setEntityMeshes();

  }

  setEntityMeshes () {
    const canvasEntity = this.canvasRef.current;
    const sceneMeshes = [];
    const keysThreeMeshes = Object.keys(this.threeMeshes).filter(
      key => this.threeMeshes[key].visible
    );
    for (let i = 0; i < canvasEntity.children.length; i++) {
      const element = canvasEntity.children[i];
      if (element.id.startsWith('a-entity')) {
        sceneMeshes.push(element);
      }
    }
    if (sceneMeshes.length !== keysThreeMeshes.length) {
      throw new Error(
        'Meshes do not match. Possible illegal use of a-entity as id.'
      );
    }
    let i = 0;
    for (const meshKey of keysThreeMeshes) {
      const entity = sceneMeshes[i];
      const mesh = this.threeMeshes[meshKey];
      entity.setObject3D('mesh', mesh);
      i++;
    }
  }

  handleLoadedTextures () {
    this.setState({ loadedTextures: true });
  }

  handleHover (evt) {
    const { handleHover } = this.props;
    if (Object.keys(this.hoveredMeshes).includes(evt.detail.id)) {
      return;
    }
    if (
      evt.detail.getObject3D('mesh') !== undefined
      && evt.detail.getObject3D('mesh').material
    ) {
      this.hoveredMeshes[evt.detail.id] = { ...evt.detail.getObject3D('mesh').material.color, };
      evt.detail
        .getObject3D('mesh')
        .material.color.setRGB(HOVER_COLOR.r, HOVER_COLOR.g, HOVER_COLOR.b);
      handleHover(evt, false);
    }
  }

  handleHoverLeave (evt) {
    const { handleHoverLeave } = this.props;
    if (Object.keys(this.hoveredMeshes).includes(evt.detail.id)) {
      const color = this.hoveredMeshes[evt.detail.id];
      evt.detail
        .getObject3D('mesh')
        .material.color.setRGB(color.r, color.g, color.b);

      delete this.hoveredMeshes[evt.detail.id];
    }
    handleHoverLeave(evt, false);
  }

  handleKeyboardPress (evt) {
    // eslint-disable-next-line eqeqeq
    if (evt.keyCode === SHORTCUTS.COLLAPSE_MENU) {
      const { isMenuVisible } = this.state;
      this.setState({ isMenuVisible: !isMenuVisible });
    } else if (evt.keyCode === SHORTCUTS.BRING_CLOSER) {
      let toModel = true;
      const cEvent = new CustomEvent(BRING_CLOSER, { detail: null });
      // TODO: Only works for 1 selected object atm
      if (Object.keys(this.selectedMeshes).length === 1) {
        for (const selected of Object.keys(this.selectedMeshes)) {
          const el = document.getElementById(selected);
          el.dispatchEvent(cEvent);
          toModel = false;
        }
        if (toModel) {
          const { id } = this.props;
          const modelID = `${id}_model`;
          const model = document.getElementById(modelID);
          model.dispatchEvent(cEvent);
        }
      }
    }
  }

  handleClick (evt) {
    const { handleClick } = this.props;
    const preventDefault = handleClick(evt);
    if (!preventDefault && evt.detail.getObject3D('mesh') !== undefined) {
      if (Object.keys(this.selectedMeshes).includes(evt.detail.id)) {
        // eslint-disable-next-line no-param-reassign
        evt.detail.selected = false;
        const color = this.selectedMeshes[evt.detail.id];
        if (
          (color.r != undefined)
          & (color.g != undefined)
          & (color.b != undefined)
        ) {
          evt.detail
            .getObject3D('mesh')
            .material.color.setRGB(color.r, color.g, color.b);
        } else {
          evt.detail.getObject3D('mesh').material.color.set(color);
        }
        delete this.selectedMeshes[evt.detail.id];
        this.hoveredMeshes = { ...evt.detail.getObject3D('mesh').material.color, };
      } else {
        // eslint-disable-next-line no-param-reassign
        evt.detail.selected = true;
        const meshCopy = evt.detail.getObject3D('mesh').material.defaultColor;
        this.selectedMeshes[evt.detail.id] = meshCopy;

        evt.detail
          .getObject3D('mesh')
          .material.color.setRGB(
            SELECTED_COLOR.r,
            SELECTED_COLOR.g,
            SELECTED_COLOR.b
          );

        this.hoveredMeshes = { ...evt.detail.getObject3D('mesh').material.color, };
      }
    }
  }

  render () {
    const {
      sceneBackground,
      id,
      position,
      rotation,
      embedded,
    } = this.props;

    const sceneID = `${id}_scene`;
    const cameraID = `${id}_camera`;
    const modelID = `${id}_model`;

    return (
      <a-scene
        id={sceneID}
        ref={this.sceneRef}
        background={sceneBackground}
        loading-screen="dotsColor: orange; backgroundColor: black"
        class="scene"
        shadow="enabled: false; autoUpdate: false"
        light="defaultLightsEnabled: false"
        embedded={embedded}
      >
        <a-assets>
          <img
            id="sliceImg"
            alt="slice_image"
            src="https://cdn.glitch.com/0ddef241-2c1a-4bc2-8d47-58192c718908%2Fslice.png?1557308835598"
            crossOrigin="true"
          />

          <a-mixin
            id="buttonBackground"
            mixin="slice"
            slice9="width: 1.3; height: 0.3; color: #030303"
          />
          <a-mixin
            id="buttonText"
            mixin="font"
            text="align: center; width: 2.5; zOffset: 0.01; color: #333"
          />

          <a-mixin
            id="button"
            mixin="buttonBackground buttonText"
            class="collidable"
          />

          <a-mixin
            id="slice"
            slice9="color: #050505; transparent: true; opacity: 0.9; src: #sliceImg; left: 50; right: 52; top: 50; bottom: 52; padding: 0.15"
          />
        </a-assets>

        <a-entity
          id={cameraID}
          position="0 5 0"
          thumbstick-controls={`id: ${id}; acceleration:200`}
          rig-wasd-controls="fly:true; acceleration:200"
        >
          <a-camera cursor="rayOrigin: mouse" wasd-controls="enabled:false" />
          <LaserControls id={id} />
        </a-entity>

        <a-plane
          position="0 0 -4"
          rotation="-90 0 0"
          width="100"
          height="100"
          color="#7BC8A4"
        />
        <a-entity
          ref={this.canvasRef}
          position={position}
          rotation={rotation}
          scale="0.1, 0.1 0.1"
          id={modelID}
          interactable={`id: ${id}`}
        >
          {Object.keys(this.threeMeshes)
            .filter(key => this.threeMeshes[key].visible)
            .map(key => (
              <a-entity
                class="collidable"
                key={`a-entity${key}_${id}`}
                id={`a-entity${key}_${id}`}
                interactable={`id: ${id}`}
              />
            ))}
        </a-entity>
      </a-scene>
    );
  }
}

Canvas.defaultProps = {
  threshold: 1000,
  colorMap: {},
  position: '-20 -20 -80',
  rotation: '0 0 0',
  sceneBackground: 'color: #ECECEC',
  handleHover: () => false,
  handleClick: () => false,
  handleHoverLeave: () => {},
  handleModelChange: () => {},
};

Canvas.propTypes = {
  /**
   * Instances
   */
  instances: PropTypes.arrayOf(PropTypes.object).isRequired,
  /**
   * Model used in canvas
   */
  model: PropTypes.object.isRequired,
  /**
   * Id of this canvas
   */
  id: PropTypes.string.isRequired,
  /**
   * Threshold
   */
  threshold: PropTypes.number,
  /**
   *  Color map
   */
  colorMap: PropTypes.object,
  /**
   * Three values to describe position along x, y, and z axis. Format example => "-20 -20 -80"
   */
  position: PropTypes.string,
  /**
   * Three values to describe rotation. Format example => "0 0 0"
   */
  rotation: PropTypes.string,
  /**
   * Color applied to the scene's background. Format example => "color: #ECECEC"
   */
  sceneBackground: PropTypes.string,
  /**
   * Function to callback on hover
   */
  handleHover: PropTypes.func,
  /**
   * Function to callback on click
   */
  handleClick: PropTypes.func,
  /**
   * Function to callback on hover leave
   */
  handleHoverLeave: PropTypes.func,
  /**
   * Function to callback when model changes
   */
  handleModelChange: PropTypes.func,
};

export default Canvas;
