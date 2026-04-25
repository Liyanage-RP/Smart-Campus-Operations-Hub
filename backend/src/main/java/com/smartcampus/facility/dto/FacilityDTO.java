package com.smartcampus.facility.dto;

import com.smartcampus.facility.model.FacilityStatus;
import com.smartcampus.facility.model.FacilityType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class FacilityDTO {

    private String id;

    @NotBlank(message = "Facility name is required")
    private String name;

    @NotNull(message = "Facility type is required")
    private FacilityType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private String imageUrl;

    private FacilityStatus status;

    private LocalTime availableFrom;

    private LocalTime availableTo;
}
