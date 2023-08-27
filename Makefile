install:
	python -m pip install -e .
	jupyter labextension develop . --overwrite

build:
	jlpm run build
	python -m build

watch:
	jlpm run watch

run:
	COURSE='csci 1234u' JUPYTERHUB_USER='helloworld@ontariotechu.net' \
		   jupyter lab --port 8200 \
		   --ip 0.0.0.0 \
		   --ServerApp.token= --ServerApp.password= \
		   --ServerApp.notebook_dir=/tmp

