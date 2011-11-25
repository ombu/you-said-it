import cherrypy
import sqlite3
from datetime import datetime, date, timedelta

class Log(object):

    def __init__(self, path_to_db, channel):
        self.conn = sqlite3.connect(path_to_db + '/logs.sqlite')
        self.channel = channel

    def get(self, **kwargs):
        # set start & end dates for query
        now = datetime.now()
        one_day = timedelta(days=1)
        start = kwargs.get('start', date(now.year, now.month, now.day))
        start = date(2011, 11,4)
        end = kwargs.get('end', start + one_day)
        keywords = {'start': start, 'end': end}
        return self.__getEntries(**keywords)

    def search(self, **kwargs):
        c = self.conn.cursor()
        placeholders = (self.channel, '%'+kwargs['q']+'%')
        query = """select * from logs where log_channel = ? 
        and log_message like ?
        """;
        return c.execute(query, placeholders).fetchall()

    def __getEntries(self, **kwargs):
        c = self.conn.cursor()
        placeholders = (self.channel, kwargs['start'].strftime('%s'),
            kwargs['end'].strftime('%s'))
        query = """select * from logs where log_channel = ? 
        and log_timestamp >= ?
        and log_timestamp < ?
        """;
        return c.execute(query, placeholders).fetchall()
