import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select from 'react-select';

// import createFilterOptions from "react-select-fast-filter-options";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import { DatePicker } from "@material-ui/pickers";

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

import vizTypes from '../Enums/visualizationTypes';
import vizSubTypes from '../Enums/visualizationSubTypes';

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
        backgroundColor: theme.palette
    },

    visualizeButtonText: {
        dominantBaseline: "middle",
        textAnchor: "middle"
    },

    displayNone: {
        display: 'none'
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
    {icon: <Map/>, name: vizSubTypes.sectionMap },
    {icon: <Timeline/>, name: vizSubTypes.timeSeries},
    {icon: <BarChart/>, name: vizSubTypes.histogram},
    {icon: <Waves/>, name: vizSubTypes.depthProfile},
    {icon: <Language/>, name: vizSubTypes.geospatialMap},
    {icon: <LeakAdd/>, name: vizSubTypes.contourMap},
    {icon: <Map/>, name: vizSubTypes.hexMap}
];

const mapVizType = (vizType) => {
    const mapping = {
        [vizSubTypes.sectionMap]: {
            sp: 'uspSectionMap',
            type: vizTypes.chart,
            subType: vizSubTypes.sectionMap
        }, 
        [vizSubTypes.timeSeries]: {
            sp: 'uspTimeSeries',
            type: vizTypes.chart,
            subType: vizSubTypes.timeSeries
        },
        [vizSubTypes.histogram]: {
            sp: 'uspSpaceTime',
            type: vizTypes.chart,
            subType: vizSubTypes.histogram
        },
        [vizSubTypes.depthProfile]: {
            sp: 'uspDepthProfile',
            type: vizTypes.chart,
            subType: vizSubTypes.depthProfile
        },
        [vizSubTypes.geospatialMap]: {
            sp: 'uspSpaceTime',
            type: vizTypes.map,
            subType: vizSubTypes.geospatialMap
        },
        [vizSubTypes.contourMap]: {
            sp: 'uspSpaceTime',
            type: vizTypes.chart,
            subType: vizSubTypes.contourMap
        },
        [vizSubTypes.hexMap]: {
            sp: 'uspSpaceTime',
            type:vizTypes.map,
            subType: vizSubTypes.hexMap
        }
    }

    return mapping[vizType];
}

class DataRetrievalForm extends Component {
    state = {
        tableName: [],
        fields:[],
        depth1: '0',
        depth2: '0',
        dt1: '2017-05-15',
        dt2: '2017-05-15',
        lat1: '30',
        lat2: '40',
        lon1: '-60',
        lon2: '-50',

        visualizationSpeedDialOpen: false,
    }

    componentDidMount = () => {
        if(!this.props.catalog) this.props.retrievalRequestSend();
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleStartDateChange = (date) => {
        this.setState({...this.state, dt1:date.toISOString().slice(0,10)});
        // console.log(date);
        // console.log(date.toISODate());
    }

    handleEndDateChange = (date) => {
        this.setState({...this.state, dt2:date.toISOString().slice(0,10)});
        // console.log(date);
        // console.log(date.toISODate());
    }

    onVisualize = (vizType) => {
        const { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2 } = this.state;
        let mapping = mapVizType(vizType);
        let parameters = {
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            fields: this.state.fields && this.state.fields.map(field => field.value)[0],
            tableName: this.state.fields && this.state.fields.map(field => field.data.tableName)[0],
            spName: mapping.sp
        };

        let payload = {
            parameters,
            type: mapping.type,
            subType: mapping.subType,
            metaData: this.state.fields && this.state.fields[0]
        }
    
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
        if(this.state.fields && this.state.fields.length) this.setState({visualizationSpeedDialOpen: true});
    }

    handleVisualizationSpeedDialClick= () => {
        if(this.state.fields && this.state.fields.length) this.setState({visualizationSpeedDialOpen: !this.state.visualizationSpeedDialOpen});
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
            <div className={this.props.showUI ? '' : classes.displayNone}>
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
                                <DatePicker
                                    id="startDate"
                                    label="Start Date"
                                    name="dt1"
                                    format='yyyy-MM-dd'
                                    disableFuture
                                    autoOk
                                    value={this.state.dt1}
                                    onChange={this.handleStartDateChange}
                                    inputVariant='outlined'
                                    variant='inline'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <DatePicker
                                    id="endDate"
                                    label="End Date"
                                    name="dt2"
                                    format='yyyy-MM-dd'
                                    disableFuture
                                    autoOk
                                    value={this.state.dt2}
                                    onChange={this.handleEndDateChange}
                                    inputVariant='outlined'
                                    variant='inline'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
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
                            disabled
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