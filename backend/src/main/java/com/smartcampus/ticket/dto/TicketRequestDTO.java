package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketRequestDTO {

    @NotBlank(message = "Facility ID is required")
    private String facilityId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be under 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String contactPhone;
    private String contactEmail;
}
