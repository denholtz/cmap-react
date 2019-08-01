import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

import './App.css';
import Routes from './routes';

import GlobalUIComponentWrapper from './Components/GlobalUIComponentWrapper';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: grey[900]
    },
    primary: {
      main: grey[600]
    }
  },
  typography: {
    useNextVariants: true,
    fontFamily: [
      '"Lato"',
      'sans-serif'
    ].join(',')
  },
  overrides: {
    MuiOutlinedInput: {
      input: {
        padding: '12px 14px'
      }
    },
    MuiFormControl: {
      marginNormal: {
        marginTop: '8px'
      }
    }
  }
});

class App extends Component {

  componentDidCatch = (error, info) => {
    console.log('Error:');
    console.log(error);
    console.log('Info');
    console.log(info);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="App">
          <MuiThemeProvider theme={theme}>
            <GlobalUIComponentWrapper/>
            <Routes />
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default App;