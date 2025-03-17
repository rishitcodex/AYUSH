document.addEventListener("DOMContentLoaded", function () {
  if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function (position) {
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;

          console.log("User's Location:", lat, lon);
          document.getElementById("userLocation").textContent = `Your Location: ${lat}, ${lon}`;

          let nurseries = await fetchNurseries(lat, lon);
          console.log("Nearby Nurseries and Plant Shops:", nurseries);

          if (nurseries.length > 0) {
              displayNurseries(nurseries);
          } else {
              document.getElementById("nurseryList").innerHTML = "<p>No nurseries found nearby.</p>";
          }
      });
  } else {
      alert("Geolocation is not supported by your browser.");
  }
});

async function fetchNurseries(lat, lon) {
  const radius = 20000; // 20 km for a broader search
  const query = `[out:json];node[~"shop|amenity"~"nursery|garden_centre|florist|greenhouse"](around:${radius},${lat},${lon});out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
      let response = await fetch(url);
      let data = await response.json();
      return data.elements;
  } catch (error) {
      console.error("Error fetching nursery data:", error);
      return [];
  }
}

function displayNurseries(nurseries) {
  let listContainer = document.getElementById("nurseryList");
  listContainer.innerHTML = "";

  nurseries.forEach((nursery) => {
      let name = nursery.tags.name || "Unnamed Nursery";
      let lat = nursery.lat;
      let lon = nursery.lon;
      let address = nursery.tags["addr:street"] || "Address not available";

      let nurseryItem = `
          <div class="nursery">
              <img src="placeholder.jpg" alt="Nursery Image">
              <div class="nursery-info">
                  <h3>${name}</h3>
                  <p><i class="fas fa-map-marker-alt"></i> ${address}</p>
                  <p>Lat: ${lat}, Lon: ${lon}</p>
                  <button onclick="openMap(${lat}, ${lon})">View on Map</button>
              </div>
          </div>
      `;
      listContainer.innerHTML += nurseryItem;
  });
}

function openMap(lat, lon) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, "_blank");
}
