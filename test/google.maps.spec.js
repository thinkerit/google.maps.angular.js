var google;

describe('google.maps.js', function () {
    var directive, scope, elements, attrs;

    beforeEach(module('thinkerit.google.maps'));
    beforeEach(function () {
        google = {
            click:[],
            map: {
                marker: {},
                infoWindow: {}
            },
            maps: {
                LatLng: function (latitude, longitude) {
                    this.latitude = latitude;
                    this.longitude = longitude;
                },
                Map: function (element, options) {
                    google.map.current = this;
                    google.map.element = element;
                    google.map.options = options;
                    this.setCenter = function (it) {
                        google.map.centeredOn = it;
                    }
                },
                Marker: function (ctx) {
                    google.map.marker.current = this;
                    google.map.marker.ctx = ctx;
                    this.setAnimation = function(it) {
                        google.map.marker.animation = it;
                    };
                    this.getAnimation = function() {
                        return google.map.marker.animation;
                    }
                },
                event: {
                    addDomListener: function (el, evt, listener) {
                        google.dom[evt] = {el: el, listener: listener};
                    },
                    addListener:function(el, evt, listener) {
                        google[evt].push({el: el, listener: listener});
                    }
                },
                MapTypeId: {
                    ROADMAP: 'roadmap'
                },
                Animation: {
                    DROP: 'drop',
                    BOUNCE: 'bounce'
                },
                InfoWindow: function (ctx) {
                    google.map.infoWindow.ctx = ctx;
                    this.open = function (map, marker) {
                        google.map.infoWindow.map = map;
                        google.map.infoWindow.marker = marker;
                    }
                }
            },
            dom: {}
        };
        scope = {
        };
        attrs = {
            latitude:'latitude',
            longitude:'longitude',
            centeredOnLatitude: 'centered-on-latitude',
            centeredOnLongitude: 'centered-on-longitude',
            zoom: 'zoom',
            address: 'address',
            logo: 'logo',
            alt: 'alt'
        };
        elements = ['element'];
    });

    describe('google-maps directive', function () {
        beforeEach(inject(function () {
            directive = GoogleMapsDirectiveFactory();
        }));

        it('restrict', function () {
            expect(directive.restrict).toEqual('C');
        });

        it('scope', function () {
            expect(directive.scope).toEqual({});
        });

        function link() {
            directive.link(scope, elements, attrs);
        }

        it('linker installs google maps extensions on given element', function () {
            link();

            expect(google.map.element).toEqual(elements[0]);
            expect(google.map.options.zoom).toEqual(16);
            expect(google.map.options.mapTypeControlOptions.mapTypeIds).toEqual([]);
            expect(google.map.options.mapTypeId).toEqual(google.maps.MapTypeId.ROADMAP);
            expect(google.map.options.center.latitude).toEqual(attrs.centeredOnLatitude);
            expect(google.map.options.center.longitude).toEqual(attrs.centeredOnLongitude);
            expect(google.map.options.scrollwheel).toEqual(false);
        });

        it('linker installs resize listener for the centered on coordinates', function () {
            link();
            google.dom.resize.listener();

            expect(google.dom.resize.el).toEqual(window);
            expect(google.map.centeredOn.latitude).toEqual(attrs.centeredOnLatitude);
            expect(google.map.centeredOn.longitude).toEqual(attrs.centeredOnLongitude);
        });

        it('linker installs marker', function () {
            link();

            expect(google.map.marker.ctx.map).toEqual(google.map.current);
            expect(google.map.marker.ctx.draggable).toEqual(false);
            expect(google.map.marker.ctx.animation).toEqual(google.maps.Animation.DROP);
            expect(google.map.marker.ctx.position.latitude).toEqual(attrs.latitude);
            expect(google.map.marker.ctx.position.longitude).toEqual(attrs.longitude);
        });

        it('linker install opens info window', function () {
            link();

            expect(google.map.infoWindow.map).toEqual(google.map.current);
            expect(google.map.infoWindow.marker).toEqual(google.map.marker.current);
            expect(google.map.infoWindow.ctx.content).toEqual(
                '<div class="map-content"">' +
                '<img class="map-content-logo" src="' + attrs.logo + '" alt="' + attrs.alt + '" />' +
                '<p class="map-content-body">' + attrs.address + '<p>' +
                '</div>');
        });

        it('linker installs marker click listener to open the info window', function() {
            link();
            google.map.infoWindow.map = undefined;
            google.map.infoWindow.marker = undefined;
            google.click[0].listener();

            expect(google.click[0].el).toEqual(google.map.marker.current);
            expect(google.map.infoWindow.map).toEqual(google.map.current);
            expect(google.map.infoWindow.marker).toEqual(google.map.marker.current);
        });

        it('linker installs marker click listener to toggle bounce effect', function() {
            link();
            google.click[1].listener();

            expect(google.click[1].el).toEqual(google.map.marker.current);
            expect(google.map.marker.animation).toEqual(google.maps.Animation.BOUNCE);

            google.click[1].listener();

            expect(google.map.marker.animation).toEqual(null);
        });
    })
});