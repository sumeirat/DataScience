# import necessary libraries
from flask import Flask, render_template, redirect
from flask_pymongo import PyMongo
import scrape_mars

# create instance of Flask app
app = Flask(__name__)

# Use flask_pymongo to set up mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/mars_app"
mongo = PyMongo(app)


# create route that renders index.html template and finds documents from mongo
@app.route("/")
def home():

    # Find data
    mars_data_html = mongo.db.mars_collection.find_one()

    # return template and data
    return render_template("index.html", mars_data = mars_data_html)


# Route that will trigger scrape functions
@app.route("/scrape")
def scrape():

    # Run scraped function
    mars_data = scrape_mars.scrape()

    # Clear database and insert new mars_data into database
    mongo.db.mars_collection.remove({})
    mongo.db.mars_collection.insert_one(mars_data)

    # Redirect back to home page
    return redirect("/", code=302)


if __name__ == "__main__":
    app.run(debug=True)
