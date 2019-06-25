import states from '../../asyncRequestStates';
import * as visualizationActionTypes from '../actionTypes/visualization';

export default function(state, action) {
    switch(action.type) {
        case visualizationActionTypes.QUERY_REQUEST_PROCESSING: return {...state, queryRequestState: states.inProgress};
        case visualizationActionTypes.QUERY_REQUEST_FAILURE: return {...state, queryRequestState: states.failed};
        case visualizationActionTypes.QUERY_REQUEST_SUCCESS: return {...state, queryRequestState: states.succeeded};
        
        case visualizationActionTypes.ADD_LAYER: return { // Not currently in use
            ...state,
            layers: [...state.layers, action.payload.newLayer]
        }

        case visualizationActionTypes.STORE_SAMPLE_DATA: return {
            ...state,
            sampleData: action.payload.sampleData
        }

        default: return state;
    }
}