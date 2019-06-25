import React from 'react'
import ReactDOM from 'react-dom'
import './index.css';
import 'ag-grid-enterprise';

import * as serviceWorker from './serviceWorker';

import { Provider } from 'react-redux'
import store from './Redux/store';

import App from './App'

import {LicenseManager} from "ag-grid-enterprise";
LicenseManager.setLicenseKey("Evaluation_License-_Not_For_Production_Valid_Until_2_July_2019__MTU2MjAyMjAwMDAwMA==caa187fc06c8c340bcb9897b015a3cb5");

const rootElement = document.getElementById('root')
ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
  rootElement
)

serviceWorker.unregister();
