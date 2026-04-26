package com.smartcampus.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password; // null for OAuth users

    private String name;

    private String avatarUrl;

    private String phoneNumber;

    private String department;

    private String bio;

    private String provider; // "local" or "google"

    private String providerId; // Google sub ID

    @Builder.Default
    private Role role = Role.ROLE_USER;

    @CreatedDate
    private LocalDateTime createdAt;
}
