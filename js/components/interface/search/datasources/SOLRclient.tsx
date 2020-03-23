import axios from 'axios';

const globalConfiguration:any = {
    "url": "https://solr-dev.virtualflybrain.org/solr/ontology/select",
    "query_settings":
    {
        "q": "$SEARCH_TERM$ OR $SEARCH_TERM$* OR *$SEARCH_TERM$*",
        "defType": "edismax",
        "qf": "label synonym label_autosuggest_ws label_autosuggest_e label_autosuggest synonym_autosuggest_ws synonym_autosuggest_e synonym_autosuggest shortform_autosuggest has_narrow_synonym_annotation has_broad_synonym_annotation",
        "indent": "true",
        "fl": "short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation,facets_annotation",
        "start": "0",
        "fq": [
            "type:class OR type:individual OR type:property",
            "ontology_name:(vfb)",
            "shortform_autosuggest:VFB* OR shortform_autosuggest:FB* OR is_defining_ontology:true"
        ],
        "rows": "100",
        "wt": "json",
        "bq": "is_obsolete:false^100.0 shortform_autosuggest:VFB*^110.0 shortform_autosuggest:FBbt*^100.0 is_defining_ontology:true^100.0 label_s:\"\"^2 synonym_s:\"\" in_subset_annotation:BRAINNAME^3 short_form:FBbt_00003982^2"
    }
};

let solrConfiguration:any = {
    params: {
        json: {
          params: globalConfiguration.query_settings
        }
    }
}

export function getResultsSOLR ( searchString: string, returnResults: Function, configuration?: any) {
    var url:string = configuration.url;

    if (configuration.url === undefined) {
        url = globalConfiguration.url;
    }
    if (configuration.query_settings !== undefined) {
        solrConfiguration.params.json.params = configuration.query_settings;
    }

    // hack to clone the object
    let tempConfig:any = JSON.parse(JSON.stringify(solrConfiguration));
    tempConfig.params.json.params.q = solrConfiguration.params.json.params.q.replace(/\$SEARCH_TERM\$/g, searchString);

    axios.get(`${url}`, tempConfig)
        .then(function(response) {
            // returnResults("OK", response.data, searchString);
            refineResults(searchString, response.data.response.docs, returnResults);
        })
        .catch(function(error) {
            console.log('%c --- SOLR datasource error --- ', 'background: black; color: red');
            console.log(error);
            returnResults("ERROR", undefined, searchString);
        })
};

function refineResults(searchString, results, resultsHandler) {
    var refinedResults:Array<any> = [];
    results.map(item => {
        let labelInSynonym:boolean = false;
        if (item.hasOwnProperty("synonym")) {
            item.synonym.map(innerItem => {
                let newRecord:any = {}
                Object.keys(item).map(key => {
                    switch(key) {
                        case "label":
                            newRecord[key] = innerItem;
                            break;
                        case "synonym":
                            break;
                        default:
                            newRecord[key] = item[key];
                    }
                });
                refinedResults.push(newRecord);
                if (innerItem === item.label) {
                    labelInSynonym = true;
                }
            });
            if (!labelInSynonym) {
                let newRecord:any = {}
                Object.keys(item).map(key => {
                    if (key !== "synonym") {
                        newRecord[key] = item[key];
                    }
                });
                refinedResults.push(newRecord);
            }
        } else {
            let newRecord:any = {}
            Object.keys(item).map(key => {
                newRecord[key] = item[key];
            });
            refinedResults.push(newRecord);
        }
    });
    resultsHandler("OK", refinedResults, searchString);
}
