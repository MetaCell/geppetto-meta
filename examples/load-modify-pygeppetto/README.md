# Load Modify PyGeppetto

This example shows a way to load geppetto model from a backend, and how to perform some modifications on the model.
The repository has two different ways of modifying the model from the frontend:

* using immer on the frontend to translate them in commands that are decoded/executed by the backend. During the command execution in the backend, the backend tracks all the modifications that are performed on the model (including side-effects) and returns to the client a list of notifications explaining what are the modifications that have been applied to the model. The client then translate those notification in a immer patch that it applies on its local version of the model;
* using model from geppetto_core, that redefines a "mirror" of the model elements from the backend.


## Installation

To install the project, you need to have `yalc` installed as a global dependency (using `yarn global add yalc`).
You need to have all the geppetto.js library installed in yalc.
To do so, launch the `dev-install.sh` script from the `geppetto.js` folder.

```bash
# from the root of the repository
bash geppetto.js/dev-install.sh
```

Then, you can install the project simply running:

```bash
python dev-install.py
```

This script will install the necessary dependencies and will generate 4 scripts:

* `run-frontend.bash`, which can be used to run the frontend,
* `run-backend.bash`, which can be used to run the backend,
* `generate-binding.bash`, which can used to generate the openapi.json specification from the API code and the frontend typescript client for the API,
* `watch.bash`, which is a handy script that watches modifications on the API python code and retrigger a generation of the openapi.json specification as well as a generation of the frontend typescript client for the API.