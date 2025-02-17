
mapboxgl.accessToken = mapToken;
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      center: [coordinate1, coordinate2], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 9 // starting zoom
  });

  const marker = new mapboxgl.Marker({color:"red"})
  .setLngLat([coordinate1, coordinate2]).
  setPopup(new mapboxgl.Popup({offset: 25})
  .setHTML(`<h5>${place}</h5>`))
  .addTo(map);