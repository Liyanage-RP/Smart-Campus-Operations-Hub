package com.smartcampus.ticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String reporterId;
    private String reporterName;
    private String reporterEmail;

    private String facilityId;
    private String facilityName;

    private String category;
    private String description;

    @Builder.Default
    private TicketPriority priority = TicketPriority.MEDIUM;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String contactPhone;
    private String contactEmail;

    private String resolutionNotes;
    private String rejectionReason;

    private String assignedToId;
    private String assignedToName;

    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
