package com.zenni.dating.dto;

import com.zenni.dating.model.InterestType;
import java.time.LocalDateTime;

public class InterestResponse {
    
    private Long id;
    private String name;
    private InterestType type;
    private LocalDateTime createdAt;
    
    // Constructors
    public InterestResponse() {}
    
    public InterestResponse(Long id, String name, InterestType type, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public InterestType getType() { return type; }
    public void setType(InterestType type) { this.type = type; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}