import cherrypy
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from models.log import Log as LogModel

env = Environment(loader=FileSystemLoader('templates'))
env.globals['now'] = datetime.now()

class Log(object):

    @cherrypy.expose
    def index(self):
        tmpl = env.get_template('log.html')
        nav = Nav.get()
        content = LogModel().get()
        return tmpl.render(navigation=nav, content=content)

    # @cherrypy.expose
    # def archive(self, year, month=None, day=None):
    #     return "Hello Bar! %s %s %s" % (year, month, day)

class Root(object):

    log = Log()

    @cherrypy.expose
    def index(self):
        tmpl = env.get_template('index.html')
        nav = Nav.get()
        return tmpl.render(navigation=nav)

class Nav(object):
    @staticmethod
    def get():
        return [ {'name': 'View Log', 'href': 'log'} ]

cherrypy.quickstart(Root())
