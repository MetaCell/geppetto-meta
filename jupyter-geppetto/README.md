<p align="center">
  <img src="https://github.com/tarelli/bucket/blob/master/geppetto%20logo.png?raw=true" alt="Geppetto logo"/>
</p>

# Geppetto Jupyter Notebook Extension
This is an experimental repo for a Jupyter notebook [extension](https://ipython.readthedocs.io/en/stable/config/extensions/). 
This extension enables the Jupyter Python server based 
on tornado that allows the client to establish a websocket connection and serve static resources.

Other than serving the application as a Geppetto backend, Jupyter Geppetto allows, by embedding a notebook in the page, 
to interact with the notebook and synchronize frontend features with the notebook.

## How to install

Before installing, it is recommended to activate a Python 3 virtual environment:
```bash
python3 -m venv jupyter-geppetto
source jupyter-geppetto/bin/activate
```

Or, with conda

```bash
conda create -n jupyter-geppetto python=3.7
conda activate jupyter-geppetto
```

Install with pip
```bash
pip install jupyter_geppetto
jupyter nbextension enable --py --sys-prefix jupyter_geppetto
```

Install extension from sources
```bash
git clone --recursive https://github.com/openworm/org.geppetto.frontend.jupyter.git
pip install .

jupyter nbextension install --py --symlink --sys-prefix jupyter_geppetto
jupyter nbextension enable --py --sys-prefix jupyter_geppetto
jupyter serverextension enable --py --sys-prefix jupyter_geppetto
```
## Overwrite the local install
```bash
pip install . --upgrade --no-deps --force-reinstall
```
Notice: old installs made without --sys-prefix (so )

## How to run
After the extension is installed the Jupyter notebook must be run with the parameter --library, which specifies the 
Python libraries to be loaded together with the extension:
```bash
exec jupyter notebook --NotebookApp.default_url=/geppetto --NotebookApp.token='' --library=my_geppetto_application_lib
```

To connect go to the URL:
http://localhost:8888/geppetto
assuming the default Jupyter configuration, otherwise change the port accordingly.

Note if you get a 404 and you have a custom configuration of Jupyter notebook you will have to add the following to your jupyter_notebook_config.py:
```
c.NotebookApp.nbserver_extensions = {'jupyter_geppetto':True}
```


# Development 

Jupyter Geppetto serves In order to use the synchronization capability, 

## Geppetto websocket api
Jupyter Geppetto implements the websocket api through a Tornado handler. It supports the messages coming from
a [geppetto-application](https://github.com/openworm/geppetto-application) frontend. See 
[geppetto-client](https://github.com/openworm/geppetto-client) for the available messages and implementation.

Currently, only a subset of the messages is supported. For further information, see the current release of 
[pygeppetto](https://github.com/openworm/pygeppetto).

## Web api
Allows to add own custom routes and handlers from inside the application.
The dependencies must be added from within the libraries specified in the parameter --library

In the file root of your module (__init__.py of your package), call the RouteManager methods to add your custom routes:
```python
from jupyter_geppetto.webapi import RouteManager

RouteManager.add_controller(MyController) # Add a controller (preferred way for http requests)
RouteManager.add_route('/my/path', MyTornadoHandler) # for more custom control
```

A controller class is a standard class with webapi annotations on methods.
Methods return the response as a string.
The RouteManager creates a handler for each method and binds the method with the handler.

Example:
```Python
from jupyter_geppetto.webapi import get, post

class MyController:

    @get('/my/simple/path')
    def simple_action(handler):
        return "My response payload" # Simple text response

    @get('/myresource/(.*)')
    def action_with_url_param(handler, param):
        import json
        return json.dumps({'param':param}) # JSON response
    
    @get('/myresource')
    def action_with_query_string_params(handler, param1, param2=None):
        '''Handles 
            /myresource?param1=something&param2=somethingelse
            /myresource?param1=something
        '''
        return ...   
    
    @get('/myresource1')
    def alt_action_with_query_string_params(handler, **kwargs):
        '''Handles any query string parameter'''
        return ...   
        
    @get('/myresource1/(.*)')
    def action_with_url_and_query_string_params(handler, param, param1, param2):
        '''Handles /myresource?param1=comething&param2=somethingelse'''
        return ... 
        
    @post('/myresource2')
    def simple_post_action(handler, payload, param1, param2):
        '''Handles /myresource and body param1=something&param2=somethingelse'''
        return ... 
        
    @get('/myresource3', {'Content-type': 'image/png', 'Cache-Control': 'max-age=600'})
    def get_action_with_headers(handler):
        '''Sets headers'''
        return ... 
        
    @get('/myresource3')
    def get_action_use_handler(handler):
        '''The first parameter is the tornado handler'''
        handler.write('Whatever')
        return ... 
```

## Iframe embedding
In the frontend, it is required to embed an iframe with a jupyter notebook.

Example
```javascript
import PythonConsole from 'geppetto-client/js/components/interface/pythonConsole/PythonConsole';

// Inside your React component render:
<PythonConsole key="console" pythonNotebookPath="notebooks/notebook.ipynb" />
```

## Synchronization
This feature allows to synchronize backend and frontend objects. In order to use synchronization, it is required to have
the iframe embed enabled and initialized.
It's implemented through a [IPython/Jupyter widget](https://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Basics.html).
On the JS side, the connection is achieved through the PythonControlledCapability of the [Geppetto client](https://github.com/openworm/geppetto-client/).

 
Usage
```python
from jupyter_geppetto import synchronization
class MyClass:
    def a(self):
        ...
    def b(self):
        ...
synchronization.startSynchronization(MyClass().__dict__)

```

## Deployment
An application based on Jupyter Geppetto can be deployed as a standard jupyter notebook application.
It is recommended a dockerized setup with JupyterHub (e.g. on Kubernetes).

