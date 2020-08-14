"""Server for recipes based on fridge ingredients app."""

# importing flask library
from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from flask_debugtoolbar import DebugToolbarExtension

import os # to access api key
import requests # make http requests to api
import json
from pprint import pprint

# import jinja 2 to make it throw errors for undefined variables
from jinja2 import StrictUndefined

from model import connect_to_db
import crud # operations for db


# instance of Flask class, store as app
app = Flask(__name__)

app.secret_key = "secretkey"
app.jinja_env.undefined = StrictUndefined\

# secret key from api
API_KEY = os.environ["SPOONACULAR_KEY"]


@app.route('/')
def homepage():
    """Show homepage."""

    return render_template("root.html")



@app.route('/login', methods=["POST"])
def process_login():

    print('in login route')
    # unencode from JSON
    data = request.get_json()
    # print(data)
    email = data['email']
    password = data['password']

    # function to check if email exists in db
    existing_user = crud.get_user_by_email(email=email)

    message = ''
    success = True

    # check if email exists in db, if so also check correct password
    if existing_user and password == existing_user.password:
        # create session for user
        session['user_id'] = email
        # set new message
        message = 'Valid user. Successfully logged in.'

    # if password does not match, and email already exists in db
    elif existing_user:
        # set new message
        message = 'Incorrect email or password. If new user, you cannot create an account with that email. Try again.'
        # change success status
        success = False

    # new user, add new user to db 
    else:
        new_user = crud.create_user(email=email, password=password)
        # create session for user
        session['user_id'] = email
        # set new message
        message = 'Successfully created new account!'

    return jsonify({'success': success, 'message': message})



@app.route('/logout')
def process_logout():

    del session['user_id']
    flash('logged out!')
    return redirect('/')



@app.route('/search_results', methods=["POST"])
def search_results():

    print("route is hit through js")

    # User's input is a string of comma-separated list of ingredients 
    input_ingredients_str = request.form.get("user_ingredients")
    print(input_ingredients_str)
    # print(request.form)

    # spoonacular's api url
    url = "https://api.spoonacular.com/recipes/complexSearch"
    # api parameters
    payload = {"apiKey": API_KEY, 
               "includeIngredients": input_ingredients_str,
               "addRecipeInformation": True,
               "sort": "max-used-ingredients",
               "instructionsRequired": True,
               "fillIngredients": True,
               "ignorePantry": True,
               # "offset": 5,
               "number": 3,
               } 
    # make http request to spoonacular's complexSearch API
    res = requests.get(url, params=payload)
    # convert json into python dictionary -> API is a List of dictionaries
    data = res.json()
    # print(res.json())

    recipes = data['results']

    return render_template("search_results.html", recipes=recipes)



@app.route('/save_a_recipe')
def add_recipe_to_saved():
    """Add selected recipe to database as saved recipe."""
    pass



@app.route('/saved_recipes')
def show_users_saved_recipes():
    """Show all of user's saved recipes."""
    pass




if __name__ == '__main__':
    # Connect to db first, then app can access it.
    app.debug = True
    connect_to_db(app)
    DebugToolbarExtension(app)
    app.run(host='0.0.0.0')
