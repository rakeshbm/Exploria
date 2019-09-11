# Exploria - *find your next stop*

A responsive serverless webpage that allows users to search for places using the Google Places API and display the results on the same page below the form. The details of the selected place includes an info table, photos of the place, map and route search form, and reviews.
The webpage also supports adding places to and removing places from favorites list and posting place info to Twitter.

Implementation details:

- Search form is implemented using a Bootstrap form.
- Validation of mandatory fields is done using AngularJS.
- Autocomplete is implemented by using the autocomplete service provided by Google.
- User location is obtained using the geolocation api ip-api.com
- AJAX calls are used to invoke Node.js script hosted on Amazon Web Services.
- The Google Maps Geocoding API is used to determine the latitude and longitude of the place the user specifies.
- The Google Places API "Nearby Search" service is used to retrieve places in and around the specified location.
- JavaScript is used to parse JSON objects on the client side.
- Pagination of results is achieved using "next_page_token" field of the "Nearby Search" JSON object.
- Monent.js library is used to display "Daily open hours" of the selected place.
- The directions service of Google Maps API is used to display navigation details.
- A Tweet Web Intent is used to tweet about the selected place.
- Yelp Fusion API is used to display Yelp reviews of the place.
- HTML5 local storage is used to save and remove favorite places.
- The sliding effect animation is achieved using AngularJS.


### Snapshots:


Search form:
<kbd><img src = "images/search.PNG"></kbd>


Search results:
<kbd><img src = "images/results.PNG"></kbd>


Selected place info:
<kbd><img src = "images/Place.PNG"></kbd>


Place photos:
<kbd><img src = "images/photos.PNG"></kbd>


Navigation details:
<kbd><img src = "images/Navigation.PNG"></kbd>


Place reviews:
<kbd><img src = "images/Reviews.PNG"></kbd>


Tweet feature:
<kbd><img src = "images/Twitter.PNG"></kbd>


Place hours:
<kbd><img src = "images/Timings.PNG"></kbd>


Favorites:
<kbd><img src = "images/Favorites.PNG"></kbd>


Form validation:
<kbd><img src = "images/validation.PNG"></kbd>
