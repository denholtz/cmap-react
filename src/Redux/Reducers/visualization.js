import states from '../../asyncRequestStates';
import * as visualizationActionTypes from '../actionTypes/visualization';

export default function(state, action) {
    switch(action.type) {
        case visualizationActionTypes.QUERY_REQUEST_PROCESSING: return {...state, queryRequestState: states.inProgress};
        case visualizationActionTypes.QUERY_REQUEST_FAILURE: return {...state, queryRequestState: states.failed};
        case visualizationActionTypes.QUERY_REQUEST_SUCCESS: return {...state, queryRequestState: states.succeeded};
        
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_PROCESSING: return {...state, storedProcedureRequestState: states.inProgress}
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_FAILURE: return {...state, storedProcedureRequestState: states.failed}
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_SUCCESS: return {
            ...state, 
            storedProcedureRequestState: states.succeeded,
            data: {
                ...state.data,
                ...action.payload.data
            }
        }


        case visualizationActionTypes.ADD_LAYER: return { // Not currently in use
            ...state,
            layers: [...state.layers, action.payload.newLayer]
        }

        case visualizationActionTypes.STORE_SAMPLE_DATA: return {
            ...state,
            sampleData: action.payload.sampleData
        }

        case visualizationActionTypes.RENDER_MAP: return {
            ...state,
            // maps: [...state.maps, action.payload.mapInfo]
            maps: [action.payload.mapInfo]
        }

        case visualizationActionTypes.RENDER_CHART: return {
            ...state,
            charts: [...state.charts, action.payload.chartInfo]
        }

        default: return state;
    }
}