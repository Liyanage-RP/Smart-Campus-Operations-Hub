package com.smartcampus.booking.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String facilityId;
    private String facilityName;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;
    private int expectedAttendees;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String adminRemarks;
    private String reviewedBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
