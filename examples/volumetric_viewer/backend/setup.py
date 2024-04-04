# coding: utf-8

import sys
from setuptools import setup, find_packages

NAME = "volumetric_viewer"
VERSION = "1.0.0"

# To install the library, run the following
#
# python setup.py install
#
# prerequisite: setuptools
# http://pypi.python.org/pypi/setuptools

REQUIRES = [
    "connexion>=2.0.2",
    "swagger-ui-bundle>=0.0.2",
    "python_dateutil>=2.6.0"
]

setup(
    name=NAME,
    version=VERSION,
    description="volumetric_viewer",
    author_email="apiteam@swagger.io",
    url="",
    keywords=["OpenAPI", "volumetric_viewer"],
    install_requires=REQUIRES,
    packages=find_packages(),
    package_data={'': ['openapi/openapi.yaml']},
    include_package_data=True,
    entry_points={
        'console_scripts': ['volumetric_viewer=volumetric_viewer.__main__:main']},
    long_description="""\
    A simple rest api for a volumetric viewer
    """
)

