const instances = [
    {
        "path": "acnet2",
        "metaType": "CompositeType",
        "type": "Model.neuroml.network_ACnet2",
        "static": false
    },
    {
        "path": "Model.neuroml.network_ACnet2.temperature",
        "metaType": "ParameterType",
        "type": "Model.common.Parameter",
        "static": true
    },
    {
        "path": "acnet2.pyramidals_48",
        "metaType": "ArrayType",
        "type": "Model.neuroml.pyramidals_48",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[*]",
        "metaType": "CompositeType",
        "type": "Model.neuroml.pyr_4_sym"
    },
    {
        "path": "acnet2.pyramidals_48[0]",
        "metaType": "CompositeType",
        "type": "Model.neuroml.pyr_4_sym"
    },
   
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.reverseRate.reverse_rate",
        "metaType": "DynamicsType",
        "type": "Model.common.Dynamics",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.alpha",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.beta",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.tau",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.inf",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.rateScale",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.fcond",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.z.q",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.g",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.fopen",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.Kahp_pyr.Kahp_pyr",
        "metaType": "HTMLType",
        "type": "Model.common.HTML",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.gDensity",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kahp_pyr_soma_group.iDensity",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group",
        "metaType": "CompositeType",
        "type": "Model.neuroml.pyr_4_sym.biophys.membraneProperties.Kdr_pyr_soma_group",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.annotation",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.annotation",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.annotation.bqmodel_isDescribedBy",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.annotation.bqmodel_isDescribedBy",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.annotation.bqbiol_isVersionOf",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.annotation.bqbiol_isVersionOf",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.n",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.forwardRate",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.n.forwardRate",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.forwardRate.r",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.forwardRate.forward_rate",
        "metaType": "DynamicsType",
        "type": "Model.common.Dynamics",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.reverseRate",
        "metaType": "CompositeType",
        "type": "Model.neuroml.Kdr_pyr.n.reverseRate",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.reverseRate.r",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.reverseRate.reverse_rate",
        "metaType": "DynamicsType",
        "type": "Model.common.Dynamics",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.alpha",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.beta",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.tau",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.inf",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.rateScale",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.fcond",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.n.q",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.g",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.fopen",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.Kdr_pyr.Kdr_pyr",
        "metaType": "HTMLType",
        "type": "Model.common.HTML",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.gDensity",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.Kdr_pyr_soma_group.iDensity",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all",
        "metaType": "CompositeType",
        "type": "Model.neuroml.pyr_4_sym.biophys.membraneProperties.LeakConductance_pyr_all",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all.LeakConductance_pyr",
        "metaType": "CompositeType",
        "type": "Model.neuroml.LeakConductance_pyr",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all.LeakConductance_pyr.g",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all.LeakConductance_pyr.fopen",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all.LeakConductance_pyr.LeakConductance_pyr",
        "metaType": "HTMLType",
        "type": "Model.common.HTML",
        "static": false
    },
    {
        "path": "acnet2.pyramidals_48[8].biophys.membraneProperties.LeakConductance_pyr_all.gDensity",
        "metaType": "StateVariableType",
        "type": "Model.common.StateVariable",
        "static": false
    }
]

export default instances