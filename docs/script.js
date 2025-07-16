(async function () {
  const res = await fetch('famous_people.json');
  const data = await res.json();
  const markers = Object.entries(data).map(([country, info]) => ({
    lat: info.coords[0],
    lng: info.coords[1],
    name: info.person.replace(/_/g, ' '),
    url: `https://en.wikipedia.org/wiki/${info.person}`
  }));

  const container = document.getElementById('globeViz');
  const globe = new Globe(container)
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
    .backgroundColor('#000000')
    .pointAltitude(0.1)
    .pointColor(() => '#ffcc00')
    .pointLabel(d => d.name)
    .onPointClick(d => window.open(d.url, '_blank'));

  globe.pointsData(markers);
})();
