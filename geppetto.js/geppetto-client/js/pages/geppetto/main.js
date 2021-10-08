/**
 * Loads all scripts needed for Geppetto
 *
 * @author Jesus Martinez (jesus@metacell.us)
 * @author Matt Olson (matt@metacell.us)
 * @author Adrian Quintana (adrian@metacell.us)
 * @deprecated
 */
define(function (require) {
  // TODO: needs to load processed css not less!
  require('../../style/less/main.less');

  var GEPPETTO = require('./GEPPETTO');
  window.GEPPETTO = GEPPETTO

  // start project node which will be used as a Singleton to store current project info
  var project = GEPPETTO.ProjectFactory.createProjectNode({ name: "Project", id: -1 }, false);
  window.Project = project;
  window.G = GEPPETTO.G;
  window.help = GEPPETTO.Utility.help;

  // Load Project if needed
  var command = "Project.loadFromURL";
  var simParam = GEPPETTO.Utility.getQueryStringParameter('load_project_from_url');
  if (simParam == "") {
    simParam = GEPPETTO.Utility.getQueryStringParameter('load_project_from_id');
    command = "Project.loadFromID";
  }

  if (simParam == "") {
    simParam = GEPPETTO.Utility.getQueryStringParameter('load_project_from_content');
    command = "Project.loadFromContent";
  }

  if (simParam) {
    $(document).ready(
      function () {
        if (expParam) {
          GEPPETTO.CommandController.execute(command + '("' + simParam + '", "' + expParam + '")');
        } else {
          GEPPETTO.CommandController.execute(command + '("' + simParam + '")');
        }
      });
  }
})
