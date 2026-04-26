package com.smartcampus.ticket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;
    private String title;
    private String category;
    private String description;
    
    private String priority; // LOW, MEDIUM, HIGH
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    
    private String resourceId;
    private String reportedByUserId;
    private String assignedTechnicianId;
    private String rejectionReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
