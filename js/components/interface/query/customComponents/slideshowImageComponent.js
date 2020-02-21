define(function (require) {

  require("../query.less");
  require("../react-simpletabs.less");

  var React = require('react');
  var GEPPETTO = require('geppetto');
  var slick = require('slick-carousel');

  class SlideshowImageComponent extends React.Component {
    constructor (props) {
      super(props);

      let initialCheckBoxState = false;
      try {
        let imageVariable = eval(this.props.rowData.id);
        if (imageVariable !== undefined) {
          initialCheckBoxState = imageVariable.isVisible();
        }
      } catch (e) { }

      this.state = { carouselFullyLoaded: false, checked: initialCheckBoxState, imageMeshLoading: false };

      this.isCarousel = false;
      this.imageContainerId = '';
      this.fullyLoaded = false;

      this.checkboxAction = this.checkboxAction.bind(this);
      this.fireImageAction = this.fireImageAction.bind(this);
    }

    getImageClickAction (path) {
      var that = this;

      var action = function (e) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();

        if (!that.state.imageMeshLoading) {
          var actionStr = that.props.metadata.actions;
          actionStr = actionStr.replace(/\$entity\$/gi, path);
          that.setState ( { checked : true , imageMeshLoading : true } ); 
          GEPPETTO.CommandController.execute(actionStr);
        }
      };

      return action;
    }

    deletedInstance (instance) {
      if (instance.startsWith(this.props.rowData.id)) {
        this.setState({ imageMeshLoading: false })
      }
    }

    addedInstance (instances) {
      if (instances.length > 0) {
        if (instances[0].getInstancePath().startsWith(this.props.rowData.id)) {
          this.setState({ imageMeshLoading: false })
        }
      }
    }

    componentDidMount () {
      var that = this;

      // apply carousel
      if (this.isCarousel) {
        var slickDivElement = $('#' + this.imageContainerId + '.slickdiv');
        slickDivElement.slick();

        // reload slick carousel if it's first time clicking on arrow in any direction
        slickDivElement.find(".slick-arrow").on("click", function () {
          if (!that.fullyLoaded) {
            that.setState({ carouselFullyLoaded: true });
            that.fullyLoaded = true;
          }
        }, { passive: true });
      }

      GEPPETTO.on(GEPPETTO.Events.Instance_deleted, this.deletedInstance, this);
      GEPPETTO.on(GEPPETTO.Events.Instances_created, this.addedInstance, this);
    }

    componentWillUnmount () {
      GEPPETTO.off(GEPPETTO.Events.Instance_deleted, this.deletedInstance, this);
      GEPPETTO.off(GEPPETTO.Events.Instances_created, this.addedInstance, this);
    }

    componentDidUpdate () {
      // on component refresh, update slick carousel
      $('#' + this.imageContainerId + '.slickdiv').slick('unslick').slick();
    }

    fireImageAction (path) {
      if (!this.state.imageMeshLoading) {
        var actionStr = this.props.metadata.actions;
        actionStr = actionStr.replace(/\$entity\$/gi, path);
        GEPPETTO.CommandController.execute(actionStr);
      }
    }

    checkboxAction (event, path) {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({ checked: value, imageMeshLoading: true });

      try {
        let imageVariable = eval(path);
        if (imageVariable !== undefined) {
          if (imageVariable.isVisible()) {
            imageVariable.delete();
          } else {
            imageVariable.show();
          }
        } else {
          this.fireImageAction(path);
        }
      } catch (e) {
        this.fireImageAction(path);
      }
    }

    buildImage (thumbImage, imageContainerId) {
      var action = this.getImageClickAction(thumbImage.reference);
      const imgElement = <div id={imageContainerId} className="query-results-image collapse in">
        <a href='' onClick={action}>
          <img className="query-results-image invert" src={thumbImage.data} />
        </a>
        {this.state.imageMeshLoading
          ? (<div id={imageContainerId + "-loader"} className="loader"></div>)
          : (<input id={imageContainerId + "-checkbox"} className="query-results-checkbox" type="checkbox"
            onChange={event => this.checkboxAction(event, thumbImage.reference)} checked={this.state.checked} />)
        }
      </div>
      return imgElement;
    }

    buildCarousel () {
      var jsonImageVariable = JSON.parse(this.props.data);
      var imgElement = "";

      if (jsonImageVariable.initialValues[0] != undefined) {
        var imageContainerId = this.props.rowData.id + '-image-container';
        this.imageContainerId = imageContainerId;

        var value = jsonImageVariable.initialValues[0].value;
        if (value.eClass == GEPPETTO.Resources.ARRAY_VALUE) {
          if (value.elements.length > 1) {
            this.isCarousel = true;
            var imagesToLoad = 2;
            if (this.state.carouselFullyLoaded) {
              imagesToLoad = value.elements.length;
            }

            // set flag to fully loaded if total length of images to render is less or equal to 2
            if (value.elements.length <= 2) {
              this.fullyLoaded = true;
            }

            var that = this;
            // if it's an array, create a carousel (relies on slick)
            var elements = value.elements.map(function (item, key) {
              if (key < imagesToLoad) {
                var image = item.initialValue;
                var action = that.getImageClickAction(image.reference);
                return <div key={key} className="query-results-slick-image"> {image.name}
                  <a href='' onClick={action}>
                    <img className="popup-image invert" src={image.data} />
                  </a>
                  {that.state.imageMeshLoading
                    ? (<div id={image.reference + "-loader"} className="loader"></div>)
                    : (<input id={image.reference + "-checkbox"} className="query-results-checkbox" type="checkbox"
                      onChange={event => that.checkboxAction(event, value.reference)} checked={that.state.checked} />)
                  }
                </div>
              }
            });

            elements = elements.slice(0, imagesToLoad);

            imgElement = <div id={imageContainerId} className="slickdiv query-results-slick collapse in"
              data-slick={JSON.stringify({ fade: true, centerMode: true, slidesToShow: 1, slidesToScroll: 1 })}>
              {elements}
            </div>
          } else {
            imgElement = this.buildImage(value.elements[0].initialValue, imageContainerId, this.props.rowData.id);
          }
        } else if (value.eClass == GEPPETTO.Resources.IMAGE) {
          // otherwise we just show an image
          imgElement = this.buildImage(value, imageContainerId, this.props.rowData.id);
        }
      }

      return imgElement;
    }


    render () {
      var imgElement = "";
      if (this.props.data != "" && this.props.data != undefined) {
        imgElement = this.buildCarousel();
      }

      return (
        <div>
          {imgElement}
        </div>
      )
    }
  }

  return SlideshowImageComponent;
});
