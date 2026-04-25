package com.smartcampus.notification.service;

import com.smartcampus.auth.model.User;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.model.NotificationType;
import com.smartcampus.notification.repository.NotificationRepository;
import com.smartcampus.ticket.model.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public Notification markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }

    // --- Notification triggers ---

    public void notifyBookingApproved(Booking booking) {
        createNotification(
                booking.getUserId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                String.format("Your booking for %s on %s has been approved.",
                        booking.getFacilityName(), booking.getBookingDate()),
                "/bookings"
        );
    }

    public void notifyBookingRejected(Booking booking) {
        createNotification(
                booking.getUserId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                String.format("Your booking for %s on %s was rejected. Reason: %s",
                        booking.getFacilityName(), booking.getBookingDate(),
                        booking.getAdminRemarks() != null ? booking.getAdminRemarks() : "No reason provided"),
                "/bookings"
        );
    }

    public void notifyTicketStatusChanged(Ticket ticket) {
        createNotification(
                ticket.getReporterId(),
                NotificationType.TICKET_STATUS,
                "Ticket Status Updated",
                String.format("Your ticket #%s status changed to %s.",
                        ticket.getId().substring(ticket.getId().length() - 6), ticket.getStatus()),
                "/tickets/" + ticket.getId()
        );
    }

    public void notifyTicketAssigned(Ticket ticket) {
        if (ticket.getAssignedToId() != null) {
            createNotification(
                    ticket.getAssignedToId(),
                    NotificationType.TICKET_ASSIGNED,
                    "Ticket Assigned to You",
                    String.format("You have been assigned to ticket: %s",
                            ticket.getDescription().length() > 50
                                    ? ticket.getDescription().substring(0, 50) + "..."
                                    : ticket.getDescription()),
                    "/tickets/" + ticket.getId()
            );
        }
    }

    public void notifyTicketComment(Ticket ticket, User commenter) {
        // Notify reporter (if commenter is not the reporter)
        if (!ticket.getReporterId().equals(commenter.getId())) {
            createNotification(
                    ticket.getReporterId(),
                    NotificationType.TICKET_COMMENT,
                    "New Comment on Your Ticket",
                    String.format("%s commented on your ticket #%s",
                            commenter.getName(),
                            ticket.getId().substring(ticket.getId().length() - 6)),
                    "/tickets/" + ticket.getId()
            );
        }

        // Notify assigned technician (if exists and not the commenter)
        if (ticket.getAssignedToId() != null && !ticket.getAssignedToId().equals(commenter.getId())) {
            createNotification(
                    ticket.getAssignedToId(),
                    NotificationType.TICKET_COMMENT,
                    "New Comment on Assigned Ticket",
                    String.format("%s commented on ticket #%s",
                            commenter.getName(),
                            ticket.getId().substring(ticket.getId().length() - 6)),
                    "/tickets/" + ticket.getId()
            );
        }
    }

    private void createNotification(String userId, NotificationType type, String title,
                                     String message, String link) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }
}
