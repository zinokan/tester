package com.zenni.dating.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "swipes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"swiper_id", "swiped_id"})
})
public class Swipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swiper_id", nullable = false)
    private User swiper;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swiped_id", nullable = false)
    private User swiped;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Swipe type is required")
    private SwipeType type;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Constructors
    public Swipe() {}
    
    public Swipe(User swiper, User swiped, SwipeType type) {
        this.swiper = swiper;
        this.swiped = swiped;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getSwiper() { return swiper; }
    public void setSwiper(User swiper) { this.swiper = swiper; }
    
    public User getSwiped() { return swiped; }
    public void setSwiped(User swiped) { this.swiped = swiped; }
    
    public SwipeType getType() { return type; }
    public void setType(SwipeType type) { this.type = type; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}