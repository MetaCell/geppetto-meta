define(function (require) {
  var React = require('react');
  var CreateClass = require('create-react-class');
  var GEPPETTO = require('geppetto');

  require('./LoadingSpinner.less');

  return CreateClass({
    mixins: [require('../../controls/mixins/bootstrap/modal.js')],
    timer1:null,
    timer2:null,
    visible: false,
    
    getInitialState: function () {
      return {
        text :'Loading...',
        logo :'gpt-gpt_logo'
      };
    },
    
    setLogo:function (logo){
      this.setState({ logo:logo });
    },

    hideSpinner:function (){
      if (this.visible){
        if (this.timer1 != null){
          clearTimeout(this.timer1);
          clearTimeout(this.timer2);
        }

        this.visible = false;
        this.hide();
      }
    },
    
    showSpinner:function (label){
      var that = this;

      this.visible = true;
      this.setState({ text:label });
      this.show();
      
      if (this.timer1 != null){
        clearTimeout(this.timer1);
        clearTimeout(this.timer2);
      }
      
      this.timer1 = setTimeout((function (){
        that.setState({ text:'Loading is taking longer than usual, either a large amount of data is being loaded or bandwidth is limited' });
      }).bind(this), 20000);
      
      this.timer2 = setTimeout((function (){
        that.setState({ text:GEPPETTO.Resources.SPOTLIGHT_HINT });
      }).bind(this), 5000);
    },

    UNSAFE_componentWillReceiveProps: function (nextProps) {
      if (this.props.spinnerVisible !== nextProps.spinnerVisible) {
        if (nextProps.spinnerVisible) {
          this.showSpinner(nextProps.spinnerMessage);
        } else {
          setTimeout(this.hideSpinner, 500);
        }
      }
    },

    componentDidMount: function (){
      GEPPETTO.Spinner = this;

      GEPPETTO.StoreManager.eventsCallback[GEPPETTO.StoreManager.clientActions.SHOW_SPINNER].list.push(action => {
        this.showSpinner(action.data.message);
      });

      GEPPETTO.StoreManager.eventsCallback[GEPPETTO.StoreManager.clientActions.HIDE_SPINNER].list.push(action => {
        setTimeout(this.hideSpinner, 500);
      });
    },

    render: function () {
      if (this.visible){
        return (
          <div className="modal fade" id="loading-spinner">
            <div className="spinner-backdrop">
              <div className="spinner-container">
                <div className={this.state.logo + " fa-spin"}></div>
                <p id="loadingmodaltext" className="orange">{this.state.text}</p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    }
            
  });
});
