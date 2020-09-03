const { Badge, Button, ButtonGroup, Col, Container, Collapse, Form, FormControl, InputGroup, ListGroup, Navbar, ToggleButton, ToggleButtonGroup, Modal, Alert, OverlayTrigger, CardColumns, Card, CardDeck, CardGroup, } = ReactBootstrap;

const Router = ReactRouterDOM.BrowserRouter;
const Route = ReactRouterDOM.Route;
const Link = ReactRouterDOM.Link;
const Prompt = ReactRouterDOM.Prompt;
const Switch = ReactRouterDOM.Switch;
const Redirect = ReactRouterDOM.Redirect;
const useHistory = ReactRouterDOM.useHistory;
const useLocation = ReactRouterDOM.useLocation;
const useParams = ReactRouterDOM.useParams;


function Homepage(props) {
  let history = useHistory();
  const [appear, setAppear] = React.useState(false);
  const {loggedIn} = React.useContext(AuthContext);
  const handleClick = () => {
    history.push('create-account')
  };

  return (
    <div id='homepage'>
      <h1> Hello! Welcome to the Homepage! </h1>

      <SearchBar setData={props.setData}/>
      <br></br>

      <Login />
      <br></br>
      
      <div style={{display: (loggedIn ? 'none' : 'block')}}>
        <p>Don't have an account? Click here to start!</p>

        <Button variant='info' onClick={() => {setAppear(!appear)}}>
          Create New Account!
        </Button>

        <Collapse in={appear}>
          <div id='create-account-collapse'>
            <CreateAccount />
          </div>
        </Collapse>
      </div>
    </div>
    );
}


function SavedRecipes(props) {
  const [savedList, setSavedList] = React.useState([]);
  const [removed, updateRemoved] = React.useState(false);
  // retrieve list of user's saved recipes
  React.useEffect(() => {
    console.log('useeffect in saved recipes');
    fetch('/api/saved_recipes')
    .then(res => res.json())
    .then(savedData => {
      setSavedList(savedData.saved_recipes); 
    })
  }, [removed]);
  // console.log('saved list of recipes', savedList);
  const handleRemove = () => {
    updateRemoved(true);
  };

  return (
    <div>
      <section id='saved-recipes'>
        {!savedList.length ? <p>You haven't saved any recipes yet!</p>
          : (savedList.map((recipe) => 
                <RecipeCard key={recipe.recipe_id}
                            fromPath={'saved-recipes'}
                            recipeDetails={recipe}
                            img={recipe.image}
                            title={recipe.title}
                            recipeId={recipe.recipe_id}
                            servings={recipe.servings}
                            prepMins={recipe.prep_mins}
                            cookMins={recipe.cooking_mins}
                            readyMins={recipe.ready_mins}
                            buttonStatus={recipe.favorite}
                            handleRemove={handleRemove}
                            />
                        ))
        }
      </section>
    </div>
    );
}


function SearchResults(props) {
  // resultsList is data from Spoonacular's API.
  const resultsList = props.resultsList;
  const [checkedRecipes, updateCheckedRecipes] = React.useState([]);
  // check search results for any user's saved recipes
  React.useEffect(() => {
    console.log('in check results use effect');
    fetch('/api/check_results', {
      method: 'POST',
      body: JSON.stringify({results_list: resultsList}),
      headers: { 'Content-Type': 'application/json'},
      credentials:'include'
    })
    .then(res => res.json())
    .then(data => {
      updateCheckedRecipes(data.checked_recipes);
    });
  }, [resultsList]);

  console.log('results', checkedRecipes);


  return (
    <div>
      <section id='search-results'>
        {!props.resultsList.length ? <p>Searching...</p>
          : (checkedRecipes.map((recipe) => 
              <RecipeCard key={recipe.recipe_id}
                          fromPath={'search-results'}
                          recipeDetails={recipe}
                          img={recipe.image}
                          title={recipe.title}
                          recipeId={recipe.recipe_id}
                          servings={recipe.servings}
                          prepMins={recipe.prep_mins}
                          cookMins={recipe.cooking_mins}
                          readyMins={recipe.ready_mins}
                          buttonStatus={recipe.is_saved}
                          />
                      ))
        }
      </section>
    </div>
    );
}


function SearchBar(props) {
  let history = useHistory();
  const [ingredients, setIngredients] = React.useState('');

  const searchRecipes = () => {
    fetch('/api/search_results', {
      method: 'POST',
      body: JSON.stringify({ingredients: ingredients}),
      headers: { 'Content-Type': 'application/json'},
      credentials:'include'
    })
    .then((response) => response.json())
    .then((data) => props.setData(data))
    .then(setIngredients(''));

    history.push("/search-results");
  };

  return (
    <div>
      <section className='search-bar'>
        What's in your fridge? 
        <input type='text'
               className='user-search'
               onChange={(e) => {setIngredients(e.target.value)}}
               value={ingredients}
               placeholder='e.g. beef, potato'>
        </input>

        <Button onClick={searchRecipes}>
          Let's get cookin!
          </Button>
      </section>
    </div>
    );
}

// creating instance of context
const AuthContext = React.createContext(null);


function App() {
  console.log('in app component');
  // data from Spoonacular API search results
  const [data, setData] = React.useState([]);
  console.log((data));
  const [loggedIn, setLoggedIn] = React.useState(null);
  // each time setLoggedIn is updated in App, useEffect will fetch logged in from server to persist data during reloads
  React.useEffect(() => {
    console.log('in app useEffect');
    fetch('/api/check_session')
      .then(res => res.json())
      .then(data => setLoggedIn(data.in_session))
  }, [loggedIn]);
  console.log('app loggedIn status', loggedIn);
  // state for handling showing modal in nav links
  const [show, setShow] = React.useState(false);
  const handleShow = () => {setShow(true)};
  const handleClose = () => {setShow(false)};

  // enum to conditionally render navbar links with loggedIn 
  const NavLinks = {
    true: (<nav>
            <li> 
              <Link to="/saved-recipes">Saved Recipes</Link>
            </li>
            <li> 
              <Link to="/search-results">Search Reults</Link>
            </li>
            <li>
              <Link to="/logout">Log Out</Link>
            </li>
          </nav>
      ),

    false: (<nav>
              <li>
                <Link to="/login" onClick={handleShow}>
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/create-account" onClick={handleShow}>Create An Account</Link>
              </li>
              <li> 
                <Link to="/search-results">Search Reults</Link>
              </li>
          </nav>
      )
  };

    // use React Router for front-end routing
    return (
      <AuthContext.Provider value={{loggedIn, setLoggedIn}}>
        <Router>
          <div>
            <nav>
              <ul>
                <li>
                  <Link to="/homepage">Homepage</Link>
                </li>

                <li>
                  <Link to="/test-page">Test</Link>
                </li>
                
                {NavLinks[loggedIn]}

                <SearchBar setData={setData} />

              </ul>
            </nav>

            <Switch>

              <Route path="/:fromPath/recipe-details/:id" >
                <RecipeDetails />
              </Route>

              <Route exact path="/saved-recipes">
                <SavedRecipes 
                />
              </Route>

              <Route exact path="/search-results">
                <SearchResults resultsList={data} />
              </Route>

              <Route exact path="/login">
                <UserAuthModal show={show}
                               handleClose={handleClose}
                               newUser={false}/>
                <Homepage setData={setData}/>
              </Route>

              <Route exact path="/create-account">
                <UserAuthModal show={show}
                               handleClose={handleClose}
                               newUser={true}/>
                <Homepage setData={setData}/>
              </Route>

              <Route exact path="/logout">
                <Logout />
              </Route>

              <Route exact path="/test-page">
                <TestPage />
              </Route>

              <Route path="/homepage">
                <Homepage setData={setData} />
              </Route>

              <Route exact path="/">
                <Homepage setData={setData} />
              </Route>
            </Switch>
          </div>
        </Router>
    </AuthContext.Provider>
  );
}

// homepage path '/' has to be last or else will render homepage when hits a '/' even if for other path. or specify "exact path" 


// render the function component App
ReactDOM.render(<App />, document.getElementById('root'))