define(['json!../extensions/extensionsConfiguration.json', 'geppetto','components/ComponentFactory'],function(extensionConfiguration, GEPPETTO) {

	//Require your extension in extensionConfiguration.json
	for (var extension in extensionConfiguration){
		if (extensionConfiguration[extension]){
			require(['../extensions/' + extension], function(componentsInitialization){
				componentsInitialization(GEPPETTO);
			});
		}
	}
});
