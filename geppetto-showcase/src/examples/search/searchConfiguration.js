var searchStyle = {
  inputWrapper: {
    "position": "absolute",
    "paddingLeft": "2.5%",
    "height": "100%",
    "width": "100%",
    "top": "20%"
  },
  searchText: {
    "width": "100vh",
    "zIndex": "1",
    "fontSize": "22px",
    "color": "black",
    "backgroundColor": "white",
    "padding": "12px 20px 12px 20px",
    "border": "3px solid #ff9800",
    "marginRight": "-8px",
  },
  filterIcon: {
    "right": "25px",
    "bottom": "15px",
    "zIndex": "5",
    "cursor": "pointer",
    "fontSize": "25px",
    "position": "absolute",
    "color": "black",
  },
  closeIcon: {
    "position": "relative",
    "color": "#ff9800",
    "bottom": "50px",
    "right": "22px",
    "fontWeight": "bold",
    "fontSize": "20px",
    "cursor": "pointer",
  },
  paperResults: {
    "left": "15%",
    "height": "50%",
    "width": "70%",
    "position": "absolute",
    "textAlign": "center",
    "backgroundColor": "black",
    "margin": "10px 10px 10px 10px",
    "padding": "12px 20px 12px 20px",
    "overflow": "scroll",
    "zIndex": "5",
  },
  paperFilters: {
    "minHeight": "280px",
    "minWidth": "240px",
    "position": "absolute",
    "backgroundColor": "#141313",
    "color": "white",
    "overflow": "scroll",
    "zIndex": "6",
    "border": "3px solid #ff9800",
    "fontFamily": "Barlow, Khand, sans-serif",
    "fontSize": "16px",
    "top": "68px",
    "right": "0px",
  },
  singleResult: {
    "color": "white",
    "&:hover": {
      "color": "#ff9800",
      "background-color": "#333333",
    },
  },
  main: {
    "position": "absolute",
    "top": "0px",
    "left": "10%",
    "width": "100%",
    "height": "100%",
    "margin": "0",
    "padding": "0",
    "zIndex": "3",
    "backgroundColor": "rgba(255, 255, 255, 0.7)",
    "textAlign": "center",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
  }
};

var datasourceConfiguration = {
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
  
// searchedObject define what to take from
  
// filters state can be: disabled, negative, positive
  
var searchConfiguration = {
  "resultsMapping":
      {
        "name": "label",
        "id": "short_form"
      },
  "filters": [
    {
      "key": "label",
      "filter_name": "Label",
      "type": "string",
      "enabled": "positive",
    },
    {
      "key": "short_form",
      "filter_name": "ID",
      "type": "string",
      "enabled": "negative",
    },
    {
      "key": "facets_annotation",
      "filter_name": "Type",
      "type": "array",
      "enabled": "disabled",
      "values": [
        {
          "key": "Adult",
          "filter_name": "Adult",
          "enabled": "disabled",
        },
        {
          "key": "Larval",
          "filter_name": "Larval",
          "enabled": "disabled",
        },
        {
          "key": "Nervous_system",
          "filter_name": "Nervous System",
          "enabled": "disabled",
        },
        {
          "key": "Anatomy",
          "filter_name": "Anatomy",
          "enabled": "disabled",
        },
        {
          "key": "Expression_pattern",
          "filter_name": "Expression Pattern",
          "enabled": "disabled",
        },
        {
          "key": "Individual",
          "filter_name": "Image",
          "enabled": "disabled",
        },
        {
          "key": "Synaptic_neuropil_domain",
          "filter_name": "Synaptic Neuropil",
          "enabled": "disabled",
        },
        {
          "key": "Neuron",
          "filter_name": "Neuron",
          "enabled": "disabled",
        }
      ]
    },
  ],
  "sorter": function (a, b) {
    var InputString = window.spotlightString;
    // move down results with no label
    if (a.label == undefined) {
      return 1;
    }
    if (b.label == undefined) {
      return -1;
    }
    // move exact matches to top
    if (InputString == a.label) {
      return -1;
    }
    if (InputString == b.label) {
      return 1;
    }
    // close match without case matching
    if (InputString.toLowerCase() == a.label.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.label.toLowerCase()) {
      return 1;
    }
    // match ignoring joinging nonwords
    if (InputString.toLowerCase().split(/\W+/).join(' ') == a.label.toLowerCase().split(/\W+/).join(' ')) {
      return -1;
    }
    if (InputString.toLowerCase().split(/\W+/).join(' ') == b.label.toLowerCase().split(/\W+/).join(' ')) {
      return 1;
    }
    // match against id
    if (InputString.toLowerCase() == a.id.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.id.toLowerCase()) {
      return 1;
    }
    // pick up any match without nonword join character match
    if (a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0 && b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0 && a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1) {
      return -1;
    }
    // also with underscores ignored
    if (a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0 && b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0 && a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return -1;
    }
    // if not found in one then advance the other
    if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
      return -1;
    }
    // if the match is closer to start than the other move up
    if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) < b.label.toLowerCase().indexOf(InputString.toLowerCase())) {
      return -1;
    }
    if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) < a.label.toLowerCase().indexOf(InputString.toLowerCase())) {
      return 1;
    }
    // if the match in the id is closer to start then move up
    if (a.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.id.toLowerCase().indexOf(InputString.toLowerCase()) < b.id.toLowerCase().indexOf(InputString.toLowerCase())) {
      return -1;
    }
    if (b.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.id.toLowerCase().indexOf(InputString.toLowerCase()) < a.id.toLowerCase().indexOf(InputString.toLowerCase())) {
      return 1;
    }
    // move the shorter synonyms to the top
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    } else {
      return 0;
    } // if nothing found then do nothing.
  },
  "clickHandler": function (id) {
    window.addVfbId(id);
  }
};

module.exports = {
  datasourceConfiguration,
  searchConfiguration,
  searchStyle
};
