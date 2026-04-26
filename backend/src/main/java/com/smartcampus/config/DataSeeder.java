package com.smartcampus.config;

import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database with demo data...");
        seedUsers();
        List<Facility> facilities = seedFacilities();
        seedBookings(facilities);
        log.info("Database seeding complete!");
    }

    private void seedUsers() {
        List<User> users = List.of(
            User.builder()
                .email("admin@smartcampus.edu")
                .password(passwordEncoder.encode("admin123"))
                .name("Dr. Admin User")
                .provider("local")
                .role(Role.ROLE_ADMIN)
                .createdAt(LocalDateTime.now())
                .build(),
            User.builder()
                .email("tech@smartcampus.edu")
                .password(passwordEncoder.encode("tech123"))
                .name("Mike Technician")
                .provider("local")
                .role(Role.ROLE_TECHNICIAN)
                .createdAt(LocalDateTime.now())
                .build(),
            User.builder()
                .email("student@smartcampus.edu")
                .password(passwordEncoder.encode("student123"))
                .name("Jane Student")
                .provider("local")
                .role(Role.ROLE_USER)
                .createdAt(LocalDateTime.now())
                .build(),
            User.builder()
                .email("user2@smartcampus.edu")
                .password(passwordEncoder.encode("user123"))
                .name("Bob Researcher")
                .provider("local")
                .role(Role.ROLE_USER)
                .createdAt(LocalDateTime.now())
                .build()
        );

        userRepository.saveAll(users);
        log.info("Seeded {} users", users.size());
    }

    private List<Facility> seedFacilities() {
        List<Facility> facilities = List.of(
            Facility.builder()
                .name("Main Lecture Hall A")
                .type(ResourceType.LECTURE_HALL)
                .capacity(200)
                .location("Building A, Ground Floor")
                .description("Large lecture hall with tiered seating, projector, and surround sound system.")
                .usageCount(45)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(8, 0))
                .availabilityEndTime(LocalTime.of(20, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Lecture Hall B")
                .type(ResourceType.LECTURE_HALL)
                .capacity(120)
                .location("Building A, First Floor")
                .description("Medium-sized lecture hall with modern AV equipment.")
                .usageCount(28)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(8, 0))
                .availabilityEndTime(LocalTime.of(18, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Computer Lab 1")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Building B, Second Floor")
                .description("Fully equipped computer lab with 40 workstations.")
                .usageCount(62)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(8, 0))
                .availabilityEndTime(LocalTime.of(22, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Electronics Lab")
                .type(ResourceType.LAB)
                .capacity(30)
                .location("Building B, Third Floor")
                .description("Electronics and IoT lab with oscilloscopes and Arduino kits.")
                .usageCount(15)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(9, 0))
                .availabilityEndTime(LocalTime.of(17, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Board Room")
                .type(ResourceType.MEETING_ROOM)
                .capacity(15)
                .location("Admin Building, Fifth Floor")
                .description("Executive board room with video conferencing.")
                .usageCount(34)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(8, 0))
                .availabilityEndTime(LocalTime.of(18, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Study Room 201")
                .type(ResourceType.MEETING_ROOM)
                .capacity(8)
                .location("Library, Second Floor")
                .description("Small group study room with whiteboard.")
                .usageCount(51)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(7, 0))
                .availabilityEndTime(LocalTime.of(23, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("HD Projector - Epson")
                .type(ResourceType.EQUIPMENT)
                .capacity(1)
                .location("IT Department, Room 101")
                .description("Portable HD projector (1080p).")
                .usageCount(12)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(8, 0))
                .availabilityEndTime(LocalTime.of(20, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("3D Printing Lab")
                .type(ResourceType.LAB)
                .capacity(15)
                .location("Engineering Building, First Floor")
                .description("Lab equipped with multiple 3D printers.")
                .usageCount(19)
                .status(ResourceStatus.ACTIVE)
                .availabilityStartTime(LocalTime.of(9, 0))
                .availabilityEndTime(LocalTime.of(21, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build()
        );

        log.info("Seeded {} facilities", facilities.size());
        return facilityRepository.saveAll(facilities);
    }

    private void seedBookings(List<Facility> facilities) {
        if (facilities.isEmpty()) return;

        LocalDate today = LocalDate.now();
        Facility lab = facilities.get(2); // Computer Lab 1
        Facility hall = facilities.get(0); // Main Hall A

        List<Booking> bookings = List.of(
            Booking.builder()
                .facilityId(lab.getId())
                .facilityName(lab.getName())
                .userName("Jane Student")
                .userEmail("student@smartcampus.edu")
                .bookingDate(today)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .status(BookingStatus.APPROVED)
                .purpose("Programming Workshop")
                .build(),
            Booking.builder()
                .facilityId(hall.getId())
                .facilityName(hall.getName())
                .userName("Dr. Admin User")
                .userEmail("admin@smartcampus.edu")
                .bookingDate(today.plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 0))
                .status(BookingStatus.APPROVED)
                .purpose("Guest Lecture")
                .build(),
            Booking.builder()
                .facilityId(lab.getId())
                .facilityName(lab.getName())
                .userName("Bob Researcher")
                .userEmail("user2@smartcampus.edu")
                .bookingDate(today.plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .status(BookingStatus.APPROVED)
                .purpose("Simulation Run")
                .build(),
            Booking.builder()
                .facilityId(facilities.get(4).getId())
                .facilityName(facilities.get(4).getName())
                .userName("Jane Student")
                .userEmail("student@smartcampus.edu")
                .bookingDate(today)
                .startTime(LocalTime.of(13, 0))
                .endTime(LocalTime.of(15, 0))
                .status(BookingStatus.APPROVED)
                .purpose("Board Meeting Sync")
                .build()
        );

        bookingRepository.saveAll(bookings);
        log.info("Seeded {} bookings for calendar availability", bookings.size());
    }
}

}
