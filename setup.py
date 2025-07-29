from setuptools import setup, find_packages

setup(
    name='csci_env',
    version='0.1.0',
    packages=find_packages(include=['env_extension']),
    include_package_data=True,
    install_requires=[
        'jupyterlab',
        'tornado'
    ],
    entry_points={
        'jupyter_server.server_extensions': [
            'env_extension = env_extension:setup_handlers'
        ]
    }
)
