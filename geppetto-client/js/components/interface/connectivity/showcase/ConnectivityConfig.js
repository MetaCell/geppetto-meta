import ConnectivityShowcaseMatrix from "@geppettoengine/geppetto-client/js/components/interface/connectivity/showcase/examples/ConnectivityShowcaseMatrix";
import ConnectivityShowcaseForce from "@geppettoengine/geppetto-client/js/components/interface/connectivity/showcase/examples/ConnectivityShowcaseForce";

export const ConnectivityConfig = {
    'name': "Connectivity Main Title",
    'description': "Connectivity Main Description",
    'examples': [
        {
            "name": "Connectivity Matrix",
            'description': "Connectivity example using the matrix layout",
            'component': ConnectivityShowcaseMatrix,
            'file': require(
                '!raw-loader!./examples/ConnectivityShowcaseMatrix.js'),
            'element': "ConnectivityComponent",
        },
        {
            "name": "Connectivity Force",
            'description': "Connectivity example force layout",
            'component': ConnectivityShowcaseForce,
            'file': require(
                '!raw-loader!./examples/ConnectivityShowcaseForce.js'),
            'element': "ConnectivityComponent",
        }
    ]
};
