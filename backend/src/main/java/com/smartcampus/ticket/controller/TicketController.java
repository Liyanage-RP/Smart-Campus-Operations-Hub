package com.smartcampus.ticket.controller;

import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.service.TicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @RequestPart("ticket") String ticketJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws IOException {

        TicketRequestDTO dto = objectMapper.readValue(ticketJson, TicketRequestDTO.class);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(dto, files));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getMyTickets());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<Ticket>> getAssignedTickets() {
        return ResponseEntity.ok(ticketService.getAssignedTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> rejectTicket(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, body.get("reason")));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.assignTicket(id, body.get("technicianId")));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                              @Valid @RequestBody CommentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, dto));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> updateComment(@PathVariable String ticketId,
                                                 @PathVariable String commentId,
                                                 @Valid @RequestBody CommentDTO dto) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, dto));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(@PathVariable String ticketId,
                                                 @PathVariable String commentId) {
        return ResponseEntity.ok(ticketService.deleteComment(ticketId, commentId));
    }
}
