import { put, takeLatest, all, call } from 'redux-saga/effects';
import Cookies from 'js-cookie';

import * as userActions from './actions/user';
import * as catalogActions from './actions/catalog';
import * as interfaceActions from './actions/ui';
import * as visualizationActions from './actions/visualization';

import * as userActionTypes from './actionTypes/user';
import * as catalogActionTypes from './actionTypes/catalog';
import * as visualizationActionTypes from './actionTypes/visualization';

import vizTypes from '../Enums/visualizationTypes';

import api from '../api';

function* userLogin(action) {
    yield put(userActions.userLoginRequestProcessing());
    let result = yield call(api.user.login, action.payload);
    if(result.ok){
        var userInfo = JSON.parse(Cookies.get('UserInfo'));
        yield put(userActions.userLoginRequestSuccess());
        yield put(interfaceActions.hideLoginDialog());
        yield put(userActions.storeInfo(userInfo));
        yield put(interfaceActions.snackbarOpen('Login was successful!'))
    } else {
        yield put(userActions.userLoginRequestFailure());
        yield put(interfaceActions.snackbarOpen('Login failed.'));
    }
}

function* userLogout(){
    yield call(api.user.logout);
    yield put(userActions.destroyInfo());
    yield put(interfaceActions.snackbarOpen('You have logged out.'))
}

function* userRegistration(action){
    yield put(userActions.userRegistrationRequestProcessing());
    let result = yield call(api.user.register, action.payload);
    if(result.ok){
        yield put(interfaceActions.registrationNextActiveStep());
        yield put(userActions.userRegistrationRequestSuccess());
        yield put(interfaceActions.snackbarOpen('Registration was successful. Please log in.'));
        yield put(interfaceActions.showLoginDialog());
    } else {
        yield put(userActions.userRegistrationRequestFailure());
        yield put(interfaceActions.snackbarOpen('Registration failed.'))
    }
}

function* userValidation(action){
    yield put(userActions.userValidationRequestProcessing());
    let result = yield call(api.user.validate, action.payload);
    let isValid = yield result.json();
    if(isValid){
        yield put(userActions.userValidationRequestSuccess());
        yield put(interfaceActions.registrationNextActiveStep());
    } else {
        yield put(userActions.userValidationRequestFailure());
    }
}

function* catalogRetrieval(action){
    yield put(catalogActions.retrievalRequestProcessing());
    let catalog = yield call(api.catalog.retrieve);
    if(!catalog) {
        yield put(catalogActions.retrievalRequestFailure());
    } else{
        yield put(catalogActions.retrievalRequestSuccess(catalog));
    }
}

function* keyRetrieval(action){
    let result = yield call(api.user.keyRetrieval);
    if(!result){
        yield put(userActions.keyRetrievalRequestFailure());
        yield put(interfaceActions.snackbarOpen('API Key Retrieval Failed'));
    } else {
        yield put(userActions.keyRetrievalRequestSuccess(result.keys));
    }
}

function* keyCreation(action){
    yield put(userActions.keyCreationRequestProcessing());
    let result = yield call(api.user.keyCreation, action.payload.description);
    if(!result.ok) yield put(interfaceActions.snackbarOpen("We were unable to create a new API key."));
    else {
        yield put(interfaceActions.snackbarOpen("A new API key was created"));
        yield put(userActions.keyCreationRequestSuccess());
        yield put(userActions.keyRetrievalRequestSend());        
    }
}

function* queryRequest(action){
    yield put(visualizationActions.queryRequestProcessing());
    let result = yield call(api.visualization.queryRequest, action.payload.query);
    yield put(visualizationActions.storeSampleData(result));
    yield put(visualizationActions.queryRequestSuccess());
}

function* storedProcedureRequest(action){
    console.log(action);
    console.log(`Retrieving ${action.payload.parameters.fields}`);
    yield put(visualizationActions.storedProcedureRequestProcessing());
    let result = yield call(api.visualization.storedProcedureRequest, action.payload.parameters);
    console.log(`Got ${action.payload.parameters.fields}`);
    if(!result){
        yield put(visualizationActions.storedProcedureRequestFailure());
        yield put(interfaceActions.snackbarOpen("Request failed"));
    } else {
        yield put(visualizationActions.storedProcedureRequestSuccess());
        yield put(interfaceActions.snackbarOpen(`${action.payload.subType} ${action.payload.parameters.fields} is ready`));
        
        if(action.payload.type === vizTypes.chart){
            console.log('Added chart');
            yield put(visualizationActions.addChart({...action.payload, data: result}));
        } else if (action.payload.type === vizTypes.map){
            yield put(visualizationActions.clearMaps());
            console.log('Added map');
            yield put(visualizationActions.addMap({...action.payload, data: result}));           
        }
    }
}

function* watchUserLogin() {
    yield takeLatest(userActionTypes.LOGIN_REQUEST_SEND, userLogin);
}

function * watchUserLogout() {
    yield takeLatest(userActionTypes.LOG_OUT, userLogout)
}

function* watchUserRegistration() {
    yield takeLatest(userActionTypes.REGISTRATION_REQUEST_SEND, userRegistration);
}

function* watchUserValidation(){
    yield takeLatest(userActionTypes.VALIDATION_REQUEST_SEND, userValidation);
}

function* watchCatalogRetrieval(){
    yield takeLatest(catalogActionTypes.RETRIEVAL_REQUEST_SEND, catalogRetrieval);
}

function* watchKeyRetrieval(){
    yield takeLatest(userActionTypes.KEY_RETRIEVAL_REQUEST_SEND, keyRetrieval);
}

function* watchKeyCreationRequest(){
    yield takeLatest(userActionTypes.KEY_CREATION_REQUEST_SEND, keyCreation);
}

function* watchQueryRequest(){
    yield takeLatest(visualizationActionTypes.QUERY_REQUEST_SEND, queryRequest);
}

function* watchStoredProcedureRequest(){
    yield takeLatest(visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND, storedProcedureRequest);
}
  
export default function* rootSaga() {
    yield all([
        watchUserLogin(),
        watchUserRegistration(),
        watchUserValidation(),
        watchUserLogout(),
        watchCatalogRetrieval(),
        watchKeyRetrieval(),
        watchKeyCreationRequest(),
        watchQueryRequest(),
        watchStoredProcedureRequest()
    ])
}
  