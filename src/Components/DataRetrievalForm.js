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

// import vizTypes from '../Enums/visualizationTypes';
import vizSubTypes from '../Enums/visualizationSubTypes';

const styles = (theme) => ({
    dataRetrievalFormPaper: {
        width: '1200px',
        height: '205px',
        padding: theme.spacing(2.5),
        // position:'fixed',
        // top: '10px',
        // left: '50%',
        margin: '20px auto',
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
        top: '5px',
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
}

const visualizationSpeedDialActions = [
    {icon: <Map/>, name: vizSubTypes.sectionMap },
    {icon: <Timeline/>, name: vizSubTypes.timeSeries},
    {icon: <BarChart/>, name: vizSubTypes.histogram},
    {icon: <Waves/>, name: vizSubTypes.depthProfile},
    {icon: <Language/>, name: vizSubTypes.geospatialMap},
    {icon: <LeakAdd/>, name: vizSubTypes.contourMap}
];



class DataRetrievalForm extends Component {
    state = {visualizationSpeedDialOpen: false}

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

    handleVisualizationSpeedDialClose = () => {
        this.setState({visualizationSpeedDialOpen: false});
    }

    handleVisualizationSpeedDialOpen = () => {
        if(this.props.fields && this.props.fields.length) this.setState({visualizationSpeedDialOpen: true});
    }

    handleVisualizationSpeedDialClick= () => {
        if(this.props.fields && this.props.fields.length) this.setState({visualizationSpeedDialOpen: !this.state.visualizationSpeedDialOpen});
    }

    render() {
        const { classes, 
            fields, 
            // tableName,
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,  } = this.props;

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
                            onChange={this.props.updateFields}
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
                                    value={dt1}
                                    onChange={this.props.handleStartDateChange}
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
                                    value={dt2}
                                    onChange={this.props.handleEndDateChange}
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
                                    value={depth1}
                                    onChange={this.props.handleChange}
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
                                    value={depth2}
                                    onChange={this.props.handleChange}
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
                                    value={lat1}
                                    onChange={this.props.handleChange}
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
                                    value={lat2}
                                    onChange={this.props.handleChange}
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
                                    value={lon1}
                                    onChange={this.props.handleChange}
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
                                    value={lon2}
                                    onChange={this.props.handleChange}
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
                                    onClick={() => this.props.onVisualize(action.name)}
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