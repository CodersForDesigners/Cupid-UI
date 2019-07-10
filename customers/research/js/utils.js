
/*
 *
 * Utility functions
 *
 */
// Establish global state
window.__BFS = window.__BFS || { };

( function ( __BFS ) {









var utils = __BFS.utils || { };



/*
 *
 * Handle error / exception response helper
 *
 */
function getErrorResponse ( jqXHR, textStatus, e ) {
	var code = -1;
	var message;
	if ( jqXHR.responseJSON ) {
		code = jqXHR.responseJSON.statusCode;
		message = jqXHR.responseJSON.statusMessage;
	}
	else if ( typeof e == "object" ) {
		message = e.stack;
	}
	else {
		message = jqXHR.responseText;
	}
	return {
		code,
		message
	};
}
utils.getErrorResponse = getErrorResponse;









__BFS.utils = utils;

}( window.__BFS ) );
