package com.zenni.dating.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
public class Photo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotBlank(message = "Photo URL is required")
    @Column(nullable = false)
    private String url;
    
    @Column(length = 1000)
    private String caption;
    
    private Integer orderIndex = 0;
    
    private Boolean isVerified = false;
    
    private Boolean isMain = false;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Constructors
    public Photo() {}
    
    public Photo(User user, String url, Integer orderIndex) {
        this.user = user;
        this.url = url;
        this.orderIndex = orderIndex;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    
    public Boolean getIsMain() { return isMain; }
    public void setIsMain(Boolean isMain) { this.isMain = isMain; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}