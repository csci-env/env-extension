import os
import json
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado.web

class EnvHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        try:
            user = self.current_user['name']
        except Exception:
            user = getattr(self.current_user, 'name', 'unknown')
        course = os.environ.get('COURSE', 'unknown')
        self.finish(json.dumps({'user': user, 'course': course}))

def setup_handlers(web_app):
    host_pattern = '.*$'
    base_url = web_app.settings['base_url']
    route_pattern = url_path_join(base_url, 'csci-env', 'get_env')
    web_app.add_handlers(host_pattern, [(route_pattern, EnvHandler)])
