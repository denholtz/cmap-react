import React, { Component } from 'react';
import { connect } from 'react-redux';

import vizTypes from '../Enums/visualizationTypes';
import vizSubTypes from '../Enums/visualizationSubTypes';

import { withStyles } from '@material-ui/core/styles';

import LoginRequiredPrompt from './LoginRequiredPrompt';
// import VisualizationController from './VisualizationController';
// import VizTooltip from './VizTooltip';
import LoadingSpinner from './LoadingSpinner';
import DataRetrievalForm from './DataRetrievalForm';
import DebugButton from './DebugButton';
import ClearVisualizationsButton from  './ClearVisualizationsButton';

import { showLoginDialog } from '../Redux/actions/ui';
import { queryRequestSend, storedProcedureRequestSend } from '../Redux/actions/visualization';
import { retrievalRequestSend } from '../Redux/actions/catalog';

import states from '../asyncRequestStates';

import { loadModules } from '@esri/react-arcgis';

// import {COORDINATE_SYSTEM} from '@deck.gl/core';
// import DeckGL, {GeoJsonLayer, ColumnLayer, GridLayer, PointCloudLayer} from 'deck.gl';
// import {AmbientLight, LightingEffect} from '@deck.gl/core';
// import {HexagonLayer} from '@deck.gl/aggregation-layers';

import GoBackButton from './GoBackButton';
import Charts from './Charts';
import ToggleChartViewButton from './ToggleChartViewButton';
import ToggleHideUIButton from './ToggleHideUIButton';
import MapContainer from './MapContainer';
// import subTypes from '../Enums/visualizationSubTypes';

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
            type: vizTypes.chart,
            subType: vizSubTypes.geospatialMap
        },
        [vizSubTypes.contourMap]: {
            sp: 'uspSpaceTime',
            type: vizTypes.chart,
            subType: vizSubTypes.contourMap
        }
    }

    return mapping[vizType];
}

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    sampleData: state.sampleData,
    queryRequestState: state.queryRequestState,
    maps: state.maps,
    charts: state.charts,
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState
})

const mapDispatchToProps = {
    showLoginDialog,
    queryRequestSend,
    retrievalRequestSend,
    storedProcedureRequestSend
}

const styles = (theme) => ({
    displayNone: {
        display: 'none'
    }
})

class Visualization extends Component {

    state = {
        filteredData: [],
        dateSliderPosition: 3,
        variable: 'SiO2_darwin_3day',
        opacity: 1,
        pickedIndex: null,
        pickedLon: null,
        pickedLat: null,
        showCharts: false,
        showUI: true,

        spParams: {
            tableName: [],
            fields:[],
            depth1: '0',
            depth2: '0',
            dt1: '2017-05-15',
            dt2: '2017-05-15',
            lat1: '30',
            lat2: '40',
            lon1: '-60',
            lon2: '-50'
        }
    }

    async componentDidMount(){
        if(!this.props.catalog) this.props.retrievalRequestSend();

        const esriModuleNames = [
            'AreaMeasurement3D',
            'Search',
            'Fullscreen',
            'EsriSceneView',
        ];

        var loadedModules = await loadModules([
            'esri/widgets/AreaMeasurement3D',
            'esri/widgets/Search',
            'esri/widgets/Fullscreen',
            'esri/views/SceneView',
        ]);

        var esriModules = esriModuleNames.reduce((accumulator, currentValue, currentIndex) => {
            accumulator[currentValue] = loadedModules[currentIndex];
            return accumulator;
        }, {});

        this.setState({...this.state, esriModules});
    }

    componentDidUpdate(prevProps){
        // Filter data on starting date
        if(!prevProps.sampleData && this.props.sampleData){
            this.handleDateSliderChange(null, 3);
        }
    }

    handleChange = (event) => {
        this.setState({...this.state, spParams: {...this.state.spParams, [event.target.name]: event.target.value}})
    };

    handleStartDateChange = (date) => {
        this.setState({...this.state, spParams: {...this.state.spParams, dt1:date.toISOString().slice(0,10)}});
    }

    handleEndDateChange = (date) => {
        this.setState({...this.state, spParams: {...this.state.spParams, dt2:date.toISOString().slice(0,10)}});
    }

    onVisualize = (vizType) => {
        const { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2 } = this.state.spParams;
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
            fields: this.state.spParams.fields && this.state.spParams.fields.map(field => field.value)[0],
            tableName: this.state.spParams.fields && this.state.spParams.fields.map(field => field.data.tableName)[0],
            spName: mapping.sp
        };

        let payload = {
            parameters,
            type: mapping.type,
            subType: mapping.subType,
            metadata: this.state.spParams.fields && this.state.spParams.fields[0].data
        }
    
        this.props.storedProcedureRequestSend(payload);
    }

    // Update the "fields" state piece when the variables input changes
    updateFields = (fields) => {
        this.setState({...this.state, spParams: {...this.state.spParams, fields}});
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

    toggleChartView = () => {
        this.setState({...this.state, showCharts: !this.state.showCharts});
    }

    toggleShowUI = () => {
        this.setState({...this.state, showUI: !this.state.showUI});
    }

    updateDomainFromMap = (coordinates) => {
        if(!coordinates || !coordinates.length) return null;
        
        var lons = coordinates.map(a => a[0]);
        var lats = coordinates.map(a => a[1]);

        var newCoordinates = {
            lat1: Math.min(...lats),
            lat2: Math.max(...lats),
            lon1: Math.min(...lons),
            lon2: Math.max(...lons)
        };

        this.setState({...this.state, spParams: {...this.state.spParams, ...newCoordinates}});
    }

    render(){
        const { classes } = this.props;

        const { lon1, lon2, lat1, lat2 } = this.state;

        if(!this.props.user) return <LoginRequiredPrompt/>
 
        return (
            <div>
                <DataRetrievalForm 
                    handleChange={this.handleChange} 
                    handleStartDateChange={this.handleStartDateChange} 
                    handleEndDateChange={this.handleEndDateChange} 
                    showUI={this.state.showUI}
                    onVisualize={this.onVisualize}
                    updateFields={this.updateFields}
                   {...this.state.spParams}
                />
                <GoBackButton/>
                <ToggleChartViewButton toggleChartView={this.toggleChartView} showCharts={this.state.showCharts}/>
                <ToggleHideUIButton toggleShowUI={this.toggleShowUI} showUI={this.state.showUI}/>
                <DebugButton statePieces={['maps','charts', 'storedProcedureRequestState']}/>
                <ClearVisualizationsButton/>
                { this.state.esriModules &&
                    <div className={`${this.state.showCharts ? classes.displayNone : ''}`}>
                        <MapContainer 
                            updateMapFromDomain={this.updateDomainFromMap}
                            measurementPositions={[[lon1, lat1, 0], [lon1, lat2, 0], [lon2, lat2, 0], [lon2, lat1, 0]]}
                            esriModules={this.state.esriModules}
                        />
                    </div>
                }

                {this.props.storedProcedureRequestState === states.inProgress && <LoadingSpinner customVariant='centered' size='36'/>}

                <div className={this.state.showCharts ? '' : classes.displayNone}>
                    <Charts/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Visualization));


// Viz demo layers
// new ColumnLayer({
//     id: `SiO2-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 520000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [255,0,0] : [60,60,60],
//     getElevation: d => d[this.state.variable],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'SiO2_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].SiO2_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`SiO2: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
//   }),

//   new ColumnLayer({
//     id: `DIN-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 50000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [0,255,0] : [60,60,60],
//     getElevation: d => d['DIN_darwin_3day'],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'DIN_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].DIN_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`DIN: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
// }),

// new ColumnLayer({
//     id: `PO4-layer`,
//     data: filteredData,
//     diskResolution: 12,
//     radius: 27000,
//     extruded: true,
//     pickable: true,
//     autoHighlight: true,
//     elevationScale: 2000000,
//     getPosition: d => [d.lon, d.lat],
//     getColor: d => d[this.state.variable] != null ? [43, 172, 219] : [60,60,60],
//     getElevation: d => d['PO4_darwin_3day'],
//     opacity: this.state.opacity,
//     visible: this.state.variable === 'PO4_darwin_3day',
//     onClick: (info) => {
//         let value = filteredData[info.index].PO4_darwin_3day;
//         if(value){
//             this.setState({...this.state,
//                 pickedInfo:`PO4: ${value.toPrecision(6)} mmol`,
//                 pickedLon: info.object.lon,
//                 pickedLat: info.object.lat
//             })
//         }
//     }
// })

// Deck.gl stuff:

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
// const COUNTRIES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson';

// const spatialResolutionToMetersMapping = {
//     '1/12° X 1/12°': null,
//     '1/2° X 1/2°': null,
//     '1/25° X 1/25°': null,
//     '1/4° X 1/4°': 30000,
//     '1° X 1°': null,
//     '4km X 4km': null,
//     '70km X 70km': null,
//     'Irregular': null
// }

// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1000000.0
//   });

// const lightingEffect = new LightingEffect({ambientLight});

// const INITIAL_VIEW_STATE = {
//   latitude: 35,
//   longitude: -50,
//   zoom: 3,
//   bearing: 0,
//   pitch: 10
// };

// let colormap = require('colormap')

// const paletteSize = 48

// let colors = colormap({
//     colormap: 'hot',
//     format: 'rba',
//     alpha: [255,255],
//     nshades: paletteSize
// })

// const minMax = (array, key) => {
//     let min = array[0][key];
//     let max = array[0][key];
//     for(let i = 0; i < array.length; i ++){
//         if(array[i][key] > max || max === null) max = array[i][key];
//         if(array[i][key] < min || min === null) min = array[i][key];
//     }
//     return [min, max];
// }

// const handleGeoSpatialMap = (map) => {
//     if(!map.data.length) {
//         console.log(`No data in map ${map.parameters.fields}`);
//         console.log(map);
//         return;
//     }

//     let minAndMaxArray = minMax(map.data, map.parameters.fields);
//     let min = minAndMaxArray[0];
//     let max = minAndMaxArray[1];
//     let step = (max - min) / paletteSize;
//     console.log(min, max, step);

//     console.log(`Rendering ${map.data.length} data points.`);

//     const getColor = (row) => {
//         let index = Math.floor((row[map.parameters.fields] - min) / step);
//         return colors[index] ? colors[index].slice(0,3) : null;
//     }

//     return new PointCloudLayer({
//     id: 'point-cloud-layer',
//     data: map.data,
//     pickable: false,
//     coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
//     sizeUnits:'meters',
//     pointSize: 28000,
//     getPosition: d => d[map.parameters.fields] ? [d.lon, d.lat] : [600,600],
//     getColor,
//     opacity: 1,
//     // material: null,
//     parameters:{
//         depthTest: false
//       }
//   })
// }

// const handleHexMap = (map) => {
//     if(!map.data.length) {
//         console.log(`No data in map ${map.parameters.fields}`);
//         console.log(map);
//         return;
//     }

//     console.log(`Binning and rendering ${map.data.length} data points.`);

//     // const getColorWeight = (point) => point[map.parameters.fields];
//     const reducer = (accumulator, point) => accumulator + point[map.parameters.fields];
//     const getColorValue = (points) => {
//         return points.reduce(reducer, 0)/points.length;
//     }

//     return new HexagonLayer({
//     id: 'hexagon-later',
//     radius: 30000,
//     data: map.data,
//     pickable: false,
//     getColorValue,
//     // colorAggregation: 'MEAN',
//     // getColorWeight,
//     getPosition: d => d[map.parameters.fields] ? [d.lon, d.lat] : [0,0],
//   })
// }

/* <DeckGL 
                        // effects={[lightingEffect]}
                        material={null}
                        controller
                        parameters={{
                            depthTest: false
                          }}
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
                            ...processedMaps
                        ]
                        }
                    >
                    </DeckGL> */

// Inside render function
// const processedMaps = this.props.maps.map(map => {
//     switch(map.subType){
//         case subTypes.geospatialMap:
//             return handleGeoSpatialMap(map);
//         case subTypes.hexMap:
//             return handleHexMap(map);
//         default:
//             console.log(`Unknown map type ${map.subType}`);
//     }
// })
