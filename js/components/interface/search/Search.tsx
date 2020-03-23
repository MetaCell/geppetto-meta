/**
 * @author  Dario Del Piano (dario@metacell.us)
 */

import * as React from "react";
import { Component, FC, useState, useRef, useEffect } from "react";
import { getResultsSOLR } from "./datasources/SOLRclient";
import { DatasourceTypes } from './datasources/datasources';
import FilterListIcon from '@material-ui/icons/FilterList';
import { Checkbox, Paper, MenuList, MenuItem } from "@material-ui/core";

import { SearchProps, SearchState, ResultsProps, FiltersProps } from './SearchInterfaces';

declare var require: any

// Global used to sort the results from the sorter function declared in the searchConfiguration
declare global {
  interface Window { spotlightString: string; }
}

let style = require('./style/search.less');

/*
 * Results Functional Component
 * @param data: Array<any>
 * @param closeHandler: Function
 * @param clickHandler: Function
 */

const Results: FC<ResultsProps> = ({ data, mapping, closeHandler, clickHandler, topAnchor }) => {
  // if data are available we display the list of results
  if (data == undefined || data.length == 0) return null;
  return (
      <Paper style={{top: topAnchor + "px",
                    left: '10%',
                    height: '50%',
                    width: '80%',
                    position: 'absolute',
                    textAlign: 'center',
                    backgroundColor: 'gray',
                    overflow: 'scroll'}}>
        <MenuList>
          {data.map((item, index) => {
            return ( <MenuItem style={{ fontSize: "16px" }}
              key={index}
              onClick={() => {
                clickHandler(item[mapping["id"]]);
                closeHandler(false);
              }}>
              {item[mapping["name"]]}
            </MenuItem> );
          })}
        </MenuList>
        </Paper>
  );
};

/*
 * Filters Functional Component
 * @param filters: Array<any>
 * @param setFilters: Function
 * @param openFilters: Function
 */

const Filters: FC<FiltersProps> = ({ filters, setFilters, openFilters }) => {
  var paperRef = useRef(null);
  const [ state, setState ] = useState({ open: false, top: "0", left: "0" });

  // hook for the event listener to detect when we click outside the component
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

  // function to handle the click outside the filters to close the component
  const handleClickOutside = event => {
    if (paperRef.current && !paperRef.current.contains(event.target)) {
      setState({ open: false, top: "0px", left: "0px"});
    }
  };

  // If filters are not defined we don't visualise anything
  if (filters == undefined || filters.length == 0) return null;

  // if filters are defined we check if the filter's paper is open and display them
  if (state.open) {
    return (
      <span ref={paperRef}>
        <FilterListIcon id="filterIcon" onClick={(e) => {
            setState({ open: false, top: (200 - e.pageY).toString() + "px", left: (e.pageX - 280).toString() + "px"});
          }} />
        <Paper
          style={{top: state.top,
                  left: state.left,
                  height: '200px',
                  width: '240px',
                  position: 'absolute',
                  backgroundColor: 'yellow',
                  overflow: 'scroll'}}>
          <MenuList>
            {filters.map((item, index) => {
              switch (item.type) {
                case 'string':
                  return (
                    <div key={index} style={{ textAlign: "left", fontSize: "16px" }}>
                      <Checkbox
                        checked={item.enabled}
                        size='medium'
                        color='default'
                        inputProps={{ 'aria-label': 'checkbox with default color' }}
                        onChange={() => {
                          if (item.enabled !== undefined) {
                            item.enabled = !item.enabled;
                          } else {
                            item.enabled = true;
                          }
                          setFilters(item);
                          setState({ open: true, top: state.top, left: state.left});
                        }}/>
                      <span style={{verticalAlign: "middle"}}>
                        {item.filter_name}
                      </span>
                    </div>);
                  break;
                case 'array':
                  return (
                    <div key={index} style={{ textAlign: "left", fontSize: "16px", marginLeft: "10px" }}>
                      {item.filter_name}
                      {item.values.map((value, innerIndex) => {
                        return (
                          <div key={index + "_" + innerIndex} style={{ marginLeft: "20px" }}>
                            <Checkbox
                              checked={value.enabled}
                              size='medium'
                              color='default'
                              inputProps={{ 'aria-label': 'checkbox with default color' }}
                              onChange={() => {
                                if (value.enabled !== undefined) {
                                  value.enabled = !value.enabled;
                                } else {
                                  value.enabled = true;
                                }
                                setFilters(item);
                                setState({ open: true, top: state.top, left: state.left});
                              }}/>
                            <span style={{verticalAlign: "middle"}}>
                              {value.filter_name}
                            </span>
                          </div>);
                        })
                      }
                    </div>);
                  break;
                default:
                  return (
                    <div key={index} style={{ fontSize: "16px" }} >
                      "Error filter " + {item.key} + " configuration"
                    </div>
                  );
                  break;
              }
            })}
          </MenuList>
        </Paper>
      </span>
    );
  } else {
    return (
      <span ref={paperRef}>
        <FilterListIcon id="filterIcon" onClick={(e) => {
          setState({ open: true, top: (200 - e.pageY).toString() + "px", left: (e.pageX - 280).toString() + "px"});
        }} />
      </span>
    );
  }
};

/*
 * Search Component
 * @param datasources: string
 * @param searchConfiguration: any
 * @param datasourceConfiguration: any
 * @param clickHandler: Function
 * @param customDatasourceHandler?: Function
 */

export default class Search extends Component<SearchProps, SearchState> {
    private results:Array<any>;
    private getResults:Function;
    private resultsHeight:number;

    constructor (props: SearchProps) {
        super(props);

        const initialFilters = (props.searchConfiguration.filters !== undefined) ? props.searchConfiguration.filters : [];
        this.state = {
          value: "",
          isOpen: false,
          filters: initialFilters
        };

        this.results = [];
        this.resultsHeight = 0;

        this.openSearch = this.openSearch.bind(this);
        this.setFilters = this.setFilters.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleResults = this.handleResults.bind(this);
      };

      // literal object to extract the getter function based on the datasource we pick
      getDatasource = {
        [DatasourceTypes.CUSTOM]: this.props.customDatasourceHandler,
        [DatasourceTypes.SOLRClient]: getResultsSOLR,
      };

      openSearch(requestedAction) {
        if (requestedAction !== undefined) {
          this.results = [];
          this.setState({ isOpen: requestedAction, value: "" });
        } else {
          this.results = [];
          this.setState({ isOpen: !this.state.isOpen, value: "" });
        }
      }

      // results handler, the name says everything
      handleResults(status:string, data:any, value:string) {
        window.spotlightString = value;
        switch(status) {
            case "OK":
                if (this.state.value !== value) {
                  if (value === "") {
                    this.results = [];
                  } else {
                    this.results = data.sort(this.props.searchConfiguration.sorter);
                  }
                  this.setState({ value: value });
                }
                break;
            case "ERROR":
                break;
            default:
                console.log("This is a case not considered");
        }
      };

      setFilters(filter) {
        let newFilters:Array<any> = [];

        this.state.filters.map(item => {
          if (item.key === filter.key) {
            newFilters.push(filter);
          } else {
            newFilters.push(item);
          }
        });
        this.setState({ filters: newFilters });
      };

      applyFilters() {
        var allFiltersDisabled:boolean = true;
        var newResults:Array<any> = [];

        this.state.filters.map(filter => {
          switch(filter.type) {
            case 'string':
              if (filter.enabled !== undefined && filter.enabled === true) {
                allFiltersDisabled = false;
              }
              break;
            case 'array':
              filter.values.map(innerFilter => {
                if (innerFilter.enabled !== undefined && innerFilter.enabled === true) {
                  allFiltersDisabled = false;
                }
              });
              break;
            default:
              console.log("Error filter " + filter.key + " configuration");
          }
        });

        if (allFiltersDisabled) {
          return this.results;
        } else {
          this.results.map(record => {
            var recordAdded:boolean = true;
            this.state.filters.map(filter => {
              switch(filter.type) {
                case 'string':
                  if (recordAdded && filter.enabled === true && filter.key !== undefined && record[filter.key] !== undefined) {
                    if (record[filter.key].toLowerCase().indexOf(this.state.value.toLowerCase()) > -1) {
                      recordAdded = false;
                      newResults.push(record);
                    }
                  }
                  break;
                case 'array':
                  if (record[filter.key] !== undefined) {
                    filter.values.map(innerFilter => {
                      if (recordAdded && innerFilter.enabled === true && innerFilter.key !== undefined && record[filter.key].includes(innerFilter.key)) {
                        recordAdded = false;
                        newResults.push(record);
                      }
                    });
                  }
                  break;
                default:
                  console.log("Error filter " + filter.key + " configuration");
              }
            });
          });
          return newResults;
        }
      }

      // wrapper to call the getter with all the required params for the generic datasource call.
      requestData(e) {
        this.getResults(e.target.value,
                        this.handleResults,
                        this.props.datasourceConfiguration);
      };

      handleResize() {
        if (this.refs.inputRef !== undefined) {
          this.resultsHeight = ((this.refs.inputRef as HTMLInputElement).parentNode as HTMLDivElement).offsetHeight + ((this.refs.inputRef as HTMLInputElement).parentNode as HTMLDivElement).offsetTop + 10;
          this.setState({ value: this.state.value });
        }
      }

      componentDidMount() {
        window.addEventListener('resize', this.handleResize)
      }

      componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
      }

      // link the function getResults to the datasource getter that we decided in the prop datasource
      componentWillMount() {
        this.getResults = this.getDatasource[this.props.datasource]
      };

      render() {
        if (!this.state.isOpen) {
          return null;
        }

        let filteredResults:Array<any> = this.applyFilters();
        return (
          <div>
            <Paper style={{top: '15%',
                          left: '10%',
                          width: '80%',
                          position: 'absolute',
                          textAlign: 'center',
                          backgroundColor: 'gray',
                          zIndex: 1}}>
              <input ref="inputRef" id="searchInput" type="text"
                autoComplete="virtualflybrain"
                onChange={ (e:any) => {
                  this.resultsHeight = e.currentTarget.parentNode.offsetHeight + e.currentTarget.parentNode.offsetTop + 10;
                  this.requestData(e);
                }} />

              <Filters
                filters={this.state.filters}
                setFilters={this.setFilters}
                />
            </Paper>

            <Results
              data={filteredResults}
              mapping={this.props.searchConfiguration.resultsMapping}
              closeHandler={this.openSearch}
              clickHandler={this.props.searchConfiguration.clickHandler}
              topAnchor={this.resultsHeight}
            />
          </div>
        );
      }
};
