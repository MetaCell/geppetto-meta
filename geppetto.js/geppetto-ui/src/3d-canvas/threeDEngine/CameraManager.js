import * as THREE from 'three';

export default class CameraManager {
  constructor (engine, cameraOptions) {
    this.engine = engine;
    this.sceneCenter = new THREE.Vector3();
    this.camera = new THREE.PerspectiveCamera(
      cameraOptions.angle,
      cameraOptions.aspect,
      cameraOptions.near,
      cameraOptions.far
    );
    this.engine.scene.add(this.camera);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.direction = new THREE.Vector3(0, 0, 1);
    this.camera.lookAt(this.sceneCenter);
    this.baseZoom = cameraOptions.baseZoom;
    this.isFirstRender = true;
    const { initialFlip } = cameraOptions;
    if (initialFlip && initialFlip.length > 0) {
      this.flipCamera(initialFlip);
    }
  }

  update (cameraOptions) {
    const {
      initialPosition,
      initialRotation,
      autoRotate,
      movieFilter,
      initialZoomTo,
      reset,
      trackballControls
    } = cameraOptions;


    if (reset || (this.isFirstRender && initialPosition === undefined && initialZoomTo === undefined)) {
      this.resetCamera(initialPosition, initialRotation, initialZoomTo);
      if (this.isFirstRender) {
        this.isFirstRender = false;
      }
    } else {
      if (initialPosition && this.isFirstRender) {
        this.setCameraPosition(initialPosition.x, initialPosition.y, initialPosition.z);
      }
      if (initialRotation && this.isFirstRender) {
        this.setCameraRotation(
          initialRotation.rx,
          initialRotation.ry,
          initialRotation.rz,
          initialRotation.radius
        );
      }
      if (initialZoomTo && Array.isArray(initialZoomTo) && this.isFirstRender) {
        const instances = initialZoomTo.map(element => Instances.getInstance(element));
        if (instances.length > 0) {
          this.zoomTo(instances);
        }
      }
      if (autoRotate) {
        this.autoRotate(movieFilter);
      }
      if (trackballControls) {
        this.setTrackballControlsConfigs(trackballControls);
      }
      if (this.isFirstRender) {
        this.isFirstRender = false;
      }
    }
  }

  /**
   *
   * @param instances
   */
  zoomTo (instances) {
    this.engine.controls.reset();
    this.zoomToParameters(this.zoomIterator(instances, {}));
  }

  /**
   *
   * @param initalFlip
   */
  flipCamera (initialFlip) {
    for (const axis of initialFlip) {
      if (axis.toLowerCase() === 'y') {
        this.flipCameraY();
      } else if (axis.toLowerCase() === 'z') {
        this.flipCameraZ();
      }
    }
  }

  /**
   * Reinitializes the camera with the Y axis flipped
   */
  flipCameraY () {
    this.camera.up = new THREE.Vector3(0, -1, 0);
  }

  /**
   * Reinitializes the camera with the Z axis flipped
   */
  flipCameraZ () {
    this.camera.direction = new THREE.Vector3(0, 0, -1);
  }

  /**
   *
   * @param instances
   * @param zoomParameters
   * @returns {*}
   */
  zoomIterator (instances, zoomParameters) {
    const that = this;
    for (let i = 0; i < instances.length; i++) {
      const instancePath = instances[i].getInstancePath();
      const mesh = this.engine.meshFactory.meshes[instancePath];
      if (mesh) {
        mesh.traverse(function (object) {
          if (Object.prototype.hasOwnProperty.call(object, 'geometry')) {
            that.addMeshToZoomParameters(object, zoomParameters);
          }
        });
      } else {
        zoomParameters = this.zoomIterator(
          instances[i].getChildren(),
          zoomParameters
        );
      }
    }
    return zoomParameters;
  }

  /**
   *
   * @param mesh
   * @param zoomParameters
   * @returns {*}
   */
  addMeshToZoomParameters (mesh, zoomParameters) {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    bb.translate(mesh.localToWorld(new THREE.Vector3()));

    // If min and max vectors are null, first values become default min and max
    if (
      zoomParameters.aabbMin == undefined
            && zoomParameters.aabbMax == undefined
    ) {
      zoomParameters.aabbMin = bb.min;
      zoomParameters.aabbMax = bb.max;
    } else {
      // Compare other meshes, particles BB's to find min and max
      zoomParameters.aabbMin.x = Math.min(zoomParameters.aabbMin.x, bb.min.x);
      zoomParameters.aabbMin.y = Math.min(zoomParameters.aabbMin.y, bb.min.y);
      zoomParameters.aabbMin.z = Math.min(zoomParameters.aabbMin.z, bb.min.z);
      zoomParameters.aabbMax.x = Math.max(zoomParameters.aabbMax.x, bb.max.x);
      zoomParameters.aabbMax.y = Math.max(zoomParameters.aabbMax.y, bb.max.y);
      zoomParameters.aabbMax.z = Math.max(zoomParameters.aabbMax.z, bb.max.z);
    }

    return zoomParameters;
  }

  /**
   *
   * @param zoomParameters
   */
  zoomToParameters (zoomParameters) {
    // Compute world AABB center
    this.sceneCenter.x
            = (zoomParameters.aabbMax.x + zoomParameters.aabbMin.x) * 0.5;
    this.sceneCenter.y
            = (zoomParameters.aabbMax.y + zoomParameters.aabbMin.y) * 0.5;
    this.sceneCenter.z
            = (zoomParameters.aabbMax.z + zoomParameters.aabbMin.z) * 0.5;

    this.updateCamera(zoomParameters.aabbMax, zoomParameters.aabbMin);
  }

  resetCamera (position, rotation, zoomTo) {
    const applyRotation = rotation => {
      if (rotation) {
        this.setCameraRotation(
          rotation.rx,
          rotation.ry,
          rotation.rz,
          rotation.radius
        );
      }
    }
    if (zoomTo) {
      const instances = zoomTo.map(element => Instances.getInstance(element));
      if (instances.length > 0) {
        this.zoomTo(instances);
      }
      applyRotation(rotation)
      return;
    }
    if (position) {
      this.setCameraPosition(position.x, position.y, position.z);
      applyRotation(rotation)
      return;
    }

    this.engine.controls.reset();

    let aabbMin = null;
    let aabbMax = null;
    let maxSize = null;
    this.engine.scene.traverse(function (child) {
      if (
        Object.prototype.hasOwnProperty.call(child, 'geometry')
                && child.visible === true
      ) {
        child.geometry.computeBoundingBox();

        let bb = child.geometry.boundingBox;
        let size = bb.getSize(new THREE.Vector3()).length();
        bb.translate(child.localToWorld(new THREE.Vector3()));

        /*
         * If min and max vectors are null, first values become
         * default min and max
         */
        if (aabbMin == null && aabbMax == null && maxSize == null) {
          aabbMin = bb.min;
          aabbMax = bb.max;
          maxSize = size
        } else {
          // Compare other meshes, particles BB's to find min and max
          aabbMin.x = Math.min(aabbMin.x, bb.min.x);
          aabbMin.y = Math.min(aabbMin.y, bb.min.y);
          aabbMin.z = Math.min(aabbMin.z, bb.min.z);
          aabbMax.x = Math.max(aabbMax.x, bb.max.x);
          aabbMax.y = Math.max(aabbMax.y, bb.max.y);
          aabbMax.z = Math.max(aabbMax.z, bb.max.z);
          maxSize = Math.max(maxSize, size);
        }
      }
    });

    if (aabbMin != null && aabbMax != null) {
      // Compute world AABB center
      this.sceneCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
      this.sceneCenter.y = (aabbMax.y + aabbMin.y) * 0.5;
      this.sceneCenter.z = (aabbMax.z + aabbMin.z) * 0.5;
      this.camera.near = maxSize / 100;
      this.camera.far = maxSize * 100;
      this.updateCamera(aabbMax, aabbMin);
    }

    applyRotation(rotation)
  }

  /**
   * Update camera with new position and place to lookat
   * @param aabbMax
   * @param aabbMin
   */
  updateCamera (aabbMax, aabbMin) {
    // Compute world AABB "radius"
    let diag = new THREE.Vector3();
    diag = diag.subVectors(aabbMax, aabbMin);
    const radius = diag.length() * 0.5;

    this.pointCameraTo(this.sceneCenter);

    // Compute offset needed to move the camera back that much needed to center AABB
    const offset
            = radius
            / Math.sin((Math.PI / 180.0) * this.camera.fov * 0.5)
            / this.baseZoom;

    const dir = this.camera.direction.clone();
    dir.multiplyScalar(offset);

    // Store camera position

    this.camera.position.addVectors(dir, this.engine.controls.target);
    this.camera.updateProjectionMatrix();
  }

  /**
   *  Refocus camera to the center of the new object
   * @param node
   */
  pointCameraTo (node) {
    let COG;
    if (node instanceof THREE.Vector3) {
      COG = node;
    } else {
      COG = this.shapeCenterOfGravity(node);
    }
    const v = new THREE.Vector3();
    v.subVectors(COG, this.engine.controls.target);
    this.camera.position.addVectors(this.camera.position, v);

    // retrieve camera orientation

    this.camera.lookAt(COG);
    this.engine.controls.target.set(COG.x, COG.y, COG.z);
  }

  /**
   *
   * @param obj
   * @returns {*}
   */
  shapeCenterOfGravity (obj) {
    return this.boundingBox(obj).center();
  }

  /**
   *
   * @param obj
   * @returns {*}
   */
  boundingBox (obj) {
    if (obj instanceof THREE.Mesh) {
      const geometry = obj.geometry;
      geometry.computeBoundingBox();
      return geometry.boundingBox;
    }

    if (obj instanceof THREE.Object3D) {
      const bb = new THREE.Box3();
      for (let i = 0; i < obj.children.length; i++) {
        bb.union(this.boundingBox(obj.children[i]));
      }
      return bb;
    }
  }

  /**
   * Returns the camera
   * @returns camera
   */
  getCamera () {
    return this.camera;
  }

  /**
   * @param x
   * @param y
   */
  incrementCameraPan (x, y) {
    this.engine.controls.incrementPanEnd(x, y);
  }

  /**
   * @param x
   * @param y
   * @param z
   */
  incrementCameraRotate (x, y, z) {
    this.engine.controls.incrementRotationEnd(x, y, z);
  }

  /**
   * @param z
   */
  incrementCameraZoom (z) {
    this.engine.controls.incrementZoomEnd(z);
  }

  /**
   * @param x
   * @param y
   * @param z
   */
  setCameraPosition (x, y, z) {
    this.engine.controls.setPosition(x, y, z);
  }

  /**
   * @param rx
   * @param ry
   * @param rz
   * @param radius
   */
  setCameraRotation (rx, ry, rz, radius) {
    this.engine.controls.setRotation(rx, ry, rz, radius);
  }

  setTrackballControlsConfigs (config) {
    let { rotationSpeed, zoomSpeed, panSpeed } = config

    this.engine.controls.setRotationalSpeed(rotationSpeed)
    this.engine.controls.setZoomSpeed(zoomSpeed)
    this.engine.controls.setPanSpeed(panSpeed)
  }

  /**
   * Rotate the camera around the selection
   * @movieFilter
   */
  autoRotate (movieFilter) {
    const that = this;
    if (this.rotate == null) {
      if (movieFilter === undefined || movieFilter === true) {
        this.movieMode(true);
      }
      this.engine.controls.setRotationalSpeed(0.075);
      this.rotate = setInterval(function () {
        that.incrementCameraRotate(0.5, 0);
      }, 25);
    } else {
      if (movieFilter === undefined || movieFilter === true) {
        this.movieMode(false);
      }
      this.engine.controls.resetRotationalSpeed();
      clearInterval(this.rotate);
      this.rotate = null;
    }
  }

  /**
   *
   * @param shaders
   */
  movieMode (shaders) {
    this.engine.configureRenderer(shaders);
  }
}
