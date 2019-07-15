import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select from 'react-select';

// import createFilterOptions from "react-select-fast-filter-options";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import Switch from '@material-ui/core/Switch';
// import { capitalize } from '@material-ui/core/utils';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import { 
    BarChart,
    Map,
    Timeline,
    Waves,
    Language,
    LeakAdd
} from '@material-ui/icons';

import { storedProcedureRequestSend } from '../Redux/actions/visualization';
import { retrievalRequestSend } from '../Redux/actions/catalog';

const styles = (theme) => ({
    dataRetrievalFormPaper: {
        width: '1200px',
        height: '230px',
        padding: theme.spacing(2.5),
        position:'fixed',
        left: '100px',
        top: '10px',
        zIndex: 2,
        paddingTop: theme.spacing(1.5)
    },

    dataRetrievalFormField: {
        padding:`0px ${theme.spacing(1)}`
    },

    retrieveDataButton: {
        margin:'10px auto'
    },

    variableSelect: {
        margin: '0 30px 20px 30px'
    },

    visualizationSpeedDial: {
        position: 'relative',
        top: '20px',
        left: '30px'
    },

    visualizeButton: {
        borderRadius:'10%',
        width: '100px',
        height:'40px',
        margin: 'auto 0',
        backgroundColor: theme.palet
    },

    visualizeButtonText: {
        dominantBaseline: "middle",
        textAnchor: "middle"
    }
})

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog
})

const mapDispatchToProps = {
    storedProcedureRequestSend,
    retrievalRequestSend
}

const visualizationSpeedDialActions = [
    {icon: <Map/>, name: 'Section Map' },
    {icon: <Timeline/>, name: 'Time Series'},
    {icon: <BarChart/>, name: 'Histogram'},
    {icon: <Waves/>, name: 'Depth Profile'},
    {icon: <Language/>, name: 'Geospatial Map'},
    {icon: <LeakAdd/>, name: 'Contour Map'}
];

const mapVizTypeToStoredProcedure = (vizType) => {
    const mapping = {
        'Section Map': 'uspSectionMap',
        'Time Series': 'uspTimeSeries',
        'Histogram': 'uspSpaceTime',
        'Depth Profile': 'uspDepthProfile',
        'Geospatial Map': 'uspSpaceTime',
        'Contour Map': 'uspSpaceTime'
    }

    return mapping[vizType];
}

class DataRetrievalForm extends Component {
    state = {
        spName: 'uspSpaceTime',
        tableName: [],
        fields:[],
        depth1: '',
        depth2: '',
        dt1: '',
        dt2: '',
        lat1: '',
        lat2: '',
        lon1: '',
        lon2: '',

        visualizationSpeedDialOpen: false,
    }

    componentDidMount = () => {
        if(!this.props.catalog) this.props.retrievalRequestSend();
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    onVisualize = (vizType) => {
        const { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2 } = this.state;
        let payload = {
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            fields: this.state.fields && this.state.fields.map(field => field.value)[0],
            tableName: this.state.fields.map(field => field.data.tableName)[0],
            spName: mapVizTypeToStoredProcedure(vizType)
        };
    
        this.props.storedProcedureRequestSend(payload);
    }

    // Includes every variable that returns true when filtering
    // variableWrapper parameter is {label, value, variable object}
    filterVariables = (variableWrapper, searchString) => {

        // Create one string from all column values (using Boolean to remove falsey elements)
        let values = Object.values(variableWrapper.data).filter(Boolean).join(' ');

        let searchTerms = searchString.split(' ');

        // array.some method will return a true as soon as we failed to
        // find one search term, which we negate.
        return !searchTerms.some(term => values.indexOf(term) === -1)
    }

    // Update the "fields" state piece when the variables input changes
    updateFields = (fields) => {
        this.setState({fields});
    }

    handleVisualizationSpeedDialClose = () => {
        this.setState({visualizationSpeedDialOpen: false});
    }

    handleVisualizationSpeedDialOpen = () => {
        this.setState({visualizationSpeedDialOpen: true});
    }

    handleVisualizationSpeedDialClick= () => {
        this.setState({visualizationSpeedDialOpen: !this.state.visualizationSpeedDialOpen});
    }

    render() {
        const { classes } = this.props;

        const { fields } = this.state;

        const options = (this.props.catalog && this.props.catalog.map(variable => ({
            value: variable.variable,
            label: variable.variable === variable.longName ? variable.variable : variable.variable + ' : ' + variable.longName,
            data: variable
        })))
            || [];

        return (
            <div>
                <Paper className={classes.dataRetrievalFormPaper}>
                        <Select
                            isMulti
                            className={classes.variableSelect}
                            isClearable
                            autoFocus
                            escapeClearsValue
                            backspaceRemovesValue
                            name="fields"
                            label="Variables"
                            options={options}
                            onChange={this.updateFields}
                            value={fields}
                            placeholder="Variables"
                            styles={{
                                menu: provided => ({ ...provided, zIndex: 9999 })
                            }}
                        />
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <TextField
                                    id="startDate"
                                    label="Start Date"
                                    type="date"
                                    name="dt1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.dt1}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endDate"
                                    label="End Date"
                                    type="date"
                                    name="dt2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.dt2}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="startDepth"
                                    label="Start Depth(m)"
                                    name="depth1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.depth1}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endDepth"
                                    label="End Depth(m)"
                                    name="depth2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.depth2}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="startLat"
                                    label="Start Latitude(deg)"
                                    name="lat1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.lat1}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endLat"
                                    label="End Latitude(deg)"
                                    name="lat2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.lat2}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="startLon"
                                    label="Start Longitude(deg)"
                                    name="lon1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.lon1}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endLon"
                                    label="End Longitude(deg)"
                                    name="lon2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={this.state.lon2}
                                    onChange={this.handleChange}
                                    variant='outlined'
                                />
                            </Grid>   
                        </Grid>
                        <SpeedDial
                            ariaLabel="Visualization Speed Dial"
                            ButtonProps={{
                                variant: 'round',
                                classes: {
                                    root: classes.visualizeButton
                                },
                                color: 'primary'
                            }}
                            className={classes.visualizationSpeedDial}
                            icon={<svg height="30" width="200">
                                    <text x="50%" y="50%" fill='white' fontVariant='normal' className={classes.visualizeButtonText}>Visualize</text>
                                </svg>}
                            onBlur={this.handleVisualizationSpeedDialClose}
                            onClick={this.handleVisualizationSpeedDialClick}
                            onClose={this.handleVisualizationSpeedDialClose}
                            onFocus={this.handleVisualizationSpeedDialOpen}
                            onMouseEnter={this.handleVisualizationSpeedDialOpen}
                            onMouseLeave={this.handleVisualizationSpeedDialClose}
                            open={this.state.visualizationSpeedDialOpen}
                            direction= 'right'
                        >
                            {visualizationSpeedDialActions.map(action => (                                   
                                <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipTitle={action.name}
                                    onClick={() => this.onVisualize(action.name)}
                                    tooltipPlacement='bottom'
                                />
                            ))}

                        </SpeedDial>                            
                </Paper>
            </div>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataRetrievalForm));