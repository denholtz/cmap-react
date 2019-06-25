import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import LoginRequiredPrompt from './LoginRequiredPrompt';
import VisualizationController from './VisualizationController';
import VizTooltip from './VizTooltip';
import LoadingSpinner from './LoadingSpinner';

import { showLoginDialog } from '../Redux/actions/ui';
import { queryRequestSend } from '../Redux/actions/visualization';
import states from '../asyncRequestStates';

import DeckGL, {GeoJsonLayer, ColumnLayer} from 'deck.gl';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 14,
  longitude: 50,
  zoom: 3,
  bearing: 0,
  pitch: 30
};

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    sampleData: state.sampleData,
    queryRequestState: state.queryRequestState
})

const mapDispatchToProps = {
    showLoginDialog,
    queryRequestSend
}

const styles = (theme) => ({

})

// darwin nutrient data
const testQuery = "SELECT lat, lon, time, SiO2_darwin_3day, PO4_darwin_3day, DIN_darwin_3day from tblDarwin_Nutrient_3day WHERE time between '1994-01-02' and '1994-01-25' and depth = 5 and lat between 0 and 29 and lon between 33 and 73";
  
class Visualization extends Component {

    state = {
        filteredData: [],
        dateSliderPosition: 3,
        variable: 'SiO2_darwin_3day',
        opacity: 1,
        pickedIndex: null,
        pickedLon: null,
        pickedLat: null
    }

    componentDidMount(){
        if(!this.props.user) this.props.showLoginDialog();
        if(!this.props.sampleData && this.props.user) this.props.queryRequestSend(testQuery);

        if(this.props.sampleData) this.handleDateSliderChange(null, 3);
    }

    componentDidUpdate(prevProps){
        // Filter data on starting date
        if(!prevProps.sampleData && this.props.sampleData){
            this.handleDateSliderChange(null, 3);
        }

        // Send query after user login
        if(!prevProps.user && this.props.user && !this.props.sampleData){
            this.props.queryRequestSend(testQuery);
        }
    }

    handleDateSliderChange = (event, value) => {
        this.setState({...this.state, 
            dateSliderPosition: value,
            pickedInfo: null,
            filteredData: this.props.sampleData.filter(datum => datum.time === `1994-01-${this.state.dateSliderPosition > 9 ? this.state.dateSliderPosition : "0" + this.state.dateSliderPosition}T00:00:00.000Z`)
        });
    }

    handleOpacitySliderChange = (event, value) => {
        this.setState({...this.state, opacity: value})
    }

    handleVariableChange = (event, value) => {
        this.setState({...this.state, 
            variable: value,
            pickedInfo: null,
            filteredData: this.props.sampleData.filter(datum => datum.time === `1994-01-${this.state.dateSliderPosition > 9 ? this.state.dateSliderPosition : "0" + this.state.dateSliderPosition}T00:00:00.000Z`)
        })
    }

    render(){
        const { classes } = this.props;
        const {filteredData} = this.state;

        if(!this.props.user) return <LoginRequiredPrompt/>;
        return (
            <div className={classes.deckWrapper}>
                {this.props.queryRequestState === states.inProgress && <LoadingSpinner size={80} customVariant={'centered'}/>}
                <VisualizationController
                    handleDateSliderChange={this.handleDateSliderChange}
                    dateSliderPosition={this.state.dateSliderPosition}
                    opacity={this.state.opacity}
                    handleOpacitySliderChange={this.handleOpacitySliderChange}
                    variable={this.state.variable}
                    handleVariableChange={this.handleVariableChange}
                    hasData={Boolean(this.props.sampleData && this.props.sampleData.length)}
                />
                {this.state.pickedInfo && <VizTooltip
                    lat={this.state.pickedLat}
                    lon={this.state.pickedLon}
                    info={this.state.pickedInfo}
                />}
                <DeckGL 
                    controller={true} 
                    initialViewState={INITIAL_VIEW_STATE}
                    layers= {[
                        new GeoJsonLayer({
                            id:"base-map",
                            data:COUNTRIES,
                            stroked: true,
                            filled: true,
                            lineWidthMinPixels: 1,
                            opacity: 1,
                            getLineDashArray:[3, 3],
                            getLineColor: [0,0,0],
                            getFillColor: [60,60,60]
                        }),

                        new ColumnLayer({
                            id: `SiO2-layer`,
                            data: filteredData,
                            diskResolution: 12,
                            radius: 27000,
                            extruded: true,
                            pickable: true,
                            autoHighlight: true,
                            elevationScale: 520000,
                            getPosition: d => [d.lon, d.lat],
                            getColor: d => d[this.state.variable] != null ? [255,0,0] : [60,60,60],
                            getElevation: d => d[this.state.variable],
                            opacity: this.state.opacity,
                            visible: this.state.variable === 'SiO2_darwin_3day',
                            onClick: (info) => {
                                let value = filteredData[info.index].SiO2_darwin_3day;
                                if(value){
                                    this.setState({...this.state,
                                        pickedInfo:`SiO2: ${value.toPrecision(6)} mmol`,
                                        pickedLon: info.object.lon,
                                        pickedLat: info.object.lat
                                    })
                                }
                            }
                          }),

                          new ColumnLayer({
                            id: `DIN-layer`,
                            data: filteredData,
                            diskResolution: 12,
                            radius: 27000,
                            extruded: true,
                            pickable: true,
                            autoHighlight: true,
                            elevationScale: 50000,
                            getPosition: d => [d.lon, d.lat],
                            getColor: d => d[this.state.variable] != null ? [0,255,0] : [60,60,60],
                            getElevation: d => d['DIN_darwin_3day'],
                            opacity: this.state.opacity,
                            visible: this.state.variable === 'DIN_darwin_3day',
                            onClick: (info) => {
                                let value = filteredData[info.index].DIN_darwin_3day;
                                if(value){
                                    this.setState({...this.state,
                                        pickedInfo:`DIN: ${value.toPrecision(6)} mmol`,
                                        pickedLon: info.object.lon,
                                        pickedLat: info.object.lat
                                    })
                                }
                            }
                        }),

                        new ColumnLayer({
                            id: `PO4-layer`,
                            data: filteredData,
                            diskResolution: 12,
                            radius: 27000,
                            extruded: true,
                            pickable: true,
                            autoHighlight: true,
                            elevationScale: 2000000,
                            getPosition: d => [d.lon, d.lat],
                            getColor: d => d[this.state.variable] != null ? [43, 172, 219] : [60,60,60],
                            getElevation: d => d['PO4_darwin_3day'],
                            opacity: this.state.opacity,
                            visible: this.state.variable === 'PO4_darwin_3day',
                            onClick: (info) => {
                                let value = filteredData[info.index].PO4_darwin_3day;
                                if(value){
                                    this.setState({...this.state,
                                        pickedInfo:`PO4: ${value.toPrecision(6)} mmol`,
                                        pickedLon: info.object.lon,
                                        pickedLat: info.object.lat
                                    })
                                }
                            }
                        })
                    ]}
                >
                </DeckGL>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Visualization));