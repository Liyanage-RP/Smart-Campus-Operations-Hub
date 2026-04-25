package com.smartcampus.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequestDTO {

    @NotBlank(message = "Facility ID is required")
    private String facilityId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must be under 500 characters")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private int expectedAttendees;
}
