package com.smartcampus.config;

import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.model.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.facility.model.Facility;
import com.smartcampus.facility.model.FacilityStatus;
import com.smartcampus.facility.model.FacilityType;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database with demo data...");
        seedUsers();
        seedFacilities();
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

    private void seedFacilities() {
        List<Facility> facilities = List.of(
            Facility.builder()
                .name("Main Lecture Hall A")
                .type(FacilityType.LECTURE_HALL)
                .capacity(200)
                .location("Building A, Ground Floor")
                .description("Large lecture hall with tiered seating, projector, and surround sound system. Ideal for large lectures and presentations.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(20, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Lecture Hall B")
                .type(FacilityType.LECTURE_HALL)
                .capacity(120)
                .location("Building A, First Floor")
                .description("Medium-sized lecture hall with modern AV equipment and whiteboard.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Computer Lab 1")
                .type(FacilityType.LAB)
                .capacity(40)
                .location("Building B, Second Floor")
                .description("Fully equipped computer lab with 40 workstations, high-speed internet, and software development tools.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(22, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Electronics Lab")
                .type(FacilityType.LAB)
                .capacity(30)
                .location("Building B, Third Floor")
                .description("Electronics and IoT lab with oscilloscopes, Arduino kits, and soldering stations.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(9, 0))
                .availableTo(LocalTime.of(17, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Board Room")
                .type(FacilityType.MEETING_ROOM)
                .capacity(15)
                .location("Admin Building, Fifth Floor")
                .description("Executive board room with video conferencing, 65-inch display, and ergonomic seating.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Study Room 201")
                .type(FacilityType.MEETING_ROOM)
                .capacity(8)
                .location("Library, Second Floor")
                .description("Small group study room with whiteboard and TV for screen sharing.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(7, 0))
                .availableTo(LocalTime.of(23, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("HD Projector - Epson")
                .type(FacilityType.EQUIPMENT)
                .capacity(1)
                .location("IT Department, Room 101")
                .description("Portable HD projector (1080p) with HDMI and wireless connectivity.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(20, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Professional Camera Kit")
                .type(FacilityType.EQUIPMENT)
                .capacity(1)
                .location("Media Center, Ground Floor")
                .description("Sony A7III camera with lenses, tripod, and lighting kit for academic recording.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(9, 0))
                .availableTo(LocalTime.of(17, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("Seminar Hall C")
                .type(FacilityType.LECTURE_HALL)
                .capacity(80)
                .location("Building C, Ground Floor")
                .description("Seminar hall with round-table layout capability and recording equipment.")
                .imageUrl("")
                .status(FacilityStatus.OUT_OF_SERVICE)
                .availableFrom(LocalTime.of(8, 0))
                .availableTo(LocalTime.of(18, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build(),
            Facility.builder()
                .name("3D Printing Lab")
                .type(FacilityType.LAB)
                .capacity(15)
                .location("Engineering Building, First Floor")
                .description("Lab equipped with multiple 3D printers (FDM & SLA), design workstations, and material storage.")
                .imageUrl("")
                .status(FacilityStatus.ACTIVE)
                .availableFrom(LocalTime.of(9, 0))
                .availableTo(LocalTime.of(21, 0))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build()
        );

        facilityRepository.saveAll(facilities);
        log.info("Seeded {} facilities", facilities.size());
    }
}
