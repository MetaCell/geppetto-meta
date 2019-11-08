import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { ForceGraph3D, ForceGraph2D } from 'react-force-graph';

import linkForce from './forces/link'
import holdForce from './forces/hold'
import centerForce from './forces/center'
import manyBodyForce from './forces/manyBody'

const fullSizeStyle = { width: '100%', height: '100%' }

export default class GeppettoGraphVisualization extends Component {

  // Ref to GGV container
  ggv = React.createRef()

  dimensions = {}
  
  componentDidMount (){
    const { data, url, noForces = false } = this.props
    var charge = null, link = null, center = null, hold = holdForce()

    
    if (!noForces) {
      charge = manyBodyForce()
      link = linkForce(data.links)
      center = centerForce()
      hold = null
    }
    this.ggv.current.d3Force("charge", charge)
    this.ggv.current.d3Force("link", link)
    this.ggv.current.d3Force("center", center)
    this.ggv.current.d3Force('hold', hold)


    if (url) {
      this.addToScene()
    } else if (!this.props.d2) {
      this.zoomCameraToFitScene()
    } else {
      this.forceUpdate()
    }
     
  }

  componentDidUpdate () {
    const dimensions = ReactDOM.findDOMNode(this).parentNode.getBoundingClientRect()
    if (dimensions.width !== this.dimensions.width || dimensions.height !== this.dimensions.height) {
      this.dimensions = dimensions
      this.forceUpdate()
    }
  }

  // add a obj file to the scene from url
  addToScene () {
    const { url, wireframe = true } = this.props
    var loader = new THREE.OBJLoader();
    // load a resource
    loader.load(
      // resource URL
      url,
      // called when resource is loaded
      object => {
        if (wireframe) {
          this.wireframeAnObject(object)
        }
        this.zoomCameraToFitScene(object)
        window.scene.add( object );
      },
      // called when loading is in progresses
      xhr => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      // called when loading has errors
      error => {
        console.log( 'An error happened trying to load OBJ file into THREE scene.');
      }
    );
  }
  
  // wireframe the loaded obj file 
  wireframeAnObject = object => {
    const { wireframeColor = 0x6893DE } = this.props
    object.traverse( child => {
      if ( child instanceof THREE.Mesh ) {
        const { geometry, material } = child
        let mesh = new THREE.Mesh(geometry, material);
        window.scene.add(mesh);

        mesh.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material.wireframe = true;
            child.material.color = new THREE.Color(wireframeColor);
          }
        });
      }
    })
  }

  getMaxAndMinVectors () {
    const { nodes } = this.props.data;
    var maxX = 0, maxY = 0, maxZ = 0, minX = 0, minY = 0, minZ = 0

    nodes.forEach(({ defaultX, defaultY, defaultZ }) => {
      if (defaultX) {
        if (defaultX > maxX) {
          maxX = defaultX
        } else if (defaultX < minX) {
          minX = defaultX
        }
      }

      if (defaultY) {
        if (defaultY > maxY) {
          maxY = defaultY
        } else if (defaultY < minY) {
          minY = defaultY
        }
      }

      if (defaultZ) {
        if (defaultZ > maxZ) {
          maxZ = defaultZ
        } else if (defaultZ < minZ) {
          minZ = defaultZ
        }
      }
    })

    const minVector = new THREE.Vector3( minX, minY, minZ );
    const maxVector = new THREE.Vector3( maxX, maxY, maxZ );
    
    return [minVector, maxVector, maxX || minY || maxY || minY || maxZ || minZ]
  }

  // cameraSizeRatioToNodeSize controls how big nodes look compared to 
  zoomCameraToFitScene (object = undefined, cameraSizeRatioToNodeSize = 400) {
    var offset = this.props.offset ? this.props.offset : 1.25
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const boundingBox = new THREE.Box3();

    if (object) {
      // if we load a OBJ file, we need to get the size of the boundary box
      boundingBox.setFromObject( object );
    } else {
      // if we maunally set the position of nodes in the graph, we need to adjust the camera in order to see those fixed nodes.
      const [ minV, maxV, containsFixedPoints ] = this.getMaxAndMinVectors()
      if (!containsFixedPoints) { 
        this.setState({ nodeSize: 1 })
        return 
      }
      boundingBox.set(minV, maxV);
    }
    
    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    const maxDim = Math.max( size.x, size.y, size.z );
    
    const fov = this.ggv.current.camera().fov * ( Math.PI / 180 );
    
    let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) )
    cameraZ *= offset;

    this.ggv.current.cameraPosition({ z: cameraZ })

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

    this.ggv.current.camera().far = cameraToFarEdge * 3;
    this.ggv.current.camera().updateProjectionMatrix();
    this.ggv.current.camera().lookAt( center )

    this.setState({ nodeSize: cameraZ / cameraSizeRatioToNodeSize })
  }

  render () {
    const { data, d2 = false, noForces = false, xGap = 20, yGap = 40, ...others } = this.props;
    
    const props = {
      ref: this.ggv,
      graphData: data,
      width: this.dimensions.width - xGap ,
      height: this.dimensions.height - yGap,
      ...others
    }
    
    if (d2) {
      return <ForceGraph2D {...props} />
    } else {
      return <ForceGraph3D {...props} />
    }
  }
}