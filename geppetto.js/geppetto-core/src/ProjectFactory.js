
/**
 * Factory class with node creation methods. Used by RuntimeTreeFactory class
 * while population of run time tree using json object.
 * 
 * @depreacted
 * @author Jesus R. Martinez (jesus@metacell.us)
 */
define(function (require) {
  return function (GEPPETTO) {
    var ProjectNode = require('./model/ProjectNode');
    var SimulatorConfiguration = require('./model/SimulatorConfiguration');

    /**
     * @class GEPPETTO.RuntimeTreeFactory
     */
    GEPPETTO.ProjectFactory
        = {
        /** Creates and populates client project nodes */
        createProjectNode: function (project, persisted) {
          var p = new ProjectNode(
            {
              name: project.name,
              type: project.type,
              id: project.id,
              view: (project.view != undefined) ? project.view.viewStates : undefined,
              _metaType: GEPPETTO.Resources.PROJECT_NODE
            });

          p.persisted = persisted;
          p.isPublicProject = project.isPublic;
                
          return p;
        },

        /** Creates and populates client aspect nodes for first time */
        createSimulatorConfigurationNode: function (node, aspectInstancePath) {
          var sC = new SimulatorConfiguration(
            {
              parameters: node.parameters,
              simulatorId: node.simulatorId,
              conversionId: node.conversionServiceId,
              aspectInstancePath: aspectInstancePath,
              timeStep: node.timestep,
              length: node.length,
              _metaType: GEPPETTO.Resources.SIMULATOR_CONFIGURATION_NODE
            });

          return sC;
        },
      };
  };
});
