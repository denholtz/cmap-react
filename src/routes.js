import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './Components/Home';
import Catalog from './Components/Catalog';
import Register from './Components/Register';
import Visualization from './Components/Visualization';
import TopNavBar from './Components/TopNavBar';
import SnackbarWrapper from './Components/SnackbarWrapper';
import Charts from './Components/Charts';

export default props => (
    <BrowserRouter>
        <TopNavBar/>
        <SnackbarWrapper/>
        <Switch>
          <Route exact path='/apikeymanagement' component={ Home } />
          <Route exact path='/' component={ Catalog } />
          <Route exact path='/register' component={ Register } />
          <Route exact path='/visualization' component={ Visualization } />
          <Route exact path='/visualization/charts' component={ Charts } />
        </Switch>
    </BrowserRouter>
  )