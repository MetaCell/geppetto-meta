import json
from pygeppetto.model import Variable, CompoundQuery, ProcessQuery, CompoundRefQuery
from pygeppetto.model.datasources import Query, SimpleQuery
from pygeppetto.model.model_access import GeppettoModelAccess
from pygeppetto.model.utils import model_traversal

from pygeppetto.visitors import Switch
from pyecore.utils import dispatch
from pygeppetto.model.exceptions import GeppettoDataSourceException, GeppettoVisitingException, \
    GeppettoInitializationException
from pygeppetto.model.datasources.datasources import QueryResults, QueryResult, DataSource
from pygeppetto.model.utils.datasource import query_check

from pygeppetto.model.utils import template
from pygeppetto.utils import stream_requests

ID = "ID"


class ExecuteQueryVisitor(Switch):

    def __init__(self, variable: Variable,
                 geppetto_model_access: GeppettoModelAccess,
                 count_only=False,
                 processing_output_map=None):
        self.variable = variable
        self.geppetto_model_access = geppetto_model_access
        self.count = count_only
        self.results = None
        self.processing_output_map = processing_output_map if processing_output_map else {}

    @dispatch
    def do_switch(self, query):
        raise NotImplemented

    @do_switch.register(CompoundQuery)
    def case_compound_query(self, query: CompoundQuery):
        if self.count and not query.runForCount:
            return None
        run_query_visitor = ExecuteQueryVisitor(self.variable, self.geppetto_model_access,
                                                processing_output_map=self.processing_output_map)
        model_traversal.apply_direct_children_only(query, run_query_visitor)
        self.merge_results(run_query_visitor.results)

    @do_switch.register(ProcessQuery)
    def case_process_query(self, query: ProcessQuery):
        if self.count and not query.runForCount:
            return None
        if not query_check(query, self.variable):
            return None

        from pygeppetto.services.data_source_service import ServiceCreator
        try:
            qp = ServiceCreator.get_new_service_instance(query.queryProcessorId)

            self.results = qp.process(query, self.get_datasource(query=query), self.variable, self.results,
                                      self.geppetto_model_access)
            self.processing_output_map = qp.get_processing_output_map()
        except GeppettoDataSourceException as e:
            raise GeppettoVisitingException(f"Data source exception while running query {query.id}") from e
        except GeppettoInitializationException as e:
            raise GeppettoVisitingException(f"Initialization exception while running query {query.id}") from e

    @do_switch.register(CompoundRefQuery)
    def case_compound_query_ref(self, query: CompoundRefQuery):
        raise NotImplemented

    @do_switch.register(SimpleQuery)
    def case_simple_query(self, query: SimpleQuery):
        """ Ported from https://github.com/openworm/org.geppetto.datasources/blob/development/src/main/java/org/geppetto/datasources/ExecuteQueryVisitor.java """
        if not self.count or (self.count and query.runForCount):
            try:
                if query_check(query, self.variable):
                    # had to import here to avoid circular import error
                    from pygeppetto.services.data_source_service import ServiceCreator
                    ds = self.get_datasource(query=query)
                    dss = ServiceCreator.get_new_datasource_service_instance(data_source=ds,
                                                                             model_access=self.geppetto_model_access)

                    query_string = query.countQuery if self.count else query.query

                    processed_query_string = template.process_template(dss.get_template(),
                                                                       ID=self.variable.id,
                                                                       QUERY=query_string,
                                                                       **self.processing_output_map)

                    method = dss.get_connection_type()

                    response = stream_requests(url=ds.url, params=json.loads(processed_query_string), method=method)

                    self.results = dss.process_response({"response": response})

            except GeppettoDataSourceException as e:
                raise GeppettoVisitingException(f"Data source exception while running query {query.id}") from e
            except GeppettoInitializationException as e:
                raise GeppettoVisitingException(f"Initialization exception while running query {query.id}") from e

    def merge_results(self, processed_results: QueryResults):
        #  if this arrives from a first query results should be empty, so we automatically assign
        #  processedResults to results
        if self.results != None:
            if not ID in self.results.header or not ID in processed_results.header:
                raise GeppettoDataSourceException("Cannot merge without an ID in the results")

            id_pos = self.results.header.index(ID)
            proc_id_pos = processed_results.header.index(ID)

            current_record_ids = [record.values[id_pos] for record in self.results.results]
            self.results.header.update(processed_results.header)
            for record in processed_results.results:
                if not record.values[proc_id_pos] in current_record_ids:
                    self.results.results.add(record)
                else:
                    index = current_record_ids.index(record.values[proc_id_pos])
                    self.results.results[index].values.update(record.values)
        else:
            self.results = processed_results

    def get_datasource(self, query: Query):
        parent = query.eContainer()
        while not isinstance(parent, DataSource):
            parent = parent.eContainer()
        return parent
