
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
		let customerMarkup = await renderCustomerData( customerData );
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
async function renderCustomerData ( data ) {

	let people;
	if ( data.person )
		people = [ data.person ];
	else
		people = data.possible_persons;

	let peopleMarkup = await Promise.all( people.map( async function ( person, _i ) {

		let name = "";
		if ( person.name )
			name = `<div class="name small">${ person.name }</div>`;

		let images = "";
		// let accessibleImages;
		if ( person.images ) {
			// accessibleImages = await Promise.all( person.images.map( function ( image ) {
			// 		return __BFS.utils.isImageAccessible( image.url );
			// } ) );
			// accessibleImages = accessibleImages.filter( image => image );
			images = person.images.map( image => `url( '${ image }' )` ).join( "," );
		}

		let phoneNumber = "";
		if ( person.phoneNumber ) {
			phoneNumber = `<div class="phone small"><span class="symbol">📞</span> ${ person.phoneNumber }</div>`
		}

		let dob = "";
		if ( person.dateOfBirth )
			dob = `
				<div class="small data-point">
					<div class="text-bold">Age:</div>
					<div>${ person.dateOfBirth }</div>
				</div>
			`;

		let phoneNumbers = "";
		if ( person.contact && person.contact.otherPhoneNumbers ) {
			phoneNumbers = person.contact.otherPhoneNumbers.map( phone => {
				return `<div>${ phone }</div>`;
			} ).join( "" );
			phoneNumbers = `
				<div class="small data-point">
					<div class="text-bold">Phone Number(s):</div>
					${ phoneNumbers }
				</div>
			`;
		}

		let emailAddresses = "";
		let personEmailAddresses = [ ];
		if ( person.emailAddress ) personEmailAddresses = [ person.emailAddress ];
		if ( person.contact && person.contact.otherEmailAddresses ) {
			personEmailAddresses = personEmailAddresses.concat( person.contact.otherEmailAddresses );
			emailAddresses = personEmailAddresses.map( email => {
				return `<div>${ email }</div>`;
			} ).join( "" );
			emailAddresses = `
				<div class="small data-point">
					<div class="text-bold">Email Address(es):</div>
					${ emailAddresses }
				</div>
			`;
		}

		let onTheInternet = "";
		if ( person.onTheInteret ) {
			onTheInternet = person.onTheInteret.map( place => `
				<a class="place-on-web small" href="${ place.url }" target="_blank">${ place.name }</a>
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
		if ( person.career ) {
			career = "<ul class='career'>" + person.career.map( job => `<li class="small">
				${ job }
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
		if ( person.education ) {
			education = "<ul class='career'>" + person.education.map( phase => `<li class="small">
				${ phase }
			</li>` ).join( "" ) + "</ul>";
			education = `
				<div class="section text-left">
					<div class="h6">Education</div>
					<hr>
					${ education }
				</div>
			`;
		}

		let gallery = ""
		if ( person.images ) {
			gallery = "<ul class='gallery'>" + person.images.map( image => `<li><a href="${ image }" target="_blank"><img src="${ image }"></a></li>` ).join( "" ) + "</ul>";
			gallery = `
				<div class="section">
					<div class="h6">Gallery</div>
					<hr>
					${ gallery }
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
						${ personEmailAddresses && ( "<div class='email small'><span>✉</span> " + personEmailAddresses[ 0 ] + "</div>" ) || "" }
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
					${ gallery }
				</div>
			</div>
		`;

		return Promise.resolve( markup );

	} ) );

	return peopleMarkup.join( "" );

}



function scrollToTop () {
	window.scrollTo( 0, 0 );
};
