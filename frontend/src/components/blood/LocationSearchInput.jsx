
import { MdMyLocation } from "react-icons/md";

const LocationSearchInput = ({ formData, setFormData }) => {
  
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coords = `POINT(${lat} ${lng})`;
            setFormData((prev) => ({ ...prev, coordinates: coords }));
        },
        (err) => {
          alert("Please enable location access.");
          console.error(err);
        }
      );
    } else {
      alert("Geolocation not supported");
    }
  };

  return (
    <div className="relative w-2/3">
      <label className="font-bold text-gray-700">
        Location</label>
      <div className="relative">
        <input
          type="text"
          name="coordinates"
          value={formData.coordinates}
          onClick={handleUseMyLocation}
          placeholder="Click location icon"
          className="w-full p-2 pr-10 border rounded"
          readOnly
        />

        <span
          className="absolute inset-y-0 right-0 p-3 flex items-center text-gray-700 cursor-pointer border-2"
          onClick={handleUseMyLocation}
          title="Use current location"
        >
          <MdMyLocation size={25} className="font-bold" />
        </span>
      </div>
    </div>
  );
};

export default LocationSearchInput;
