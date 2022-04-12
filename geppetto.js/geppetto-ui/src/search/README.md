# Search

Search Component

I'm going to list some stuff:
- some
- stuff

```element
search/showcase/Search
```

        {
      "key": "facets_annotation",
      "filter_name": "Classes",
      "type": "array",
      "disableGlobal": true,
      "values": [
        {
          "key": "Anatomy",
          "filter_name": "Anatomy",
          "enabled": true,
        },
        {
          "key": "Class",
          "filter_name": "Class",
          "enabled": true,
        },
        {
          "key": "Entity",
          "filter_name": "Entity",
          "enabled": true,
        },
      ]
    }

### Search Example

Example of search component.

```
search/SearchShowcase
``` 

## Libraries

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
```


```element
search/showcase/Search
```

## Examples

### Search Example

Example of a simple search.

```
search/SearchShowcase
```

## Libraries

[@axios](https://www.npmjs.com/package/axios)
[@Material-ui/core](https://www.npmjs.com/package/@material-ui/core)
