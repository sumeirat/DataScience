from splinter import Browser
from bs4 import BeautifulSoup
import pandas as pd
import time

def init_browser():
    # @NOTE: Replace the path with your actual path to the chromedriver
    executable_path = {'executable_path': 'chromedriver.exe'}
    return Browser("chrome", **executable_path, headless=False)


def scrape():
    # Scarpes Mars data from differnt websites and returns the results in a dictionary
    
    results = {}

    browser = init_browser()

    # Recent Mars News Title and News Text
    nasa_url = "https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest"
    browser.visit(nasa_url)
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    try:
        news_title = soup.find('div', class_='content_title').text
        news_p = soup.find("div", class_="article_teaser_body").text
        results["news_title"] = news_title
        results["news_p"] = news_p
    except AttributeError as e:
        print(e)

    # Mars Featured Image URL
    jpl_url = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(jpl_url)
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    try:
        featured_image = soup.find("a", id="full_image")
        featured_image_url = "https://www.jpl.nasa.gov" + featured_image["data-fancybox-href"]
        results["featured_image_url"] = featured_image_url
    except AttributeError as e:
        print(e)
    
    # Mars Weather Info from Mars Weather Twitter Handle
    mars_weather_twitter_url = "https://twitter.com/marswxreport?lang=en"
    browser.visit(mars_weather_twitter_url)
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    try:
        tweets = soup.select("div.stream-item-header span.FullNameGroup")
        for tweet in tweets:
            if tweet.select("strong.fullname")[0].text == "Mars Weather":
                tweet_content = tweet.parent.parent.parent
                mars_weather = tweet_content.select("div.js-tweet-text-container p.tweet-text")[0].find(text=True)
                mars_weather = mars_weather.splitlines()[0]
                break
        results["mars_weather"] = mars_weather
    except AttributeError as e:
        print(e)

    # Mars Planet Profile Table Info
    mars_facts_url = "https://space-facts.com/mars/"
    mars_facts_df = pd.read_html(mars_facts_url)[0]
    mars_facts_df.rename(columns={0: "Description", 1: "Value"}, inplace=True)
    mars_facts_table = mars_facts_df.to_html(index=False)
    results["mars_facts_table"] = mars_facts_table

    # Mars Hemispheres Titles and Image URLs
    mars_hemispheres_url = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"
    browser.visit(mars_hemispheres_url)
    time.sleep(1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    try:
        img_items = soup.select("div.description")
        hemisphere_image_urls = []

        # Visit Each Hemisphere page to Get The Full Size Image URL of the Hemisphere
        for item in img_items:
            title = item.find("h3").text
            
            img_link = "https://astrogeology.usgs.gov" + item.find("a", class_="itemLink product-item")["href"]
            browser.visit(img_link)
            time.sleep(0.5)
            html = browser.html
            soup = BeautifulSoup(html, 'html.parser')
            
            img_url = soup.select_one("div.downloads a")["href"]
            hemisphere_image_urls.append({"title": title, "img_url": img_url})
        results["hemisphere_image_urls"] = hemisphere_image_urls
    except AttributeError as e:
        print(e)


    return results
