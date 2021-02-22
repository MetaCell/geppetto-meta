import './jupyter_geppetto';
import './geppettoJupyter.less';


function load_extension() {
    if(IPython.notebook.kernel == null) {
        console.warn("Kernel not initialized. Waiting to load Jupyter Geppetto extension");
        setTimeout(load_extension, 100);
        return;
    }
    console.log("Jupyter Geppetto extension loading");
    // Hide the header
    $('#header').hide();

    // Add shortcut to hide/show header
    IPython.keyboard_manager.command_shortcuts.add_shortcut('ctrl-`', function (event) {
        if (IPython.notebook.mode == 'command') {
            $('#header').toggle();
            return false;
        }
        return true;
    });


    // Make Jupyter (aka IPython) available to Geppetto
    window.parent.IPython = IPython;

    // This loads the requirements into the notebook kernel
    // TODO import synchronization as jupyter_geppetto is deprecated
    IPython.notebook.kernel.execute('from jupyter_geppetto import synchronization, utils, synchronization as jupyter_geppetto');

    // This will allow the application to be aware that the notebook kernel is ready
    window.parent.GEPPETTO.trigger('jupyter_geppetto_extension_ready');

}

var load_ipython_extension = function () {
    if (IPython.notebook !== undefined && IPython.notebook._fully_loaded) {
        console.log("Kernel ready")
        load_extension();
    } else {
        console.log("Waiting for kernel to be ready")
        IPython.notebook.events.on("notebook_loaded.Notebook", function () {
            load_extension();
        })
    }
};

export {
    load_ipython_extension
};
