package com.zenni.dating.dto;

import com.zenni.dating.model.SwipeType;
import jakarta.validation.constraints.NotNull;

public class SwipeRequest {
    
    @NotNull(message = "Swiped user ID is required")
    private Long swipedUserId;
    
    @NotNull(message = "Swipe type is required")
    private SwipeType type;
    
    // Constructors
    public SwipeRequest() {}
    
    public SwipeRequest(Long swipedUserId, SwipeType type) {
        this.swipedUserId = swipedUserId;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getSwipedUserId() { return swipedUserId; }
    public void setSwipedUserId(Long swipedUserId) { this.swipedUserId = swipedUserId; }
    
    public SwipeType getType() { return type; }
    public void setType(SwipeType type) { this.type = type; }
}