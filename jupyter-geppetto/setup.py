import setuptools
from glob import glob
import fnmatch
import os

#This block copies resources to the server so we avoid jupyter nbextension install --py --sys-prefix jupyter_geppetto
data_files = []
data_files.append(('share/jupyter/nbextensions/jupyter_geppetto', glob('jupyter_geppetto/index.js')))

setuptools.setup(
    name="jupyter_geppetto",
    version="1.1.5",
    url="https://github.com/openworm/org.geppetto.frontend.jupyter",
    author="The Geppetto Development Team",
    author_email="info@geppetto.org",
    description="Geppetto extension for Jupyter notebook",
    license="MIT",
    long_description=open('README.rst').read(),
    packages=setuptools.find_packages(),
    data_files=data_files,
    include_package_data=True,
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Science/Research',
        'Topic :: Scientific/Engineering :: Visualization',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.7'
    ],
    install_requires=[
        'ipywidgets>=7.4.1',
        'jupyter>=1.0.0',
        'widgetsnbextension>=3.4.1',
        'pygeppetto>=0.8.0'
    ],
)
