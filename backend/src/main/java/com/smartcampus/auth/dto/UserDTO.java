package com.smartcampus.auth.dto;

import com.smartcampus.auth.model.Role;
import com.smartcampus.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String name;
    private String avatarUrl;
    private String provider;
    private Role role;

    public static UserDTO fromUser(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .provider(user.getProvider())
                .role(user.getRole())
                .build();
    }
}
