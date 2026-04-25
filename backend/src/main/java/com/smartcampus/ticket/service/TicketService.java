package com.smartcampus.ticket.service;

import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.service.UserService;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.service.FacilityService;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.ticket.dto.CommentDTO;
import com.smartcampus.ticket.dto.TicketRequestDTO;
import com.smartcampus.ticket.model.*;
import com.smartcampus.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final FacilityService facilityService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public Ticket createTicket(TicketRequestDTO dto, List<MultipartFile> files) throws IOException {
        User user = userService.getCurrentUserEntity();
        Facility facility = facilityService.getFacilityById(dto.getFacilityId());

        Ticket ticket = Ticket.builder()
                .reporterId(user.getId())
                .reporterName(user.getName())
                .reporterEmail(user.getEmail())
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .contactPhone(dto.getContactPhone())
                .contactEmail(dto.getContactEmail() != null ? dto.getContactEmail() : user.getEmail())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Handle file attachments (max 3)
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new IllegalArgumentException("Maximum 3 attachments allowed per ticket");
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                validateFile(file);
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);

                TicketAttachment attachment = TicketAttachment.builder()
                        .id(UUID.randomUUID().toString())
                        .fileName(file.getOriginalFilename())
                        .filePath(fileName)
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .uploadedAt(LocalDateTime.now())
                        .build();

                ticket.getAttachments().add(attachment);
            }
        }

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getMyTickets() {
        String userId = userService.getCurrentUserId();
        return ticketRepository.findByReporterIdOrderByCreatedAtDesc(userId);
    }

    public List<Ticket> getAllTickets(TicketStatus status, TicketPriority priority) {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();

        if (status != null) {
            tickets = tickets.stream().filter(t -> t.getStatus() == status).toList();
        }
        if (priority != null) {
            tickets = tickets.stream().filter(t -> t.getPriority() == priority).toList();
        }

        return tickets;
    }

    public List<Ticket> getAssignedTickets() {
        String userId = userService.getCurrentUserId();
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(userId);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
    }

    public Ticket updateTicketStatus(String id, TicketStatus status, String notes) {
        Ticket ticket = getTicketById(id);

        validateStatusTransition(ticket.getStatus(), status);

        ticket.setStatus(status);
        if (notes != null) {
            ticket.setResolutionNotes(notes);
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // Send notification
        notificationService.notifyTicketStatusChanged(ticket);

        return saved;
    }

    public Ticket rejectTicket(String id, String reason) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(reason);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketStatusChanged(ticket);

        return saved;
    }

    public Ticket assignTicket(String id, String technicianId) {
        Ticket ticket = getTicketById(id);

        User technician;
        if (technicianId != null && !technicianId.isBlank()) {
            technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", technicianId));
        } else {
            technician = userService.getCurrentUserEntity();
        }

        ticket.setAssignedToId(technician.getId());
        ticket.setAssignedToName(technician.getName());

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketAssigned(ticket);

        return saved;
    }

    public Ticket addComment(String id, CommentDTO dto) {
        Ticket ticket = getTicketById(id);
        User user = userService.getCurrentUserEntity();

        TicketComment comment = TicketComment.builder()
                .id(UUID.randomUUID().toString())
                .authorId(user.getId())
                .authorName(user.getName())
                .authorAvatar(user.getAvatarUrl())
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketComment(ticket, user);

        return saved;
    }

    public Ticket updateComment(String ticketId, String commentId, CommentDTO dto) {
        Ticket ticket = getTicketById(ticketId);
        String userId = userService.getCurrentUserId();

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthorId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(dto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket deleteComment(String ticketId, String commentId) {
        Ticket ticket = getTicketById(ticketId);
        User user = userService.getCurrentUserEntity();

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        // Comment owner or admin can delete
        if (!comment.getAuthorId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        ticket.getComments().removeIf(c -> c.getId().equals(commentId));
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") &&
                !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be under 5MB");
        }
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            default -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    String.format("Cannot transition from %s to %s", current, next));
        }
    }
}
