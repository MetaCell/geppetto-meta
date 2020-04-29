var menuConfiguration = {
	global: {
		subMenuOpenOnHover: true,
		menuOpenOnClick: true,
		menuPadding: 2,
		fontFamily: "Khan",
		menuFontSize: "14",
		subMenuFontSize: "12"
	},
	buttons: [
		{
			label: "Window",
			position: "bottom-start",
			list: [
				{
					label: "Info",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["termInfoVisible"]
					}
				},
				{
					label: "3D Viewer",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["canvasVisible"]
					}
				},
				{
					label: "Slice Viewer",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["stackViewerVisible"]
					}
				},
				{
					label: "Search",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["spotlightVisible"]
					}
				},
				{
					label: "Query",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["queryBuilderVisible"]
					}
				},
				{
					label: "Layers",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["controlPanelVisible"]
					}
				},
				{
					label: "Wireframe",
					action: {
						handlerAction: "UIElementHandler",
						parameters: ["wireframeVisible"]
					}
				}
			]
		},
		{
			label: "History",
			position: "bottom-start",
			dynamicListInjector: {
						handlerAction: "historyMenuInjector",
						parameters: ["undefined"]
					}
		}
	]
};
