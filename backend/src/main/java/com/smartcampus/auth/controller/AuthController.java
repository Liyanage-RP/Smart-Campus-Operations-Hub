package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.*;
import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateRole(@PathVariable String id,
                                              @RequestBody Map<String, String> body) {
        Role role = Role.valueOf(body.get("role"));
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody ProfileUpdateRequest request) {
        String userId = userService.getCurrentUserId();
        return ResponseEntity.ok(userService.updateUserProfile(userId, request));
    }

    @PatchMapping("/users/{id}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> adminUpdateProfile(@PathVariable String id,
                                                      @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(id, request));
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<UserDTO>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }
}
