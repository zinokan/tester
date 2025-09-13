package com.zenni.dating.dto;

import java.time.LocalDateTime;

public class MatchResponse {
    
    private Long id;
    private UserResponse user1;
    private UserResponse user2;
    private Boolean isActive;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public MatchResponse() {}
    
    public MatchResponse(Long id, UserResponse user1, UserResponse user2, Boolean isActive, 
                        LocalDateTime lastMessageAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.isActive = isActive;
        this.lastMessageAt = lastMessageAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UserResponse getUser1() { return user1; }
    public void setUser1(UserResponse user1) { this.user1 = user1; }
    
    public UserResponse getUser2() { return user2; }
    public void setUser2(UserResponse user2) { this.user2 = user2; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}