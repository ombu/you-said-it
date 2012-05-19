import cherrypy
import sqlite3
from datetime import datetime, timedelta
from pytz import timezone

class Log(object):

    def __init__(self, path_to_db, channel):
        self.conn = sqlite3.connect(path_to_db + '/logs.sqlite')
        self.channel = channel

    def get(self, **kwargs):
        # set start & end dates for query
        if kwargs['day']:
            start = parse_client_date(kwargs['day'])
            one_day = timedelta(days=1)
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

def parse_client_date(string):
    """
    Accepts client date format string (e.g. '2012-05-01') and returns a datetime
    object with the app's Timezone (currently hardcoded to US/Pacific.
    """
    d = datetime.strptime(string, '%Y-%m-%d')
    return d.replace(tzinfo=timezone('US/Pacific'))

