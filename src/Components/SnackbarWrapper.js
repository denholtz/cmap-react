import React from 'react';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';

import { snackbarClose } from '../Redux/actions/ui';

const mapStateToProps = (state, ownProps) => ({
    snackbarIsOpen: state.snackbarIsOpen,
    snackbarMessage: state.snackbarMessage
})

const mapDispatchToProps = {
    snackbarClose,
}

const SnackbarWrapper = (props) => {
    return (
        
        <React.Fragment>
            <Snackbar 
                autoHideDuration={3500} 
                message={props.snackbarMessage}
                onClose={props.snackbarClose}
                open={props.snackbarIsOpen}
                anchorOrigin={{horizontal:'center', vertical:'top'}}
            />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SnackbarWrapper);