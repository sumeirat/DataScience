import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, scoped_session, sessionmaker
from sqlalchemy import create_engine, func

from flask import Flask, jsonify

import datetime as dt
from datetime import datetime
import collections
import os

#################################################
# Database Setup
#################################################

# The Relative Sqlite path doesn't work on my machine thus giving full path
current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = "sqlite:///" + os.path.join(current_dir, "Resources", "hawaii.sqlite")
# Updating the file path for Windows machine (\\ instead of \)
file_path = file_path.replace("\\", "\\\\")

# creating engine
engine = create_engine(file_path, connect_args={'check_same_thread':False}, echo=True)
conn = engine.connect()

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Measurement = Base.classes.measurement
Station = Base.classes.station

# Create our session (link) from Python to the DB
session = Session(bind=conn)

# Calculating the last 12 months range
max_date = session.query(func.max(Measurement.date)).all()
max_date = datetime.strptime(max_date[0][0], "%Y-%m-%d").date()

year_ago = max_date - dt.timedelta(days=365)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/><br/>"
        f"/api/v1.0/precipitation<br/>"
        f"/api/v1.0/stations<br/>"
        f"/api/v1.0/tobs<br/>"
        f"/api/v1.0/2017-02-28<br/>"
        f"/api/v1.0/2017-02-28/2017-03-05<br/>"
    )


@app.route("/api/v1.0/precipitation")
def precipitation():
    """Return a list of all precipitation values"""
    # Query precipitation values
    results = session.query(Measurement.date, Measurement.prcp).\
                filter(Measurement.date >= year_ago, Measurement.prcp != None).\
                order_by(Measurement.date, Measurement.prcp).all()

    # Convert results to a Dictionary using date as the key and prcp as the value
    results_dict = collections.defaultdict(list)
    for x in results:
        results_dict[x.date].append(x.prcp)

    return jsonify(results_dict)


@app.route("/api/v1.0/stations")
def stations():
    """Return a list of stations from the dataset"""
    # Query all stations names
    results = session.query(Station.station, Station.name, func.count(Measurement.id).label("observation_count")).\
                        filter(Station.station == Measurement.station).group_by(Station.station, Station.name).\
                        order_by(func.count(Measurement.prcp).desc()).all()

    all_stations = []
    for station in results:
        station_dict = {}
        station_dict["station"] = station.station
        station_dict["name"] = station.name
        station_dict["count"] = station.observation_count
        all_stations.append(station_dict)

    return jsonify(all_stations)


@app.route("/api/v1.0/tobs")
def tobs():
    """Return a list of Temperature Observations (tobs) for the previous year"""
    # query for the dates and temperature observations from a year from the last data point
    results = session.query(Measurement.date, Measurement.tobs).\
                filter(Measurement.date >= year_ago, Measurement.tobs != None).\
                order_by(Measurement.date, Measurement.tobs).all()

    tobs_data = list(np.ravel(results))

    return jsonify(tobs_data)


@app.route("/api/v1.0/<start>")
@app.route("/api/v1.0/<start>/<end>")
def calc_temps(start, end=max_date):
    """TMIN, TAVG, and TMAX for a list of dates.
    Args:
        start_date (string): A date string in the format %Y-%m-%d
        end_date (string): A date string in the format %Y-%m-%d
    Returns:
        TMIN, TAVE, and TMAX
    """
    results = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
            filter(Measurement.date >= start, Measurement.date <= end).all()

    tmps_data = list(np.ravel(results))

    start_date = datetime.strptime(start, '%Y-%m-%d').date()
    if start_date <= max_date:
        return jsonify(tmps_data)

    return jsonify({"error": f"Start Date ({start}) is out of range. Enter date <= ({max_date})"}), 404


if __name__ == '__main__':
    app.run(debug=True)
