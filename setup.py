#!/usr/bin/env python

from setuptools import setup, find_packages

__version__ = "0.8.1"

required_packages = [
    'pyecore>=0.11.5',
    'multimethod',
    'deprecated',
    'airspeed',
    'requests>=2.0.0'
]


setup(
    name="pygeppetto",
    version=__version__,
    description=("Geppetto Python API for creating a Geppetto Model from Python"),
    author="The Geppetto Development Team",
    author_email="info@geppetto.org",
    license="MIT",
    long_description=open('README.rst').read(),
    keywords="geppetto openworm Python",
    url="https://github.com/openworm/pygeppetto",
    packages=find_packages(),
    package_data={'': ['README.md']},
    include_package_data=True,
    install_requires=required_packages,
    extras_require={'testing': ['pytest', 'responses']},
    classifiers=[
        "Programming Language :: Python",
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        "Operating System :: OS Independent",
        "Intended Audience :: Developers",
        "Topic :: Software Development",
        "Topic :: Software Development :: Libraries"
    ]
)
