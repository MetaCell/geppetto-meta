import { clientActions } from '../actions/actions'

export const clientInitialStatus = {
  error: false,
  instances: [],
  instance_focused: undefined,
  instance_selected: undefined,
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
    },
  },
  experiment: {
    id: undefined,
    status: undefined,
    parameters: undefined,
    properties: {
      parameters_set: undefined,
      properties_saved: false,
    },
  },
  components: {
    canvas: {
      available: false,
      latestUpdate: undefined,
    },
    spotlight: {
      available: false,
      visible: false,
    },
    control_panel: {
      available: false,
      visible: false,
    },
    spinner: {
      visible: false,
      message: undefined,
    },
    tutorial: {
      available: false,
      visible: false,
    },
  },
  colorChanged: {
    instance: undefined,
    color: undefined,
  },
  logs: {
    mode: undefined,
    message: undefined,
    timestamp: undefined,
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
  case clientActions.EXPERIMENT_OVER:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
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
  case clientActions.PROJECT_PERSISTED:
    return {
      ...state,
      project: {
        ...state.project,
        status: action.data.project_status,
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
  case clientActions.EXPERIMENT_LOADED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.MODELTREE_POPULATED:
    return { ...state, };
  case clientActions.SIMULATIONTREE_POPULATED:
    return { ...state, };
  case clientActions.DO_EXPERIMENT_PLAY:
    return { ...state, };
  case clientActions.EXPERIMENT_PLAY:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_STATUS_CHECK:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_PAUSE:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_RESUME:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_RUNNING:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_STOP:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_COMPLETED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_FAILED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_UPDATE:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        parameters: action.data.parameters,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_UPDATED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_RENAMED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_DELETED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_ACTIVE:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_CREATED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.SPOTLIGHT_CLOSED:
    return {
      ...state,
      components: {
        ...state.components,
        spotlight: {
          ...state.components.spotlight,
          visible: false,
        },
      }
    };
  case clientActions.SPOTLIGHT_LOADED:
    return {
      ...state,
      components: {
        ...state.components,
        spotlight: {
          ...state.components.spotlight,
          available: true,
        },
      }
    };
  case clientActions.INSTANCE_DELETED:
    var _instances = state.instances.filter( item => {
      item !== action.data
    });
    return {
      ...state,
      instances: _instances,
    };
  case clientActions.INSTANCES_CREATED:
    var _instances = [...state.instances];
    action.data.forEach( instance => {
      let path = instance.getInstancePath();
      if (state.instances.indexOf(path) == -1) {
        _instances.push(path);
      }
    });
    return {
      ...state,
      instances: _instances,
    };
  case clientActions.SHOW_TUTORIAL:
    return {
      ...state,
      components: {
        ...state.components,
        tutorial: {
          ...state.components.tutorial,
          visible: true,
        }
      }
    };
  case clientActions.HIDE_TUTORIAL:
    return {
      ...state,
      components: {
        ...state.components,
        tutorial: {
          ...state.components.tutorial,
          visible: false,
        }
      }
    };
  case clientActions.SHOW_SPINNER:
    return {
      ...state,
      components: {
        ...state.components,
        spinner: {
          ...state.components.spinner,
          visible: true,
          message: action.data.message,
        }
      }
    };
  case clientActions.HIDE_SPINNER:
    return {
      ...state,
      components: {
        ...state.components,
        spinner: {
          ...state.components.spinner,
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
  case clientActions.CANVAS_INITIALISED:
    return {
      ...state,
      components: {
        ...state.components,
        canvas: {
          ...state.components.canvas,
          available: true,
        }
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
  case clientActions.CONTROL_PANEL_OPEN:
    return {
      ...state,
      components: {
        ...state.components,
        control_panel: {
          ...state.components.control_panel,
          visible: true,
        }
      }
    };
  case clientActions.CONTROL_PANEL_CLOSE:
    return {
      ...state,
      components: {
        ...state.components,
        control_panel: {
          ...state.components.control_panel,
          visible: false,
        }
      }
    };
  case clientActions.LIT_ENTITIES_CHANGED:
    return { ...state, };
  case clientActions.COMPONENT_DESTROYED:
    return { ...state, };
  case clientActions.EXPERIMENT_PROPERTIES_SAVED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        properties: {
          ...state.experiment.properties,
          properties_saved: true,
        }
      }
    };
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
  case clientActions.PARAMETERS_SET:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        properties: {
          ...state.experiment.properties,
          parameters_set: action.data.timestamp,
        }
      }
    };
  case clientActions.COMMAND_LOG:
    return {
      ...state,
      logs: {
        ...state.logs,
        mode: clientActions.COMMAND_LOG,
        message: action.data.message,
        timestamp: action.data.timestamp
      }
    };
  case clientActions.COMMAND_LOG_DEBUG:
    return {
      ...state,
      logs: {
        ...state.logs,
        mode: clientActions.COMMAND_LOG_DEBUG,
        message: action.data.message,
        timestamp: action.data.timestamp
      }
    };
  case clientActions.COMMAND_LOG_RUN:
    return {
      ...state,
      logs: {
        ...state.logs,
        mode: clientActions.COMMAND_LOG_RUN,
        message: action.data.message,
        timestamp: action.data.timestamp
      }
    };
  case clientActions.COMMAND_CLEAR:
    return {
      ...state,
      logs: {
        ...state.logs,
        mode: clientActions.COMMAND_CLEAR,
        timestamp: action.data.timestamp
      }
    };
  case clientActions.COMMAND_TOGGLE_IMPLICIT:
    return {
      ...state,
      logs: {
        ...state.logs,
        mode: clientActions.COMMAND_TOGGLE_IMPLICIT,
        timestamp: action.data.timestamp
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
  case clientActions.UPDATE_CAMERA:
    return {
      ...state,
      components: {
        ...state.components,
        canvas: {
          ...state.components.canvas,
          latestUpdate: action.data,
        }
      }
    };
  default:
    console.log("default scenario hit");
  }
}
