import os
import connexion
import six
import nrrd
import nibabel as nib
import numpy as np
import uuid
import pathlib
import platform
from flask import send_file
from skimage import measure

path = ''

def generate_volume_logic(file=None):  # noqa: E501
    """send nrrd and nifti

     # noqa: E501

    :param file: 
    :type file: str

    :rtype: InlineResponse2001
    """
    abs_path = os.path.dirname(os.path.realpath(__file__))
    static_path = os.path.join(abs_path, '../static');
    converted_path = os.path.join(static_path, 'converted_files');
    originals_path = os.path.join(static_path, 'original_files');
    volumetric_data = import_data(file, originals_path)
    new_file = str(uuid.uuid1())
    write_obj(volumetric_data, converted_path, new_file + '.obj', 3, 50)
    print(new_file + '.obj')
    return { 'path' : new_file}


def get_volume_logic(volume_name):  # noqa: E501
    """Get the obj file

     # noqa: E501

    :param volume_name: get a volume
    :type volume_name: str

    :rtype: InlineResponse200
    """
    
    return send_file('../static/converted_files/' + volume_name, mimetype='multipart/form-data')

def import_data(file, original_folder=None):
	'''import_data:
		Input:
		    -filename : Path to the file and name of the file to import (/path/to/the/file/filename)
		Return:
		    -data : A 3d array containing volumetric data exported from nifti or nrrd file
		This function checks wether the input is a nifti or a nrrd file and builds a 3D array out of it
	'''
	file.save(os.path.join(original_folder, file.filename))
	if '.nii' in file.filename:
		print('nifti')
		nifti_file = nib.load(os.path.join(original_folder, file.filename))
		data = nifti_file.get_fdata()
	if '.nrrd' in file.filename:
		print('nrrd')
		data, _ = nrrd.read(os.path.join(original_folder, file.filename))
	return data


def write_obj(volumetric_data, converted_path=None, output_obj_path='output.obj', step_size=3, threshold=50):
	'''write_obj:
		Input:
			-volumetric_data : a 3D array extracted from nifti or nrrd file
			-converted_path : the path to the folder where the OBJ file will be written
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
	write_vertices_meshes(point_str, mesh_str, os.path.join(converted_path, output_obj_path))


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
