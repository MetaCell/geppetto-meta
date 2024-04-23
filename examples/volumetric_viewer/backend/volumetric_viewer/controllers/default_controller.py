import connexion
import six
import nrrd
import nibabel as nib
import numpy as np
import uuid
from flask import send_file
from skimage import measure
import volumetric_viewer.services.volumetric_utils as volumetric_utils

from volumetric_viewer.models.inline_response200 import InlineResponse200  # noqa: E501
from volumetric_viewer.models.inline_response2001 import InlineResponse2001  # noqa: E501
from volumetric_viewer.models.inline_response500 import InlineResponse500  # noqa: E501
from volumetric_viewer import util


def generate_volume(file=None):  # noqa: E501
    """send nrrd and nifti

     # noqa: E501

    :param file: 
    :type file: str

    :rtype: InlineResponse2001
    """
    return volumetric_utils.generate_volume_logic(file)


def get_volume(volume_name):  # noqa: E501
    """Get the obj file

     # noqa: E501

    :param volume_name: get a volume
    :type volume_name: str

    :rtype: InlineResponse200
    """
    
    return volumetric_utils.get_volume_logic(volume_name)
