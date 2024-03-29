const model = {
  "eClass": "GeppettoModel",
  "name": "NWB File",
  "variables": [
    {
      "eClass": "Variable",
      "name": "nwbfile",
      "synched": false,
      "types": [
        {
          "eClass": "CompositeType",
          "$ref": "//@libraries.1/@types.1"
        }
      ],
      "id": "nwbfile"
    }
  ],
  "libraries": [
    {
      "eClass": "GeppettoLibrary",
      "id": "common",
      "name": "Geppetto Common Library",
      "types": [
        {
          "eClass": "ParameterType",
          "id": "Parameter",
          "name": "Parameter"
        },
        {
          "eClass": "DynamicsType",
          "id": "Dynamics",
          "name": "Dynamics"
        },
        {
          "eClass": "StateVariableType",
          "id": "StateVariable",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.4"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.7"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.5"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.6"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.5"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.6"
            }
          ],
          "name": "State Variable"
        },
        {
          "eClass": "HTMLType",
          "id": "HTML",
          "name": "HTML"
        },
        {
          "eClass": "URLType",
          "id": "URL",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.20"
            }
          ],
          "name": "URL"
        },
        {
          "eClass": "TextType",
          "id": "Text",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.3"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.5"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.6"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.8"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.3/@variables.9"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.3"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.4"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.7"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.4/@variables.8"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.3"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.4"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.7"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.5/@variables.8"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.14/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.14/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.13"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.14"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.21/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.3"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.4"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.5"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.24/@variables.6"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.18"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.19"
            }
          ],
          "name": "Text"
        },
        {
          "eClass": "PointType",
          "id": "Point",
          "name": "Point"
        },
        {
          "eClass": "ExpressionType",
          "id": "Expression",
          "name": "Expression"
        },
        {
          "eClass": "VisualType",
          "id": "Visual",
          "name": "Visual"
        },
        {
          "eClass": "PointerType",
          "id": "Pointer",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.14/@variables.2"
            }
          ],
          "name": "Pointer"
        },
        {
          "eClass": "ImageType",
          "id": "Image",
          "name": "Image"
        },
        {
          "eClass": "ConnectionType",
          "id": "connection",
          "name": "Connection"
        },
        {
          "eClass": "VisualType",
          "id": "particles",
          "name": "Particles"
        },
        {
          "eClass": "JSONType",
          "id": "JSON",
          "name": "JSON"
        },
        {
          "eClass": "SimpleArrayType",
          "id": "simplearray",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.21/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.0"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.1"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.2"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.3"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.4"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.5"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.6"
            },
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.23/@variables.7"
            }
          ],
          "name": "Simple Array"
        },
        {
          "eClass": "MetadataType",
          "id": "metadata",
          "name": "Metadata"
        }
      ]
    },
    {
      "eClass": "GeppettoLibrary",
      "name": "nwbfile",
      "synched": false,
      "id": "nwbfile",
      "types": [
        {
          "eClass": "ImportType",
          "referencedVariables": [],
          "name": "nwbfile",
          "id": "nwbfile",
          "autoresolve": true,
          "url": "webapp/nwb_files_cache/time_series_data.nwb"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@variables.0"
            }
          ],
          "name": "nwbfile",
          "variables": [
            {
              "eClass": "Variable",
              "name": "acquisition",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.2"
                }
              ],
              "id": "acquisition"
            },
            {
              "eClass": "Variable",
              "name": "analysis",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.6"
                }
              ],
              "id": "analysis"
            },
            {
              "eClass": "Variable",
              "name": "scratch",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.7"
                }
              ],
              "id": "scratch"
            },
            {
              "eClass": "Variable",
              "name": "stimulus",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.8"
                }
              ],
              "id": "stimulus"
            },
            {
              "eClass": "Variable",
              "name": "stimulus_template",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.9"
                }
              ],
              "id": "stimulus_template"
            },
            {
              "eClass": "Variable",
              "name": "processing",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.10"
                }
              ],
              "id": "processing"
            },
            {
              "eClass": "Variable",
              "name": "devices",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.11"
                }
              ],
              "id": "devices"
            },
            {
              "eClass": "Variable",
              "name": "electrode_groups",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.13"
                }
              ],
              "id": "electrode_groups"
            },
            {
              "eClass": "Variable",
              "name": "imaging_planes",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.15"
                }
              ],
              "id": "imaging_planes"
            },
            {
              "eClass": "Variable",
              "name": "ic_electrodes",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.16"
                }
              ],
              "id": "ic_electrodes"
            },
            {
              "eClass": "Variable",
              "name": "ogen_sites",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.17"
                }
              ],
              "id": "ogen_sites"
            },
            {
              "eClass": "Variable",
              "name": "intervals",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.18"
                }
              ],
              "id": "intervals"
            },
            {
              "eClass": "Variable",
              "name": "lab_meta_data",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.19"
                }
              ],
              "id": "lab_meta_data"
            },
            {
              "eClass": "Variable",
              "name": "session_description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Home."
                  }
                }
              ],
              "id": "session_description"
            },
            {
              "eClass": "Variable",
              "name": "identifier",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "SF-238."
                  }
                }
              ],
              "id": "identifier"
            },
            {
              "eClass": "Variable",
              "name": "file_create_date",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.20"
                }
              ],
              "id": "file_create_date"
            },
            {
              "eClass": "Variable",
              "name": "electrodes",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.21"
                }
              ],
              "id": "electrodes"
            },
            {
              "eClass": "Variable",
              "name": "subject",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.24"
                }
              ],
              "id": "subject"
            },
            {
              "eClass": "Variable",
              "name": "stimulus_notes",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "No sttimulus."
                  }
                }
              ],
              "id": "stimulus_notes"
            },
            {
              "eClass": "Variable",
              "name": "Num. of acquisitions",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "3"
                  }
                }
              ],
              "id": "Num. of acquisitions"
            },
            {
              "eClass": "Variable",
              "name": "source file",
              "types": [
                {
                  "eClass": "URLType",
                  "$ref": "//@libraries.0/@types.4"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "URLType",
                    "$ref": "//@libraries.0/@types.4"
                  },
                  "value": {
                    "eClass": "URL",
                    "url": "https://github.com/OpenSourceBrain/NWBShowcase/raw/master/NWB/time_series_data.nwb"
                  }
                }
              ],
              "id": "source file"
            }
          ],
          "abstract": false,
          "id": "nwbfile"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.0"
            }
          ],
          "name": "LabelledDict",
          "variables": [
            {
              "eClass": "Variable",
              "name": "test_image_series",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.3"
                }
              ],
              "id": "test_image_series"
            },
            {
              "eClass": "Variable",
              "name": "test_sine_1",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.4"
                }
              ],
              "id": "test_sine_1"
            },
            {
              "eClass": "Variable",
              "name": "test_sine_2",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.5"
                }
              ],
              "id": "test_sine_2"
            }
          ],
          "abstract": false,
          "id": "acquisition"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.2/@variables.0"
            }
          ],
          "name": "ImageSeries",
          "variables": [
            {
              "eClass": "Variable",
              "name": "resolution",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "-1.0"
                  }
                }
              ],
              "id": "resolution"
            },
            {
              "eClass": "Variable",
              "name": "comments",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "no comments"
                  }
                }
              ],
              "id": "comments"
            },
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Series of images from a simulation of the cerebellum via neuroConstruct"
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "conversion",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1.0"
                  }
                }
              ],
              "id": "conversion"
            },
            {
              "eClass": "Variable",
              "name": "timestamps",
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "TimeSeries",
                    "value": [
                      0,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10,
                      11,
                      12,
                      13,
                      14,
                      15,
                      16,
                      17,
                      18,
                      19,
                      20,
                      21,
                      22,
                      23,
                      24,
                      25,
                      26,
                      27,
                      28,
                      29,
                      30,
                      31,
                      32,
                      33,
                      34,
                      35,
                      36,
                      37,
                      38,
                      39,
                      40,
                      41,
                      42,
                      43,
                      44,
                      45,
                      46,
                      47,
                      48,
                      49,
                      50,
                      51,
                      52,
                      53,
                      54,
                      55,
                      56,
                      57,
                      58,
                      59,
                      60,
                      61,
                      62,
                      63,
                      64,
                      65,
                      66,
                      67,
                      68,
                      69,
                      70,
                      71,
                      72,
                      73,
                      74,
                      75,
                      76,
                      77,
                      78,
                      79,
                      80,
                      81,
                      82,
                      83,
                      84,
                      85,
                      86,
                      87,
                      88,
                      89,
                      90,
                      91,
                      92,
                      93,
                      94,
                      95,
                      96,
                      97,
                      98,
                      99
                    ],
                    "unit": {
                      "eClass": "Unit",
                      "unit": "s"
                    }
                  }
                }
              ],
              "id": "timestamps",
              "synched": false,
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ]
            },
            {
              "eClass": "Variable",
              "name": "timestamps_unit",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "seconds"
                  }
                }
              ],
              "id": "timestamps_unit"
            },
            {
              "eClass": "Variable",
              "name": "interval",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1"
                  }
                }
              ],
              "id": "interval"
            },
            {
              "eClass": "Variable",
              "name": "external_file",
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "ImportValue"
                  }
                }
              ],
              "id": "external_file"
            },
            {
              "eClass": "Variable",
              "name": "format",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "external"
                  }
                }
              ],
              "id": "format"
            },
            {
              "eClass": "Variable",
              "name": "num_samples",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "82"
                  }
                }
              ],
              "id": "num_samples"
            }
          ],
          "abstract": false,
          "id": "test_image_series"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.2/@variables.1"
            }
          ],
          "name": "TimeSeries",
          "variables": [
            {
              "eClass": "Variable",
              "name": "resolution",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "0.0"
                  }
                }
              ],
              "id": "resolution"
            },
            {
              "eClass": "Variable",
              "name": "comments",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Human-readable comments about this TimeSeries dataset."
                  }
                }
              ],
              "id": "comments"
            },
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Description of this TimeSeries dataset."
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "conversion",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1.0"
                  }
                }
              ],
              "id": "conversion"
            },
            {
              "eClass": "Variable",
              "name": "unit",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "mV"
                  }
                }
              ],
              "id": "unit"
            },
            {
              "eClass": "Variable",
              "name": "data",
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "TimeSeries",
                    "value": [
                      0,
                      0.24740395925452294,
                      0.479425538604203,
                      0.6816387600233342,
                      0.8414709848078965,
                      0.9489846193555862,
                      0.9974949866040544,
                      0.9839859468739369,
                      0.9092974268256817,
                      0.7780731968879213,
                      0.5984721441039564,
                      0.38166099205233167,
                      0.1411200080598672,
                      -0.10819513453010837,
                      -0.35078322768961984,
                      -0.5715613187423438,
                      -0.7568024953079282,
                      -0.8949893582285835,
                      -0.977530117665097,
                      -0.999292788975378,
                      -0.9589242746631385,
                      -0.8589344934265921,
                      -0.7055403255703919,
                      -0.5082790774992583,
                      -0.27941549819892586,
                      -0.03317921654755682,
                      0.21511998808781552,
                      0.4500440737806176,
                      0.6569865987187891,
                      0.8230808790115054,
                      0.9379999767747389,
                      0.9945987791111761,
                      0.9893582466233818,
                      0.9226042102393402,
                      0.7984871126234903,
                      0.6247239537541924,
                      0.4121184852417566,
                      0.17388948538043356,
                      -0.07515112046180931,
                      -0.3195191936222736,
                      -0.5440211108893699,
                      -0.7346984304047954,
                      -0.87969575997167,
                      -0.9699978679206785,
                      -0.9999902065507035,
                      -0.9678079975112615,
                      -0.8754521746884285,
                      -0.72866497582717,
                      -0.5365729180004349,
                      -0.3111193549811273,
                      -0.06632189735120068,
                      0.182599134631134,
                      0.4201670368266409,
                      0.6316109877182386,
                      0.803784426551621,
                      0.9259824428086272,
                      0.9906073556948704,
                      0.9936411011327626,
                      0.934895055524683,
                      0.8180217634546941,
                      0.6502878401571169,
                      0.4421221685765394,
                      0.2064674819377966,
                      -0.04202435271884079,
                      -0.2879033166650653,
                      -0.5158818468181092,
                      -0.7117853423691232,
                      -0.8634334728079056,
                      -0.9613974918795568,
                      -0.9995864713592172,
                      -0.9756260054681576,
                      -0.8910058399248534,
                      -0.750987246771676,
                      -0.5642759039618552,
                      -0.34248061846961253,
                      -0.09939154689884817,
                      0.14987720966295234,
                      0.3898273272463786,
                      0.6055398697196009,
                      0.7836028759783553,
                      0.9129452507276277,
                      0.9855251115651197,
                      0.9968297942787993,
                      0.9461564284508708,
                      0.836655638536056,
                      0.675135653292801,
                      0.47163900309419615,
                      0.23881812402958275,
                      -0.008851309290403876,
                      -0.25597041106933305,
                      -0.4871745124605095,
                      -0.6880884622582969,
                      -0.8462204041751706,
                      -0.9517384599623535,
                      -0.9980820279793963,
                      -0.9823696896284233,
                      -0.9055783620066239,
                      -0.7724825579327704,
                      -0.5913575298651244,
                      -0.3734647547841147
                    ],
                    "unit": {
                      "eClass": "Unit",
                      "unit": "mV"
                    }
                  }
                }
              ],
              "id": "data",
              "synched": false,
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ]
            },
            {
              "eClass": "Variable",
              "name": "timestamps",
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "TimeSeries",
                    "value": [
                      0,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10,
                      11,
                      12,
                      13,
                      14,
                      15,
                      16,
                      17,
                      18,
                      19,
                      20,
                      21,
                      22,
                      23,
                      24,
                      25,
                      26,
                      27,
                      28,
                      29,
                      30,
                      31,
                      32,
                      33,
                      34,
                      35,
                      36,
                      37,
                      38,
                      39,
                      40,
                      41,
                      42,
                      43,
                      44,
                      45,
                      46,
                      47,
                      48,
                      49,
                      50,
                      51,
                      52,
                      53,
                      54,
                      55,
                      56,
                      57,
                      58,
                      59,
                      60,
                      61,
                      62,
                      63,
                      64,
                      65,
                      66,
                      67,
                      68,
                      69,
                      70,
                      71,
                      72,
                      73,
                      74,
                      75,
                      76,
                      77,
                      78,
                      79,
                      80,
                      81,
                      82,
                      83,
                      84,
                      85,
                      86,
                      87,
                      88,
                      89,
                      90,
                      91,
                      92,
                      93,
                      94,
                      95,
                      96,
                      97,
                      98,
                      99
                    ],
                    "unit": {
                      "eClass": "Unit",
                      "unit": "s"
                    }
                  }
                }
              ],
              "id": "timestamps",
              "synched": false,
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ]
            },
            {
              "eClass": "Variable",
              "name": "timestamps_unit",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "seconds"
                  }
                }
              ],
              "id": "timestamps_unit"
            },
            {
              "eClass": "Variable",
              "name": "interval",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1"
                  }
                }
              ],
              "id": "interval"
            }
          ],
          "abstract": false,
          "id": "test_sine_1"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.2/@variables.2"
            }
          ],
          "name": "TimeSeries",
          "variables": [
            {
              "eClass": "Variable",
              "name": "resolution",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "0.0"
                  }
                }
              ],
              "id": "resolution"
            },
            {
              "eClass": "Variable",
              "name": "comments",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Another human-readable comments about this TimeSeries dataset."
                  }
                }
              ],
              "id": "comments"
            },
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Another description of this TimeSeries dataset."
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "conversion",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1.0"
                  }
                }
              ],
              "id": "conversion"
            },
            {
              "eClass": "Variable",
              "name": "unit",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "pA"
                  }
                }
              ],
              "id": "unit"
            },
            {
              "eClass": "Variable",
              "name": "data",
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "ImportValue"
                  }
                }
              ],
              "id": "data"
            },
            {
              "eClass": "Variable",
              "name": "timestamps",
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "StateVariableType",
                    "$ref": "//@libraries.0/@types.2"
                  },
                  "value": {
                    "eClass": "TimeSeries",
                    "value": [
                      0,
                      1,
                      2,
                      3,
                      4,
                      5,
                      6,
                      7,
                      8,
                      9,
                      10,
                      11,
                      12,
                      13,
                      14,
                      15,
                      16,
                      17,
                      18,
                      19,
                      20,
                      21,
                      22,
                      23,
                      24,
                      25,
                      26,
                      27,
                      28,
                      29,
                      30,
                      31,
                      32,
                      33,
                      34,
                      35,
                      36,
                      37,
                      38,
                      39,
                      40,
                      41,
                      42,
                      43,
                      44,
                      45,
                      46,
                      47,
                      48,
                      49,
                      50,
                      51,
                      52,
                      53,
                      54,
                      55,
                      56,
                      57,
                      58,
                      59,
                      60,
                      61,
                      62,
                      63,
                      64,
                      65,
                      66,
                      67,
                      68,
                      69,
                      70,
                      71,
                      72,
                      73,
                      74,
                      75,
                      76,
                      77,
                      78,
                      79,
                      80,
                      81,
                      82,
                      83,
                      84,
                      85,
                      86,
                      87,
                      88,
                      89,
                      90,
                      91,
                      92,
                      93,
                      94,
                      95,
                      96,
                      97,
                      98,
                      99
                    ],
                    "unit": {
                      "eClass": "Unit",
                      "unit": "s"
                    }
                  }
                }
              ],
              "id": "timestamps",
              "synched": false,
              "types": [
                {
                  "eClass": "StateVariableType",
                  "$ref": "//@libraries.0/@types.2"
                }
              ]
            },
            {
              "eClass": "Variable",
              "name": "timestamps_unit",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "seconds"
                  }
                }
              ],
              "id": "timestamps_unit"
            },
            {
              "eClass": "Variable",
              "name": "interval",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "1"
                  }
                }
              ],
              "id": "interval"
            }
          ],
          "abstract": false,
          "id": "test_sine_2"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.1"
            }
          ],
          "id": "analysis"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.2"
            }
          ],
          "id": "scratch"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.3"
            }
          ],
          "id": "stimulus"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.4"
            }
          ],
          "id": "stimulus_template"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.5"
            }
          ],
          "id": "processing"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.6"
            }
          ],
          "name": "LabelledDict",
          "variables": [
            {
              "eClass": "Variable",
              "name": "Tetrode",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.12"
                }
              ],
              "id": "Tetrode"
            }
          ],
          "abstract": false,
          "id": "devices"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "Device",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.11/@variables.0"
            }
          ],
          "id": "Tetrode"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.7"
            }
          ],
          "name": "LabelledDict",
          "variables": [
            {
              "eClass": "Variable",
              "name": "Tetrode",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.14"
                }
              ],
              "id": "Tetrode"
            }
          ],
          "abstract": false,
          "id": "electrode_groups"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.13/@variables.0"
            }
          ],
          "name": "ElectrodeGroup",
          "variables": [
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Tetrode group"
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "location",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "CA1"
                  }
                }
              ],
              "id": "location"
            },
            {
              "eClass": "Variable",
              "name": "device",
              "types": [
                {
                  "eClass": "PointerType",
                  "$ref": "//@libraries.0/@types.9"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "PointerType",
                    "$ref": "//@libraries.0/@types.9"
                  },
                  "value": {
                    "eClass": "Pointer",
                    "path": "Tetrode(Tetrode)",
                    "elements": [
                      {
                        "eClass": "PointerElement",
                        "index": null,
                        "variable": {
                          "eClass": "Variable",
                          "$ref": "//@libraries.1/@types.11/@variables.0"
                        },
                        "type": {
                          "eClass": "CompositeType",
                          "$ref": "//@libraries.1/@types.12"
                        }
                      }
                    ]
                  }
                }
              ],
              "id": "device"
            }
          ],
          "abstract": false,
          "id": "Tetrode1"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.8"
            }
          ],
          "id": "imaging_planes"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.9"
            }
          ],
          "id": "ic_electrodes"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.10"
            }
          ],
          "id": "ogen_sites"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.11"
            }
          ],
          "id": "intervals"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "LabelledDict",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.12"
            }
          ],
          "id": "lab_meta_data"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "CompositeList",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.15"
            }
          ],
          "id": "CompositeList"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.16"
            }
          ],
          "name": "DynamicTable",
          "variables": [
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "metadata about extracellular electrodes"
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "id",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.22"
                }
              ],
              "id": "id"
            },
            {
              "eClass": "Variable",
              "name": "colnames",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "StringArray",
                    "elements": [
                      "x",
                      "y",
                      "z",
                      "imp",
                      "location",
                      "filtering",
                      "group",
                      "group_name"
                    ]
                  }
                }
              ],
              "id": "colnames"
            },
            {
              "eClass": "Variable",
              "name": "columns",
              "types": [
                {
                  "eClass": "CompositeType",
                  "$ref": "//@libraries.1/@types.23"
                }
              ],
              "id": "columns"
            }
          ],
          "abstract": false,
          "id": "electrodes"
        },
        {
          "eClass": "CompositeType",
          "abstract": false,
          "name": "ElementIdentifiers",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.21/@variables.1"
            }
          ],
          "id": "id"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.21/@variables.3"
            }
          ],
          "name": "CompositeList",
          "variables": [
            {
              "eClass": "Variable",
              "name": "x",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "1.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "1.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "1.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "1.0"
                      }
                    ]
                  }
                }
              ],
              "id": "x"
            },
            {
              "eClass": "Variable",
              "name": "y",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "2.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "2.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "2.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "2.0"
                      }
                    ]
                  }
                }
              ],
              "id": "y"
            },
            {
              "eClass": "Variable",
              "name": "z",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "3.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "3.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "3.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "3.0"
                      }
                    ]
                  }
                }
              ],
              "id": "z"
            },
            {
              "eClass": "Variable",
              "name": "imp",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "-1.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "-2.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "-3.0"
                      },
                      {
                        "eClass": "Text",
                        "text": "-4.0"
                      }
                    ]
                  }
                }
              ],
              "id": "imp"
            },
            {
              "eClass": "Variable",
              "name": "location",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "CA1"
                      },
                      {
                        "eClass": "Text",
                        "text": "CA1"
                      },
                      {
                        "eClass": "Text",
                        "text": "CA1"
                      },
                      {
                        "eClass": "Text",
                        "text": "CA1"
                      }
                    ]
                  }
                }
              ],
              "id": "location"
            },
            {
              "eClass": "Variable",
              "name": "filtering",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "Description of hardware filtering."
                      },
                      {
                        "eClass": "Text",
                        "text": "Description of hardware filtering."
                      },
                      {
                        "eClass": "Text",
                        "text": "Description of hardware filtering."
                      },
                      {
                        "eClass": "Text",
                        "text": "Description of hardware filtering."
                      }
                    ]
                  }
                }
              ],
              "id": "filtering"
            },
            {
              "eClass": "Variable",
              "name": "group",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Pointer",
                        "path": "nwbfile.electrode_groups.Tetrode"
                      },
                      {
                        "eClass": "Pointer",
                        "path": "nwbfile.electrode_groups.Tetrode"
                      },
                      {
                        "eClass": "Pointer",
                        "path": "nwbfile.electrode_groups.Tetrode"
                      },
                      {
                        "eClass": "Pointer",
                        "path": "nwbfile.electrode_groups.Tetrode"
                      }
                    ]
                  }
                }
              ],
              "id": "group"
            },
            {
              "eClass": "Variable",
              "name": "group_name",
              "types": [
                {
                  "eClass": "SimpleArrayType",
                  "$ref": "//@libraries.0/@types.14"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "SimpleArrayType",
                    "$ref": "//@libraries.0/@types.14"
                  },
                  "value": {
                    "eClass": "GenericArray",
                    "elements": [
                      {
                        "eClass": "Text",
                        "text": "Tetrode"
                      },
                      {
                        "eClass": "Text",
                        "text": "Tetrode"
                      },
                      {
                        "eClass": "Text",
                        "text": "Tetrode"
                      },
                      {
                        "eClass": "Text",
                        "text": "Tetrode"
                      }
                    ]
                  }
                }
              ],
              "id": "group_name"
            }
          ],
          "abstract": false,
          "id": "CompositeList1"
        },
        {
          "eClass": "CompositeType",
          "referencedVariables": [
            {
              "eClass": "Variable",
              "$ref": "//@libraries.1/@types.1/@variables.17"
            }
          ],
          "name": "Subject",
          "variables": [
            {
              "eClass": "Variable",
              "name": "age",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "33."
                  }
                }
              ],
              "id": "age"
            },
            {
              "eClass": "Variable",
              "name": "description",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Synthetic data"
                  }
                }
              ],
              "id": "description"
            },
            {
              "eClass": "Variable",
              "name": "genotype",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "AA."
                  }
                }
              ],
              "id": "genotype"
            },
            {
              "eClass": "Variable",
              "name": "sex",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "F."
                  }
                }
              ],
              "id": "sex"
            },
            {
              "eClass": "Variable",
              "name": "species",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "Homo Sapiens."
                  }
                }
              ],
              "id": "species"
            },
            {
              "eClass": "Variable",
              "name": "subject_id",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "HM-AA-875362791629."
                  }
                }
              ],
              "id": "subject_id"
            },
            {
              "eClass": "Variable",
              "name": "weight",
              "types": [
                {
                  "eClass": "TextType",
                  "$ref": "//@libraries.0/@types.5"
                }
              ],
              "initialValues": [
                {
                  "eClass": "TypeToValueMap",
                  "key": {
                    "eClass": "TextType",
                    "$ref": "//@libraries.0/@types.5"
                  },
                  "value": {
                    "eClass": "Text",
                    "text": "233lb."
                  }
                }
              ],
              "id": "weight"
            }
          ],
          "abstract": false,
          "id": "subject"
        }
      ]
    }
  ]
}

export default model