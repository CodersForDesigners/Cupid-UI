<?php

/*
 *
 * Get client-specific data
 *
 */
$cupid = json_decode( file_get_contents( __DIR__ . '/../../environment/configuration/cupid.json' ), true );
$apiEndpoint = $cupid[ 'apiEndpoint' ];
$crm = json_decode( file_get_contents( __DIR__ . '/../../environment/configuration/crm-zoho.json' ), true );
$zohoOrganizationId = $crm[ 'organizationId' ];

$baseURL = explode( $_SERVER[ 'DOCUMENT_ROOT' ], __DIR__ )[ 1 ] . '/';

?>

<!DOCTYPE html>
<html>

<head>

	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">

	<title>Customer Research</title>

	<base href="<?= $baseURL ?>">

	<link rel="stylesheet" type="text/css" href="css/1_normalize.css">
	<style type="text/css">

		/*
		 * Universal Box Sizing with Inheritance and Vendor Prefix
		 */

		html {
			box-sizing: border-box;
		}
		*, *:before, *:after {
			box-sizing: inherit;
		}

	</style>
	<link rel="stylesheet" type="text/css" href="css/4_helper.css">
	<link rel="stylesheet" type="text/css" href="css/3_grid.css">
	<link rel="stylesheet" type="text/css" href="css/5_stylescape.css">
	<link rel="stylesheet" type="text/css" href="css/pages/customer-research.css">
	<!-- Fonts -->
	<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,400i,700&display=swap" rel="stylesheet">

	<script type="text/javascript">

		/*
		 * Cupid Settings
		 */
		// Establish global state
		window.__CUPID = window.__CUPID || { };

		( function ( __CUPID ) {

			var settings = __CUPID.settings || { };


				// API endpoint
			settings.apiEndpoint = "<?php echo $apiEndpoint ?>";
				// Zoho organization id
			settings.zohoOrganizationId = "<?php echo $zohoOrganizationId ?>";


			__CUPID.settings = settings;

		}( window.__CUPID ) );

	</script>

</head>

<body>

	<div class="container text-center">

		<div class="h3 space-half-top-bottom">Customer Research</div>

		<form class="columns large-4 text-left js_customer_form">
			<label class="form-field space-quarter-top-bottom js_form_field js_uid_field">
				<span class="small">Please provide the UID of the customer.</span>
				<input class="" type="text" name="uid">
			</label>

			<button class="" type="submit">
				Submit
			</button>

			<p class="sans-serif label text-italic js_feedback_message"></p>

		</form>

	</div>

	<div class="container text-center">
		<section class="customer-section columns small-12 large-5 js_customer_information"></section>
	</div>





<script type="text/javascript" src="js/utils.js"></script>
<script type="text/javascript" src="plugins/jquery/jQuery-v3.3.1.min.js"></script>
<script type="text/javascript" src="js/modules/cupid/forms.js"></script>
<script type="text/javascript">

	function getCustomerData () {

		var ajaxRequest = $.ajax( {
			url: "c.json",
			method: "GET",
			dataType: "json"
		} );

		return new Promise( function ( resolve, reject ) {

			ajaxRequest.done( function ( response ) {
				var customer = response;
				resolve( customer );
			} );
			ajaxRequest.fail( function ( jqXHR, textStatus, e ) {
				var errorResponse = __BFS.utils.getErrorResponse( jqXHR, textStatus, e );
				reject( errorResponse );
			} );

		} );

	}

	$( async function () {

		// Pull the user-related data from the URL
		let queryParams = ( new URLSearchParams( location.search.slice( 1 ) ) );
		let roleId = queryParams.get( "roleId" );
		let profileId = queryParams.get( "profileId" );
		__CUPID.user = {
			_id: queryParams.get( "userId" )
		};


		/*
		 * Customer Card
		 * 	Open / Close the card when clicked on
		 */
		$( document ).on( "click", ".js_customer_card .js_summary", function ( event ) {

			let $card = $( event.target ).closest( ".js_customer_card" );
			$card.toggleClass( "open" );
			$card.find( ".js_more_details" ).toggleClass( "show" );

		} );

	} );

</script>





</body>

</html>
