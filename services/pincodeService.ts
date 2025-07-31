export interface PincodeData {
  State: string;
  District: string;
  Country: string;
}

interface PostOffice {
  State: string;
  District: string;
  Country: string;
}

interface PincodeResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[];
}

export const fetchAddressFromPincode = async (pincode: string, country: string = "India"): Promise<PincodeData> => {
  try {
    let apiUrl = "";
    if (country === "India") {
      apiUrl = `https://api.postalpincode.in/pincode/${pincode}`;
    } else if (country === "Malaysia") {
      apiUrl = `https://api.zippopotam.us/MY/${pincode}`;
    } else {
      throw new Error(`Auto-fill not supported for ${country}`);
    }

    const response = await fetch(apiUrl);
    // Handle India response structure
    if (country === "India") {
      const data: PincodeResponse[] = await response.json();
      if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return {
          State: postOffice.State,
          District: postOffice.District,
          Country: postOffice.Country,
        };
      }
    }

    // Handle Malaysia response structure from zippopotam
    if (country === "Malaysia" && response.ok) {
      const dataMy = await response.json();
      if (dataMy && dataMy.places && dataMy.places.length > 0) {
        const place = dataMy.places[0];
        return {
          State: place["state"],
          District: place["place name"],
          Country: dataMy.country,
        };
      }
    }
    throw new Error("Invalid postal code or no data found");
  } catch (error) {
    throw new Error("Failed to fetch address details. Please check your pincode.");
  }
};
