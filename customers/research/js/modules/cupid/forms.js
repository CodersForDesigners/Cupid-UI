
/*
 * On focusing away from the UID field, trim out all "invalid" characters
 */
$( document ).on( "change", ".js_uid_field input", function ( event ) {
	$( event.target ).val( ( _i, value ) => value.replace( /[^\d]/g, "" ) );
} );

/*
 * -----
 * On submitting the Customer form, fetch information on the customer
 * -----
 */
$( document ).on( "submit", ".js_customer_form", async function ( event ) {

	/* -----
	 * Prevent the default form submission behaviour
	 * 	which triggers the loading of a new page
	 ----- */
	event.preventDefault();

	var $form = $( event.target );
	var domForm = $form.get( 0 );
	var $feedbackMessage = $form.find( ".js_feedback_message" );

	/* -----
	 * Disable the form
	 ----- */
	$form.find( "input, select, button" ).prop( "disabled", true );
	$feedbackMessage.text( "" );

	/* -----
	 * Pull the data from the form
	 ----- */
		// UID
	var $uid = $form.find( ".js_uid_field input" );

	/* -----
	 * Sanitize the data
	 ----- */
	// UID
	$uid.val( $uid.val().replace( /[^\d]/g, "" ) )


	/* -----
	 * Validate the data
	 ----- */
	// Clear all error messages / indicators from the last submission
	//  	( if there was one )
	$form.find( ".form-validation-error" ).removeClass( "form-validation-error" );

	// Project
	if ( ! $uid.val() )
		$uid.closest( ".js_form_field" ).addClass( "form-validation-error" );

	// If the form has even one validation issue
	// do not proceed
	if ( $form.find( ".form-validation-error" ).length ) {
		$form.find( "input, select, button" ).prop( "disabled", false );
		$feedbackMessage.html( `
			The fields marked in <b style="color: #FB5959">red</b> are either empty or have invalid data.
		` );
		scrollToTop();
		return;
	}
	$feedbackMessage.html( `Querying information on the customer.<br>This will take a few moments.` );
	scrollToTop();

	/* -----
	 * Assemble the data
	 ----- */
	var information = { };
	information.ownerId = __CUPID.user._id;
	information.uid = $uid.val();

	/* -----
	 * Add the customer to the database
	 ----- */
	var customerData;
	try {
		customerData = await queryCustomer( information );
	}
	catch ( e ) {
		$feedbackMessage.html( `
			Information on the customer could not fetched.
			<br>
			Try again after sometime.
			<br>
			If the issue persists, please contact Adi.
		` );
	}
	if ( customerData ) {
		if ( customerData.person )
			$feedbackMessage.html( `1 match found.` );
		else
			$feedbackMessage.html( `${ customerData.possible_persons.length } matches found.` );
		let customerMarkup = renderCustomerData( customerData );
		$( ".js_customer_information" ).html( customerMarkup );
	}
	// Reset and re-enable the form
	scrollToTop();
	domForm.reset();
	$form.find( "input, select, button" ).prop( "disabled", false );

} );



/*
 *
 * Queries information on a customer, given a UID.
 * @args
 * 	uid -> the customer's UID
 * 	ownerId -> the user's internal CRM id
 *
 * Returns a promise with,
 * @params
 * 	customer -> an object containing data on the customer
 *
 */
async function queryCustomer ( data ) {

	var apiEndpoint = __CUPID.settings.apiEndpoint;
	var url = apiEndpoint + "/someone";
	// var url = "http://omega.capi/customers";

	var ajaxRequest = $.ajax( {
		url: url,
		method: "GET",
		data,
		dataType: "json"
	} );

	return new Promise( function ( resolve, reject ) {

		ajaxRequest.done( function ( response ) {
			var customer = response.data;
			resolve( customer );
		} );
		ajaxRequest.fail( function ( jqXHR, textStatus, e ) {
			var errorResponse = __BFS.utils.getErrorResponse( jqXHR, textStatus, e );
			reject( errorResponse );
		} );

	} );

}



/*
 *
 * Renders information on customer(s)
 * @args
 * 	data -> information on one or more customers
 *
 * Returns markup on the customer
 *
 */
function renderCustomerData ( data ) {

	let people;
	if ( data.person )
		people = [ data.person ];
	else
		people = data.possible_persons;

	let peopleMarkup = people.map( function ( person, _i ) {

		let name = "";
		if ( person.names )
			name = `<div class="name small">${ person.names[ 0 ].display }</div>`;

		let images = "";
		if ( person.images )
			images = person.images.map( image => `url( '${ image.url }' )` ).join( "," );

		let phoneNumber = "";
		if ( person.phones ) {
			phoneNumber = `+${ person.phones[ 0 ].country_code }${ person.phones[ 0 ].number }`;
			phoneNumber = `<div class="phone small"><span class="symbol">📞</span> ${ phoneNumber }</div>`
		}

		let dob = "";
		if ( person.dob )
			dob = `
				<div class="small data-point">
					<div class="text-bold">Age:</div>
					<div>${ person.dob.display.replace( /[^\d]/g, "" ) }</div>
				</div>
			`;

		let phoneNumbers = "";
		if ( person.phones ) {
			phoneNumbers = person.phones.map( phone => {
				return `<div>${ phone.country_code }${ phone.number }</div>`;
			} ).join( "" );
			phoneNumbers = `
				<div class="small data-point">
					<div class="text-bold">Phone Numbers(es):</div>
					${ phoneNumbers }
				</div>
			`;
		}

		let emailAddresses = "";
		if ( person.emails ) {
			emailAddresses = person.emails.map( email => {
				return `<div>${ email.address }</div>`;
			} ).join( "" );
			emailAddresses = `
				<div class="small data-point">
					<div class="text-bold">Email Address(es):</div>
					${ emailAddresses }
				</div>
			`;
		}

		let onTheInternet = "";
		if ( person.urls ) {
			onTheInternet = person.urls.map( place => `
				<a class="place-on-web small" href="${ place.url }" target="_blank">${ place[ "@name" ] || place[ "@domain" ] || "(unknown)" }</a>
			` ).join( "" );
			onTheInternet = `
				<div class="section text-left">
					<div class="h6">On the Internet</div>
					<hr>
					<div class="text-center">
						${ onTheInternet }
					</div>
				</div>
			`;
		}

		let career = ""
		if ( person.jobs ) {
			career = "<ul class='career'>" + person.jobs.map( job => `<li class="small">
				${ job.display }
			</li>` ).join( "" ) + "</ul>";
			career = `
				<div class="section text-left">
					<div class="h6">Career</div>
					<hr>
					${ career }
				</div>
			`;
		}

		let education = ""
		if ( person.educations ) {
			education = "<ul class='career'>" + person.educations.map( education => `<li class="small">
				${ educations.display }
			</li>` ).join( "" ) + "</ul>";
			education = `
				<div class="section text-left">
					<div class="h6">Education</div>
					<hr>
					${ education }
				</div>
			`;
		}

		let markup = `
			<div class="customer js_customer_card">
				<div class="summary js_summary">
					<div class="picture" style="background-image: ${ images }">
					</div>
					<div class="basic text-left">
						${ name }
						${ phoneNumber }
						${ person.emails && ( "<div class='email small'><span>✉</span> " + person.emails[ 0 ].address + "</div>" ) || "" }
					</div>
				</div>
				<div class="more-details js_more_details">
					${ onTheInternet }
					<div class="section text-left">
						<div class="h6">Basic</div>
						<hr>
						${ dob }
						${ phoneNumbers }
						${ emailAddresses }
					</div>
					${ career }
					${ education }
				</div>
			</div>
		`;

		return markup;

	} );

	return peopleMarkup.join( "" );

}



function scrollToTop () {
	window.scrollTo( 0, 0 );
};
