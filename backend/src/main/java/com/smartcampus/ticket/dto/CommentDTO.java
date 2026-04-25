package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentDTO {

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be under 1000 characters")
    private String content;
}
