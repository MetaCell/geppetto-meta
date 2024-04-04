# coding: utf-8

from __future__ import absolute_import
import unittest

from flask import json
from six import BytesIO

from volumetric_viewer.models.inline_response200 import InlineResponse200  # noqa: E501
from volumetric_viewer.models.inline_response2001 import InlineResponse2001  # noqa: E501
from volumetric_viewer.models.inline_response500 import InlineResponse500  # noqa: E501
from volumetric_viewer.test import BaseTestCase


class TestDefaultController(BaseTestCase):
    """DefaultController integration test stubs"""

    @unittest.skip("multipart/form-data not supported by Connexion")
    def test_generate_volume(self):
        """Test case for generate_volume

        send nrrd and nifti
        """
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        }
        data = dict(file=(BytesIO(b'some file data'), 'file.txt'))
        response = self.client.open(
            '/api/data',
            method='POST',
            headers=headers,
            data=data,
            content_type='multipart/form-data')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_volume(self):
        """Test case for get_volume

        Get the obj file
        """
        query_string = [('volume_name', 'volume_name_example')]
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/data',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
