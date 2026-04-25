package com.smartcampus.ticket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {

    private String id;
    private String fileName;
    private String filePath;
    private String contentType;
    private long fileSize;
    private LocalDateTime uploadedAt;
}
