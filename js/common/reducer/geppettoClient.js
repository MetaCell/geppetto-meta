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
  },
  experiment: {
    id: undefined,
    status: undefined,
    parameters: undefined,
  },
  components: {
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
  visibility_records: [],
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
    return {
      ...state,
      instances: action.data.instance,
    };
  case clientActions.INSTANCES_CREATED:
    return {
      ...state,
      instances: action.data.instance,
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
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.PROJECT_MADE_PUBLIC:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.CONTROL_PANEL_OPEN:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.CONTROL_PANEL_CLOSE:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.LIT_ENTITIES_CHANGED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.COMPONENT_DESTROYED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.EXPERIMENT_PROPERTIES_SAVED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.PROJECT_PROPERTIES_SAVED:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.PARAMETERS_SET:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.COMMAND_LOG:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.COMMAND_LOG_DEBUG:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.COMMAND_LOG_RUN:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  case clientActions.COMMAND_CLEAR:
    return {
      ...state,
      experiment: {
        ...state.experiment,
        id: action.data.experiment_id,
        status: action.data.experiment_status,
      }
    };
  default:
    console.log("default scenario hit");
  }
}
