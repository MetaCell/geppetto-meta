# How to manually update pygeppetto version on pypi

If a new version of pygeppetto needs to be deployed on pypi, you need to have some tools installed in the first place, as well as a special token to perform the actual upload.

## Prerequiste

A set of tools and libraries are mandatory to create a new version locally and upload it: `build` which is a package that will create the wheel and the sdist package, and `twine` that will be used to upload the produced packages to pypi. Both of them are packaged deployed on pypi, so you can install them this way:

```bash
pip install twine build
```

### Configuring twine

The configuration file for twine is located in `~/.pypirc` and here is a simple example of configuration to be able to push in pypi:

```
[pypi]
  username = __token__
  password = # here the token for pygeppetto should be set. Please contact the maintainer of the package to get access to it (if it's not you and that you have clearance to access it)
```

There is other ways of configuring twine to enable various repository and various users. This configuration considers that we are only having a single user that and the single package/repository to deal with.

## Process

The update process is quite simple:

1. update the dependencies version in `requirement.txt` (if required);
2. update the version of pygeppetto in `setup.py`. The version number follows semantic versioning;
3. clear the `dist/` folder (either remove it or remove its content);
4. build the packages using `python -m build --sdist --wheel`;
5. check that all is good before uploading using `twine check dist/*`;
6. perform the actual upload using `twine upload dist/*`

If all is going well, the new version will be uploaded on pypi and accessible directly.