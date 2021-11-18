import { clientActions } from '../actions'

export interface ClientState {
  colorChanged: {
    instance: string,
    color: string,
  },
  components: {
    help: {
      available: Boolean,
      visible: Boolean,
    },
    logo: {
      latestUpdate: Date,
      running: Boolean,
    },
    persist_spinner: { running: Boolean },
    queryBuilder: {
      available: Boolean,
      visible: Boolean,
    },
    spinner: { [offAction: string]: string },
  },
  controls_disabled: Boolean,
  error: {
    latestUpdate: Date,
    message: string,
  },
  info: {
    latestUpdate: Date,
    message: string,
  },
  instances: [],
  instance_focused: any,
  instance_selected: any,
  jupyter_geppetto_extension: { loaded: Boolean, },
  model: {
    id: string,
    status: any
  },
  project: {
    id: string,
    status: any,
    properties: {
      public: Boolean,
      properties_saved: Boolean,
      config_loaded: Boolean,
      configuration: any,
    },
  },
  pythonMessages: {
    id: string,
    type: any,
    response: any,
    timestamp: Date,
  },
  visibility_records: any[],
  websocket_status: any,
}

export const clientInitialState: ClientState = {
  colorChanged: {
    instance: undefined,
    color: undefined,
  },
  components: {
    help: {
      available: false,
      visible: false,
    },
    logo: {
      latestUpdate: undefined,
      running: false,
    },
    persist_spinner: { running: false },
    queryBuilder: {
      available: false,
      visible: false,
    },
    spinner: {},
  },
  controls_disabled: false,
  error: {
    latestUpdate: undefined,
    message: undefined,
  },
  info: {
    latestUpdate: undefined,
    message: undefined,
  },
  instances: [],
  instance_focused: undefined,
  instance_selected: undefined,
  jupyter_geppetto_extension: { loaded: false, },
  model: {
    id: undefined,
    status: undefined
  },
  project: {
    id: undefined,
    status: undefined,
    properties: {
      public: false,
      properties_saved: false,
      config_loaded: false,
      configuration: undefined,
    },
  },
  pythonMessages: {
    id: undefined,
    type: undefined,
    response: undefined,
    timestamp: undefined,
  },
  visibility_records: [],
  websocket_status: undefined,
};

export default function geppettoClientReducer ( state = {}, action ) {
  return ({
    ...state,
    ...clientReducer(state, action)
  });
}

function clientReducer (state, action) {

  // Hide the spinner when the correspondin offAction arrives
  if (state?.components?.spinner && state.components.spinner[action.type]) {
    delete state.components.spinner[action.type];
    state.components.spinner = { ...state.components.spinner };
  }

  switch (action.type) {
  case clientActions.SELECT:
    if (action.data !== undefined) {
      return {
        ...state,
        instance_selected: action.data
      };
    }
    break;
  case clientActions.VISIBILITY_CHANGED:
    if (action.data !== undefined && action.data.instance !== null && action.data.instance !== undefined) {
      var instanceName = action.data.instance.getName();
      let newVisibility = [...state.visibility_records];
      newVisibility.unshift(instanceName);
      return {
        ...state,
        visibility_records: newVisibility,
      };
    }
    return { ...state };
  case clientActions.FOCUS_CHANGED:
    if (action.data !== undefined && action.data.instance !== null && action.data.instance !== undefined) {
      var instanceName = action.data.instance.getName();
      return {
        ...state,
        instance_focused: instanceName,
      };
    }
    return { ...state };
  case clientActions.PROJECT_LOADING:
    return {
      ...state,
      project: {
        ...state.project,
        status: action.data.project_status,
      }
    };
  case clientActions.PROJECT_LOADED:
    return {
      ...state,
      project: {
        ...state.project,
        status: action.data.project_status,
      }
    };
  case clientActions.PROJECT_DOWNLOADED:
    return {
      ...state,
      project: {
        ...state.project,
        status: action.data.project_status,
      }
    };
  case clientActions.PROJECT_CONFIG_LOADED:
    return {
      ...state,
      project: {
        ...state.project,
        properties: {
          ...state.project.properties,
          config_loaded: true,
          configuration: action.data,
        }
      }
    };
  case clientActions.MODEL_LOADED:
    return {
      ...state,
      model: {
        ...state.model,
        status: action.data.model_status,
      }
    };
  case clientActions.MODELTREE_POPULATED:
    return { ...state, };
  case clientActions.SIMULATIONTREE_POPULATED:
    return { ...state, };
  case clientActions.INSTANCE_DELETED:
    const deletedInstances = state.instances.filter( item => {
      item !== action.data
    });
    return {
      ...state,
      instances: deletedInstances,
    };
  case clientActions.INSTANCES_CREATED:
    const createdInstances = [...state.instances];
    action.data.forEach( instance => {
      let path = instance.getInstancePath();
      if (state.instances.indexOf(path) == -1) {
        createdInstances.push(path);
      }
    });
    return {
      ...state,
      instances: createdInstances,
    };

  case clientActions.SHOW_QUERYBUILDER:
    return {
      ...state,
      components: {
        ...state.components,
        queryBuilder: {
          ...state.components.queryBuilder,
          visible: true,
        }
      }
    };
  case clientActions.HIDE_QUERYBUILDER:
    return {
      ...state,
      components: {
        ...state.components,
        queryBuilder: {
          ...state.components.queryBuilder,
          visible: false,
        }
      }
    };
  case clientActions.SHOW_SPINNER:
    const offAction = action.data.offAction || clientActions.HIDE_SPINNER;
    return {
      ...state,
      components: {
        ...state.components,
        spinner: {
          ...state.components.spinner,
          [offAction]: action.data.message
        }
      }
    };
  case clientActions.SHOW_HELP:
    return {
      ...state,
      components: {
        ...state.components,
        help: {
          ...state.components.help,
          visible: true,
        }
      }
    };
  case clientActions.HIDE_HELP:
    return {
      ...state,
      components: {
        ...state.components,
        help: {
          ...state.components.help,
          visible: false,
        }
      }
    };
  case clientActions.COLOR_SET:
    action.data.instance.setColor(action.data.color);
    return {
      ...state,
      colorChanged: {
        ...state.colorChanged,
        color: action.data.color,
        instance: action.data.instance,
      }
    };
  case clientActions.PROJECT_MADE_PUBLIC:
    return {
      ...state,
      project: {
        ...state.project,
        properties: {
          ...state.project.properties,
          public: true,
        },
      }
    };
  case clientActions.LIT_ENTITIES_CHANGED:
    return { ...state, };
  case clientActions.COMPONENT_DESTROYED:
    return { ...state, };
  case clientActions.PROJECT_PROPERTIES_SAVED:
    return {
      ...state,
      project: {
        ...state.project,
        properties: {
          ...state.project.properties,
          properties_saved: true,
        }
      }
    };

  case clientActions.RECEIVE_PYTHON_MESSAGE:
    return {
      ...state,
      pythonMessages: {
        ...state.pythonMessages,
        id: action.data.id,
        type: action.data.type,
        response: action.data.response,
        timestamp: action.data.timestamp,
      },
    };
  case clientActions.ERROR_WHILE_EXEC_PYTHON_COMMAND:
    return {
      ...state,
      pythonMessages: {
        ...state.pythonMessages,
        id: action.data.id,
        type: action.data.type,
        response: action.data.response,
        timestamp: action.data.timestamp,
      },
    };
  case clientActions.WEBSOCKET_DISCONNECTED:
    return {
      ...state,
      websocket_status: clientActions.WEBSOCKET_DISCONNECTED
    };
  case clientActions.SPIN_LOGO:
    return {
      ...state,
      components: {
        ...state.components,
        logo: {
          ...state.components.logo,
          running: true,
        }
      }
    };
  case clientActions.STOP_LOGO:
    return {
      ...state,
      components: {
        ...state.components,
        logo: {
          ...state.components.logo,
          running: false,
        }
      }
    };
  case clientActions.GEPPETTO_ERROR:
    return {
      ...state,
      error: {
        ...state.error,
        latestUpdate: action.data.latestUpdate,
        message: action.data.message,
      }
    };
  case clientActions.GEPPETTO_INFO:
    return {
      ...state,
      info: {
        ...state.info,
        latestUpdate: action.data.latestUpdate,
        message: action.data.message,
      }
    };
  case clientActions.SPIN_PERSIST:
    return {
      ...state,
      components: {
        ...state.components,
        persist_spinner: {
          ...state.components.persist_spinner,
          running: true,
        }
      }
    };
  case clientActions.STOP_PERSIST:
    return {
      ...state,
      components: {
        ...state.components,
        persist_spinner: {
          ...state.components.persist_spinner,
          running: false,
        }
      }
    };
  case clientActions.JUPYTER_GEPPETTO_EXTENSION_READY:
    return {
      ...state,
      jupyter_geppetto_extension: {
        ...state.jupyter_geppetto_extension,
        loaded: true
      }
    };
  case clientActions.DISABLE_CONTROLS:
    return {
      ...state,
      controls_disabled: true,
    };
  default:
  }
}
