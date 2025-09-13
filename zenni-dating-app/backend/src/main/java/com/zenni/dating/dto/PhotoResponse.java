package com.zenni.dating.dto;

import java.time.LocalDateTime;

public class PhotoResponse {
    
    private Long id;
    private String url;
    private String caption;
    private Integer orderIndex;
    private Boolean isVerified;
    private Boolean isMain;
    private LocalDateTime createdAt;
    
    // Constructors
    public PhotoResponse() {}
    
    public PhotoResponse(Long id, String url, String caption, Integer orderIndex, 
                        Boolean isVerified, Boolean isMain, LocalDateTime createdAt) {
        this.id = id;
        this.url = url;
        this.caption = caption;
        this.orderIndex = orderIndex;
        this.isVerified = isVerified;
        this.isMain = isMain;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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