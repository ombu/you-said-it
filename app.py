import cherrypy
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from models.log import Log as LogModel

env = Environment(loader=FileSystemLoader('templates'))
env.globals['now'] = datetime.now()

class Api(object):

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def log(self, **kwargs):
        return self._model().get(**kwargs)

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def search(self, **kwargs):
        return self._model().search(**kwargs)

    def _model(self):
        config = cherrypy.request.app.config['/']
        return LogModel(config['logs_dir'], config['channel'])

class Root(object):

    api = Api()

    @cherrypy.expose
    # @cherrypy.tools.caching(delay=3600)
    def index(self):
        tmpl = env.get_template('log.html')
        config = cherrypy.request.app.config['/']
        return tmpl.render()

cherrypy.quickstart(Root(),config='config.ini')
