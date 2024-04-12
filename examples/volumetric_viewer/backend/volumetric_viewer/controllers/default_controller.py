import connexion
import six
import nrrd
import nibabel as nib
import numpy as np
import uuid
from flask import send_file
from skimage import measure

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
    
    volumetric_data = import_data(file)
    new_file = str(uuid.uuid1())
    write_obj(volumetric_data, './static/converted_files/' + new_file + '.obj', 3, 50)
    
    return './static/converted_files/' + new_file + '.obj'


def get_volume(volume_name):  # noqa: E501
    """Get the obj file

     # noqa: E501

    :param volume_name: get a volume
    :type volume_name: str

    :rtype: InlineResponse200
    """
    
    return send_file('../static/converted_files/' + volume_name, mimetype='multipart/form-data')

def import_data(file):
	'''import_data:
		Input:
		    -filename : Path to the file and name of the file to import (/path/to/the/file/filename)
		Return:
		    -data : A 3d array containing volumetric data exported from nifti or nrrd file
		This function checks wether the input is a nifti or a nrrd file and builds a 3D array out of it
	'''
	file.save("./static/original_files/" + file.filename)
	if '.nii' in file.filename:
		print('nifti')
		nifti_file = nib.load("./static/original_files/" + file.filename)
		data = nifti_file.get_fdata()
	if '.nrrd' in file.filename:
		print('nrrd')
		data, _ = nrrd.read("./static/original_files/" + file.filename)
	return data
    
def write_obj(volumetric_data, output_obj_path='output.obj', step_size=1, threshold=0):
	'''write_obj:
		Input:
			-volumetric_data : a 3D array extracted from nifti or nrrd file
			-output_obj_path : the path the OBJ file to create
			-step_size : the step_size used by the marching cube algorithm, single step can cause performance issues, big steps can decrease the
			resolution significantly
			-threshold : threshold to apply to the volumetric data in case of noise
		This function extract vertices and faces from volumetric data using the marching cube algorithm and write an OBJ file based on that
	'''
	volumetric_copy = volumetric_data
	volumetric_copy[np.where(volumetric_data<=threshold)] = 0
	vertices, faces, normals, values = measure.marching_cubes(volumetric_copy, 0, step_size=step_size)

	point_str, mesh_str = vertex_face_value_to_str(vertices, faces, values)
	write_vertices_meshes(point_str, mesh_str, output_obj_path)


def vertex_face_value_to_str(vertices, faces, values):    
	'''vertex_face_value_to_str:
		Input:
			-vertices : list of vertices extracted from marching cube algorithm
			-faces : list of faces extracted from marching cube algorithm
			-values : volumetric values from the original file
		Return:
			-point_str : list of vertices in OBJ format
			-mesh_str : list of faces in OBJ format
		This function convert a list of vertices, faces and values into OBJ file format (v1 v2 v3 w/ f1 f2 f3 see OBJ file format)
	'''
	point_str = ''
	mesh_str = ''
	print('starting writing')
	for vertex, face, value in zip(vertices, faces, values):
		point_str = point_str + 'v ' + str(vertex[0]) + ' ' + str(vertex[1]) + ' ' + str(vertex[2]) + ' ' + str(value) + '\n'
		#face start with index 0, OBJ reads from 1
		mesh_str = mesh_str + 'f ' + str(face[0]+1) + ' ' + str(face[1]+1) + ' ' + str(face[2]+1) + '\n'
	return point_str, mesh_str  
    
def write_vertices_meshes(vertices, meshes, file):
	'''write_vertices_meshes:
		Input:
			-vertices : a string containing the 3D coordinates of the vertices and their value (v1 v2 v3 w see OBJ file format)
			-meshes : a string containing the coordinates of the vertices forming each triangle (f1 f2 f3 see OBJ file format)
			-file : the file in which the shall be written
		This function writes vertices and meshes into an OBJ file
	'''
	with open(file, 'w') as obj_file:
		obj_file.write(vertices)
		obj_file.write(meshes)
	print('done writing')

