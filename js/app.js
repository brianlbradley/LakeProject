
var siteAddress = [



    {
        name: "Chilly Willy's",
        address: "4300 Martin St S, Cropwell, AL 35054"
    },

    {
        name: "Pier 59",
        address: "1366 Rivercrest Dr"
    }, {
        name: "The Ark",
        address: "Riverside, Al 35135"
    }, {
        name: "Fat Man's BBQ",
        address: "10179 US Hwy 231, Cropwell, AL 35054"
    }, {
        name: "Pell City Coffee Company",
        address: "1605 Martin St S, Pell City, AL 35128"
    }, {
        name: "Stemley Station",
        address: "7421 Stemley Bridge Rd, Talladega, AL 35160"

    }, {
        name: "The Shack",
        address: "7744 Stemley Bridge Rd, Talladega, AL 35160"

    }, {
        name: "Montana Saloon",
        address: "75023 Hwy 77, Lincoln, AL 35096"

    }

]

var map;
// Place Constructor
var Place = function(data) {
    this.name = ko.observable(data.name);
    this.address = ko.observable(data.address);
    //this.marker = ko.observable(data.marker);
    //  this.rating = ko.observable(data.rating);
    //  this.text = ko.observable(data.text);
    //   console.log(this.rating);
    // this.contentString = ko.observable('');
    //this.latlng = ko.observable(data.latlng);
    // this.LatLng = ko.observable(data.LatLng);
    // console.log(this.marker);
}


//Load Initial Map Object
var initMap = function(data) {


    map = {
        zoom: 12,
        center: new google.maps.LatLng(0,0),
        mapTypeId: 'roadmap'
    };



    //Loading ViewModel after initMap is created becasue of map errors. Credit Udacity coach Heidi Kassimer for this tip.
    // Inititates KnockOut
    ko.applyBindings(new ViewModel());

}

var ViewModel = function() {//
    var self = this;
    //makes a reference for the list of places for the html
    this.placeList = ko.observableArray([]);

    // Adds the listItems (name and address) Code adapted from Ben Jaffe's CatClickers tutorial
    siteAddress.forEach(function(placeItem) {
        self.placeList.push(new Place(placeItem));
        console.log(placeItem);
    });//


    map = new google.maps.Map($('#map')[0], map);
    var marker;
    var infowindow = new google.maps.InfoWindow({
        content: 'none',
        maxWidth: 200


    });//
//Automatic LatLngBounds
var bounds = new google.maps.LatLngBounds();

    //Use GeoCoding to get the LatLng-thought it was better than having to type in Lat's and Long's in the data model.
    self.placeList().forEach(function(placeItem) {
        $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + placeItem.address() + "&key=AIzaSyAB7BN8tkg05jkP4fsGts_jxQw_EPPrEW0",
            function(data) {
                var p = data.results[0].geometry.location
                var latitude = p.lat;
                var longitude = p.lng;

                var contentString = '<div class = infohead> <h3>' + placeItem.name() + '</h3> </div>'; //Doesn't recognize components of FourSquare e.g. placeItem.rating

                var latlng = new google.maps.LatLng(p.lat, p.lng);
                marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    address: placeItem.address(),
                    title: placeItem.name(),
                    contentString: contentString,
                    animation: google.maps.Animation.DROP,
                    icon: "img/boating.svg"

                })

                 bounds.extend(latlng);
                 map.fitBounds(bounds);
                 //console.log(placeItem);

                      // Credit Lyle for help with displaying info Windows https://discussions.udacity.com/t/infowindow-not-opening/162696/8
                self.placeList().forEach(function(placeItem) {

                    //Partial Code adapted from https://github.com/joannawicz/Paradise-city
                    var results, canonicalUrl, rating, status
                    $.ajax({
                        url: 'https://api.foursquare.com/v2/venues/explore',
                        type: 'GET',
                        dataType: 'json',

                        data: {
                            client_id: 'UDAIBO0KLAVZAXOV1QCFE5WMROTWBLH5EVIGT1YT4QE5GBZI',
                            client_secret: 'UN3EV2ASZGLNVNKEUSMUNMRLA2WDOZVC1SSWD33SUESQ1FFT',
                            v: '20160407',
                            limit: 1,
                            ll: latitude + ',' + longitude,
                            query: placeItem.name(),
                            async: true
                                //limit: 8,
                                //radius: 10000,
                                //sortByDistance: 1,
                                // openNow: true,

                        },//


                        success: function(results) {
                            //console.log(results);
                            results = results.response.groups[0].items[0];
                            //result = respsonse.groups[0].items;
                            //placeItem.url = results.url;
                            placeItem.text = results.tips[0].text;
                            placeItem.canonicalUrl = results.tips[0].canonicalUrl;
                            placeItem.rating = results.venue.rating;
                            placeItem.phone = results.venue.contact.formattedPhone;
                            // console.log(placeItem.phone)
                            //placeItem.status = results.hours["status"];
                            // placeItem.name = results.name;
                            // console.log(placeItem.rating)
                            // console.log(placeItem.url)
                            // console.log(placeItem.canonicalUrl)
                            // console.log(placeItem.status)


                            google.maps.event.addListener(placeItem.marker, "click", function() {
                                infowindow.open(map, this);
                                infowindow.setContent(this.contentString + '<div> <p class = rating> Rating:' + placeItem.rating + '</p><h4> Phone:' + placeItem.phone + '</h4><p class = infobody>' + placeItem.text + '</p><p class = canonical><a href=' + placeItem.canonicalUrl + '>FourSquare</a></p></div>');
                                placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                                setTimeout(function(){ placeItem.marker.setAnimation(null); }, 5000);

                            });//

                        },//

                        error: function(e) {
                                google.maps.event.addListener(placeItem.marker, "click", function() {
                                infowindow.open(map, this);
                                infowindow.setContent("<h4> FourSquare info unavailable for" +placeItem.name()+ " at the moment. Please try back later.</h4>");
                            });
                        }//



                    }) //end of ajax




                }) //end of placeList json




                //reference for the showWindows function
                placeItem.marker = marker;
                // console.log(placeItem.marker);






            }).fail(function (){
                alert("Google Maps down at the moment. Please try back later");
                console.log("Google Maps down at the moment. Please try back later");
            });


    });


    //infoWindow bound to the list items
    self.showWindows = function(placeItem) { //this recognizes GeoCoding and AJAX
        //console.log(placeItem);
        google.maps.event.trigger(placeItem.marker, 'click')
    }

    // *****Filter Section***** Code adapted from http://codepen.io/prather-mcs/pen/KpjbNN?editors=001

    //All markers visible based on user input until filtered out by input
    self.visiblePlaces = ko.observableArray();

    self.placeList().forEach(function(place) {
        self.visiblePlaces.push(place);
    });
    //keeps track of user input with data-bind

    self.userInput = ko.observable('');

    // Looks at the names of the places the Markers stand for
    // and looks at the user input in the search box.  If the user input
    //can be found in the place name, the place stays visible and
    //all other markers are removed
    self.filterMarkers = function() {
        var searchInput = self.userInput().toLowerCase();
        self.visiblePlaces.removeAll();
        self.placeList().forEach(function(place) {
            place.marker.setVisible(false);
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visiblePlaces.push(place);
            }

        });

        self.visiblePlaces().forEach(function(place) {
            place.marker.setVisible(true);

        });


    }



}; //viewModel


//  https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282
function googleError() {
    document.getElementById('map').innterHTML = "Google Maps currently unavailable. Check internet or try later";
    console.log("Google maps not available at the moment. Please try back later");
    alert("Google Maps not available at the moment. Please try back later");
};
//this is ridiculous
//I'm working on GitHub
// Map Key AIzaSyBO7zaTpALyiQJOvnvA7_muATPumXQT2uU
//GeoSync Key  AIzaSyAB7BN8tkg05jkP4fsGts_jxQw_EPPrEW0
//Global map variable
//FourSquare Client id UDAIBO0KLAVZAXOV1QCFE5WMROTWBLH5EVIGT1YT4QE5GBZI
//Client secret UN3EV2ASZGLNVNKEUSMUNMRLA2WDOZVC1SSWD33SUESQ1FFT
//  https://api.foursquare.com/v2/venues/' + '?client_id=UDAIBO0KLAVZAXOV1QCFE5WMROTWBLH5EVIGT1YT4QE5GBZI&client_secret=UN3EV2ASZGLNVNKEUSMUNMRLA2WDOZVC1SSWD33SUESQ1FFT=20160404


//"https://maps.googleapis.com/maps/api/geocode/json?address=" + places.address + "&key=AIzaSyAB7BN8tkg05jkP4fsGts_jxQw_EPPrEW0",