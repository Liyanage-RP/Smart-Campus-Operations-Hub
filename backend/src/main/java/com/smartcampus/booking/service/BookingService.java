package com.smartcampus.booking.service;

import com.smartcampus.auth.model.User;
import com.smartcampus.auth.service.UserService;
import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.service.FacilityService;
import com.smartcampus.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityService facilityService;
    private final UserService userService;
    private final NotificationService notificationService;

    public Booking createBooking(BookingRequestDTO dto) {
        User user = userService.getCurrentUserEntity();
        Facility facility = facilityService.getFacilityById(dto.getFacilityId());

        // Validate facility is active
        if (facility.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new IllegalArgumentException("Cannot book a facility that is out of service");
        }

        // Validate time range
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for scheduling conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                dto.getFacilityId(), dto.getBookingDate(), dto.getStartTime(), dto.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new ConflictException("This time slot conflicts with an existing booking for " + facility.getName());
        }

        Booking booking = Booking.builder()
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings() {
        String userId = userService.getCurrentUserId();
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getAllBookings(BookingStatus status) {
        if (status != null) {
            return bookingRepository.findByStatus(status);
        }
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    public Booking approveBooking(String id, String remarks) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        User admin = userService.getCurrentUserEntity();
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminRemarks(remarks);
        booking.setReviewedBy(admin.getName());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        // Increment facility usage count
        facilityService.incrementUsageCount(booking.getFacilityId());

        // Send notification
        notificationService.notifyBookingApproved(booking);

        return saved;
    }

    public Booking rejectBooking(String id, String remarks) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        User admin = userService.getCurrentUserEntity();
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminRemarks(remarks);
        booking.setReviewedBy(admin.getName());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        // Send notification
        notificationService.notifyBookingRejected(booking);

        return saved;
    }

    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);
        String userId = userService.getCurrentUserId();

        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }
}
