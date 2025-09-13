package com.zenni.dating.dto;

import com.zenni.dating.model.MessageType;
import java.time.LocalDateTime;

public class MessageResponse {
    
    private Long id;
    private Long matchId;
    private UserResponse sender;
    private String content;
    private MessageType type;
    private String attachmentUrl;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    
    // Constructors
    public MessageResponse() {}
    
    public MessageResponse(Long id, Long matchId, UserResponse sender, String content, 
                          MessageType type, String attachmentUrl, Boolean isRead, 
                          LocalDateTime readAt, LocalDateTime createdAt) {
        this.id = id;
        this.matchId = matchId;
        this.sender = sender;
        this.content = content;
        this.type = type;
        this.attachmentUrl = attachmentUrl;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    
    public UserResponse getSender() { return sender; }
    public void setSender(UserResponse sender) { this.sender = sender; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}