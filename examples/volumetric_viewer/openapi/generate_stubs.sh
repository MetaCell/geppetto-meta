java -jar ./openapi-generator-cli-4.2.3.jar generate -i openapi.yaml -g python-flask -o ../backend --package-name volumetric_viewer
java -jar ./openapi-generator-cli-4.2.3.jar generate -i openapi.yaml -g javascript -o ../frontend/src/rest --package-name volumetric_viewer
