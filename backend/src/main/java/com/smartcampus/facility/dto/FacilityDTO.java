package com.smartcampus.facility.dto;

import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO {

    private String id;

    @NotBlank(message = "Facility name is required")
    private String name;

    @NotNull(message = "Facility type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private String imageUrl;

    private ResourceStatus status;

    private LocalTime availabilityStartTime;

    private LocalTime availabilityEndTime;
}
