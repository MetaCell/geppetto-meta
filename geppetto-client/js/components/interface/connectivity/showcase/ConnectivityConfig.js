import ConnectivityShowcase from "@geppettoengine/geppetto-client/js/components/interface/connectivity/showcase/ConnectivityShowcase";

export const ConnectivityConfig = {
    'name': "Connectivity Main Title",
    'description': "Connectivity Main Description",
    'examples': [
        {
            "name": "Connectivity Example 1",
            'description': "Connectivity Example 1 Description",
            'component': ConnectivityShowcase,
            'file': require(
                '!raw-loader!./ConnectivityShowcase.js'),
            'element': "ConnectivityComponent",
        }
    ]
};
