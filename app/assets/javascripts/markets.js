$(document).ready(function() {

  console.log(Gmaps.map)

  Gmaps.map.callback = function() {};

  var PriceRangeFilter = {
    min: Market.min_revenue,
    max: Market.max_revenue,
  };
  $( "#filtered-rev" ).val( "$" + PriceRangeFilter.min + " - $" + PriceRangeFilter.max );

  var AllPropertyFilters = [];

  $( "#revenue-range" ).slider({
      range: true,
      min: Market.min_revenue,
      max: Market.max_revenue,
      values: [ 0, Market.max_revenue ],
      slide: function(event, ui) {
        PriceRangeFilter.min = ui.values[0];
        PriceRangeFilter.max = ui.values[1];
        applyAllFilters();
        $( "#filtered-rev" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });

  $("input.showhide:checkbox").click(function() {
    var name       = $(this).data('property-name');
    var value      = $(this).data('property-value');
    var shouldShow = $(this).attr('checked') || 'unchecked';
    AllPropertyFilters = _.filter(AllPropertyFilters, function(propertyFilter){ return propertyFilter.value != value; });
    var filter = {name: name, value: value, shouldShow: shouldShow}
    AllPropertyFilters.push(filter);
    applyAllFilters();
  });

  var applyAllFilters = function() {
    _.each(Gmaps.map.markers, function(marker) {
      Gmaps.map.hideMarker(marker)
    })
    _.each(visibleMarkers(), function(marker) {
      Gmaps.map.showMarker(marker)
    })
  };

  var visibleMarkers = function() {
    var filtered = _.reject(Gmaps.map.markers, function(marker) {
      return marker.revenue < PriceRangeFilter.min || marker.revenue > PriceRangeFilter.max;
    });
    filtered = _.reject(filtered, function(marker) {
      return marker.days_since < DateRangeFilter.recent || marker.days_since > DateRangeFilter.oldest
    });
    _.each(AllPropertyFilters, function(filter){
      filtered = _.reject(filtered, function(marker) {
        return marker[filter.name] == filter.value && filter.shouldShow == "unchecked"
      });
    });
    return filtered
  };

  var DateRangeFilter = {
    recent: 0,
    oldest: Market.max_days,
  };
  
  $( "#date-range" ).slider({
    range: true,
    min: 0,
    step: 1,
    max: Market.max_days,
    values: [ 0, Market.max_days ],
    slide: function(event, ui) {
      recent_day = Market.max_days - ui.values[1];
      oldest_day = Market.max_days - ui.values[0];
      DateRangeFilter.recent = recent_day;
      DateRangeFilter.oldest = oldest_day;
      var old_date = calculateDate(oldest_day);
      var recent_date = calculateDate(recent_day);
      $( "#filtered-dates" ).val( dateToYMD(old_date) + " - " + dateToYMD(recent_date) );
      applyAllFilters();
    }
  });

  $("#filtered-dates").val(dateToYMD(calculateDate(Market.max_days)) + " - " + dateToYMD(calculateDate(0)))

  function calculateDate(days){
    date = new Date();
    date.setDate(date.getDate() - days );
    return date
  };

  $('#placeme').click(function() {
    var lat = Gmaps.map.userLocation.$a;
    var lng = Gmaps.map.userLocation.ab;
    Gmaps.map.createMarker({Lat: lat,
                  Lng: lng,
                  rich_marker: null,
                  marker_picture: ""
                 });
    });

  $('.bouncepins').click(function() {
    var propName       = $(this).data('property-name');
    var propValue      = $(this).data('property-value');
    _.each(Gmaps.map.markers, function(marker) {
      if(marker[propName] == propValue) {
        Gmaps.map.bounceMarker(marker);
        setTimeout(function() { Gmaps.map.stopMarker(marker); }, 750 * 2);
      }
    });
  });

  function dateToYMD(date){
    var d = date.getDate();
    var m = date.getMonth()+1;
    var y = date.getFullYear();
    return '' + y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d);
  };
});