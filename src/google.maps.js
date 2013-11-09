angular.module('thinkerit.google.maps', [])
    .directive('googleMaps', [GoogleMapsDirectiveFactory]);

function GoogleMapsDirectiveFactory() {
    return {
        restrict: 'C',
        scope: {},
        link: function (scope, el, attrs) {
            var coords = new google.maps.LatLng(attrs.latitude, attrs.longitude);
            var centeredOnCoords = new google.maps.LatLng(attrs.centeredOnLatitude, attrs.centeredOnLongitude);

            var mapOptions = {
                zoom: 16,
                mapTypeControlOptions: {
                    mapTypeIds: []
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: centeredOnCoords,
                scrollwheel: false
            };

            var map = new google.maps.Map(el[0], mapOptions);

            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: coords
            });

            var contentString = '<div class="map-content"">' +
                '<img class="map-content-logo" src="' + attrs.logo + '" alt="' + attrs.alt + '" />' +
                '<p class="map-content-body">' + attrs.address + '<p>' +
                '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
            });
            google.maps.event.addListener(marker, 'click', function() {
                if (marker.getAnimation() != null)
                    marker.setAnimation(null);
                else
                    marker.setAnimation(google.maps.Animation.BOUNCE);
            });

            infowindow.open(map, marker);

            google.maps.event.addDomListener(window, 'resize', function () {
                map.setCenter(centeredOnCoords);
            });
        }
    };
}