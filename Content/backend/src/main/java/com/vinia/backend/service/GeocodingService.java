package com.vinia.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

    public Optional<double[]> getCoordinates(String address) {
        try {
            String url = NOMINATIM_API + "?q=" + address.replace(" ", "+") + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "VinIA-Geocoding-Service/1.0"); // Required by Nominatim

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());

                if (root.isArray() && root.size() > 0) {
                    JsonNode firstResult = root.get(0);
                    double lat = firstResult.get("lat").asDouble();
                    double lon = firstResult.get("lon").asDouble();
                    return Optional.of(new double[] { lat, lon });
                }
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed for address: " + address + " - " + e.getMessage());
        }
        return Optional.empty();
    }
}
