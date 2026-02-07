// src/utils/getLocation.js

export default function requestLocationPermission() {
  return new Promise((resolve) => {
    const userAllowed = window.confirm(
      "This app would like to access your location to show nearby e-waste facilities. Allow?"
    );

    if (!userAllowed) {
      resolve(null);
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: [position.coords.longitude, position.coords.latitude],
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        resolve(null);
      }
    );
  });
}
