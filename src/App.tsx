import React, {useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {BungieRequests} from "./helpers/comms";
import {RoutingStore} from "./helpers/Routing";
import {Auth} from "./components/auth/Auth";
import {ShowCase} from "./components/showcase/ShowCase";
import {ThemeProvider} from '@mui/material/styles';
import {theme} from "./helpers/theme";
import {SnackbarProvider} from "notistack";

function App() {

  useEffect(() => {
    if (!BungieRequests.isLoggedIn) {
      RoutingStore.routeToLogin();
    } else {
      RoutingStore.routeToMain();
    }
  }, []);

  return (
    <SnackbarProvider maxSnack={5} anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}>
      <ThemeProvider theme={theme}>
        <Router>

          <Switch>
            <Route exact path="/">
              <ShowCase/>
            </Route>
            <Route path="/login">
              <Auth/>
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;
