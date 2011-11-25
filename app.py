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
        return self.model().get(**kwargs)

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def search(self, **kwargs):
        return self.model().search(**kwargs)

    def model(self):
        config = cherrypy.request.app.config['/']
        return LogModel(config['logs_dir'], config['channel'])

class Log(object):
    @cherrypy.expose
    def index(self):
        tmpl = env.get_template('log.html')
        nav = Nav.get()
        config = cherrypy.request.app.config['/']
        return tmpl.render(navigation=nav)

class Root(object):

    log = Log()
    api = Api()

    @cherrypy.expose
    def index(self):
        tmpl = env.get_template('index.html')
        nav = Nav.get()
        return tmpl.render(navigation=nav)

class Nav(object):
    @staticmethod
    def get():
        return [ {'name': 'View Log', 'href': 'log'} ]

cherrypy.quickstart(Root(),config='config.ini')
